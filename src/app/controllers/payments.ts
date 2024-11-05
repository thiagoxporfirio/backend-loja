import { type Request, type Response } from "express";
import { AppDataSource } from "../../database/data-source";
import { XMLParser } from "fast-xml-parser";
import AxiosAdapter from "../utils/AxiosAdapter";
import { planos } from "../../config/paymentsConfig";
import axios from "axios";
import Stripe from "stripe";
import { Payment } from "../entity/Payments";
import { Subscription } from "../entity/Subscription";

//Stripe >>>>>
const stripe = new Stripe(
	"sk_test_51PO4BZP1XebAME3qEFfMKi5roJB9TgVJDDZVEyMcJ9Ot7YR7MKCddkYo36fbfjqnZZtwJC9qnny0u7IXHeqkuABT00J52G3ijM",
	{
		apiVersion: "2024-04-10"
	}
);

export const handlePaymentSuccess = async session => {
	const paymentRepository = AppDataSource.getRepository(Payment);
	const subscriptionRepository = AppDataSource.getRepository(Subscription);

	try {
		// Verificar se já existe uma assinatura para o attorney_id
		const existingSubscription = await subscriptionRepository.findOne({
			where: { attorney_id: parseInt(session.metadata.attorney_id, 10) }
		});

		let isUpgrade = false;
		let savedSubscription;

		if (existingSubscription) {
			// Atualizar a assinatura existente
			existingSubscription.payment_platform = "stripe";
			existingSubscription.payment_platform_status = session.payment_status;
			existingSubscription.status = "active";
			existingSubscription.subscription_id = session.subscription;
			existingSubscription.updated_at = new Date();
			const createdAt = new Date(existingSubscription.created_at);
			const endsAt = new Date(createdAt.setDate(createdAt.getDate() + 30));
			existingSubscription.ends_at = endsAt;

			savedSubscription =
				await subscriptionRepository.save(existingSubscription);
			isUpgrade = true;
		} else {
			// Criar uma nova assinatura
			const subscription = new Subscription();
			subscription.attorney_id = parseInt(session.metadata.attorney_id, 10);
			subscription.payment_platform = "stripe";
			subscription.payment_platform_status = session.payment_status;
			subscription.status = "active";
			subscription.subscription_id = session.subscription;
			subscription.created_at = new Date();
			subscription.updated_at = new Date();
			const createdAt = new Date(subscription.created_at);
			const endsAt = new Date(createdAt.setDate(createdAt.getDate() + 30));
			subscription.ends_at = endsAt;

			savedSubscription = await subscriptionRepository.save(subscription);
		}

		// Obter o método de pagamento utilizado
		let paymentMethod = "unknown";
		if (session.payment_method_options && session.payment_method_options.card) {
			paymentMethod = "card";
		} else if (
			session.payment_method_options &&
			session.payment_method_options.boleto
		) {
			paymentMethod = "boleto";
		} else if (
			session.payment_method_options &&
			session.payment_method_options.pix
		) {
			paymentMethod = "pix";
		}

		// Criar o pagamento
		const payment = new Payment();
		payment.created_at = new Date();
		payment.updated_at = new Date();
		payment.transaction_id = session.id;
		payment.status = session.status;
		payment.payment_method = paymentMethod;
		payment.paid_status = session.payment_status as string;
		payment.raw = JSON.stringify(session);
		payment.subscription_id = savedSubscription.id;
		payment.card_brand = "card";
		payment.card_last_four = "1234";
		payment.id = savedSubscription.id;

		await paymentRepository.save(payment);

		return { savedSubscription, isUpgrade };
	} catch (error) {
		console.error("Error handling payment success:", error);
		throw new Error("Failed to handle payment success");
	}
};

//Pagbank >>>>>
const AUTH_TOKEN = "B568BF52152E4110848074AC80EA129F";
const AUTH_TOKEN2 =
	"e69d213d-4339-44f0-b019-10ef364400464cd1bac046b98932faf068c9ef2b0c9824a5-1cbe-48ec-8d1b-9cdfeeee58ab";
const API_URL = "https://sandbox.api.assinaturas.pagseguro.com/plans";

export async function createPlans(request: Request, response: Response) {
	const {
		reference_id,
		name,
		description,
		amount,
		currency,
		interval,
		payment_methods
	} = request.body;

	const planData = {
		reference_id,
		name,
		description,
		amount: {
			value: amount,
			currency: currency || "BRL"
		},
		interval: {
			unit: interval.unit || "MONTH",
			length: interval.length || 1
		},
		payment_method: payment_methods || ["CREDIT_CARD", "BOLETO", "PIX"]
	};

	try {
		const resp = await axios.post(API_URL, planData, {
			headers: {
				Authorization: `Bearer ${AUTH_TOKEN}`,
				"Content-Type": "application/json",
				"x-idempotency-key": `${reference_id}-${Date.now()}`
			}
		});

		return response.status(200).json({
			message: "Plano criado com sucesso!",
			data: resp.data
		});
	} catch (error) {
		console.error(
			"Erro ao criar o plano:",
			error.response ? error.response.data : error.message
		);
		return response.status(500).json({
			message: "Erro ao criar o plano",
			error: error.response ? error.response.data : error.message
		});
	}
}
