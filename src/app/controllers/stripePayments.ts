// import { type Request, type Response } from "express";
// import { validationResult } from "express-validator";
// import Stripe from "stripe";
// import { handlePaymentSuccess } from "./payments";
// import { env } from "../utils/Env";
// import { AppDataSource } from "../../database/data-source";
// import axios from "axios";

// let App_Url = env.APP_URL;

// const endpointSecret =
// 	"whsec_9546c7b5a97573be5075474180fc005dcec92d7fe7b44999142737740279839f";

// const stripe = new Stripe(
// 	"sk_test_51PTNMFAi7XEDUyH1L1bYzVg7prblnkFqSnF989p9efDM7Dg9AuwOcT0WakvaXXcN3EIKTb71Z3xlXeOEfwDWvCoG00zZi6xp82",
// 	{
// 		apiVersion: "2024-04-10"
// 	}
// );

// export const CreateCheckoutSession = async (req: Request, res: Response) => {
// 	const errors = validationResult(req);
// 	if (!errors.isEmpty()) {
// 		return res.status(400).json({ errors: errors.array() });
// 	}

// 	try {
// 		const { price_id, attorney_id } = req.body;

// 		const session = await stripe.checkout.sessions.create({
// 			payment_method_types: ["card", "boleto"],
// 			mode: "subscription",
// 			line_items: [
// 				{
// 					price: price_id,
// 					quantity: 1
// 				}
// 			],
// 			metadata: {
// 				attorney_id: String(attorney_id)
// 			},
// 			success_url: `${App_Url}/return?session_id={CHECKOUT_SESSION_ID}`,
// 			cancel_url: `${App_Url}/assinaturas`
// 		});

// 		// Generate the success URL with the session ID
// 		const successUrl = `${App_Url}/return?session_id=${session.id}`;

// 		res.send({
// 			sessionId: session.id,
// 			url: session.url,
// 			successUrl: successUrl
// 		});
// 	} catch (error) {
// 		console.error("Error creating Checkout Session:", error);
// 		res.status(500).json({
// 			message: "Erro interno ao criar a sessão de checkout."
// 		});
// 	}
// };

// export const CreatePaymentIntent = async (req: Request, res: Response) => {
// 	const errors = validationResult(req);
// 	if (!errors.isEmpty()) {
// 		return res.status(400).json({ errors: errors.array() });
// 	}

// 	try {
// 		const { amount, currency } = req.body;

// 		const paymentIntent = await stripe.paymentIntents.create({
// 			amount: amount,
// 			currency: currency,
// 			payment_method_types: ["card", "boleto"]
// 		});

// 		res.send({ clientSecret: paymentIntent.client_secret });
// 	} catch (error) {
// 		console.error("Error creating PaymentIntent:", error);
// 		res.status(500).json({
// 			message: "Erro interno ao criar PaymentIntent."
// 		});
// 	}
// };

// export const updateSubscriptionPlan = async (req: Request, res: Response) => {
// 	const { subscriptionId, newPriceId, attorneyId } = req.body;

// 	if (!subscriptionId || !newPriceId || !attorneyId) {
// 		return res.status(400).json({
// 			message: "Subscription ID, new Price ID, and Attorney ID are required"
// 		});
// 	}

// 	try {
// 		// Recuperar a assinatura atual do Stripe
// 		const subscription = await stripe.subscriptions.retrieve(subscriptionId);

// 		// Atualizar a assinatura com o novo preço
// 		const updatedSubscription = await stripe.subscriptions.update(
// 			subscriptionId,
// 			{
// 				items: [
// 					{
// 						id: subscription.items.data[0].id,
// 						price: newPriceId
// 					}
// 				]
// 			}
// 		);

// 		// URL do webservice que enviará o e-mail
// 		const emailWebserviceUrl =
// 			process.env.APP_UTIL_API_URL + "/payment-upgrade";

// 		// Dados a serem enviados para o webservice
// 		const postData = {
// 			attorney_id: attorneyId,
// 			subscription_id: subscriptionId
// 		};

// 		try {
// 			// Chamar o webservice para enviar o e-mail
// 			const emailResult = await axios.post(emailWebserviceUrl, postData);

// 			if (emailResult.status === 200) {
// 				return res.json({
// 					message: "Subscription updated successfully, and email sent.",
// 					updatedSubscription
// 				});
// 			} else {
// 				return res.status(500).json({
// 					message:
// 						"Subscription updated successfully, but failed to send email."
// 				});
// 			}
// 		} catch (emailError) {
// 			console.error(
// 				"Erro ao chamar o webservice de envio de e-mail:",
// 				emailError
// 			);
// 			return res.status(500).json({
// 				message:
// 					"Subscription updated successfully, but internal error occurred while sending email."
// 			});
// 		}
// 	} catch (error) {
// 		console.error("Error updating subscription:", error);
// 		res.status(500).json({ message: "Internal Server Error" });
// 	}
// };

// export const getSessionStatus = async (req: Request, res: Response) => {
// 	try {
// 		const sessionId = req.query.session_id as string;

// 		if (!sessionId) {
// 			return res.status(400).json({ message: "Session ID is required" });
// 		}

// 		const session = await stripe.checkout.sessions.retrieve(sessionId, {
// 			expand: ["payment_intent"]
// 		});

// 		if (session.status === "complete") {
// 			const paymentSuccess: any = await handlePaymentSuccess(session);

// 			if (paymentSuccess) {
// 				const attorney_id = paymentSuccess.savedSubscription.attorney_id;
// 				const subscription_id =
// 					paymentSuccess.savedSubscription.subscription_id;

// 				// URL do webservice que enviará o e-mail
// 				const emailWebserviceUrl =
// 					process.env.APP_UTIL_API_URL + "/payment-confirmation";

// 				// Dados a serem enviados para o webservice
// 				const postData = {
// 					attorney_id: attorney_id,
// 					subscription_id: subscription_id
// 				};

// 				const maxRetries = 3;
// 				let attempts = 0;
// 				let emailSent = false;

// 				while (attempts < maxRetries && !emailSent) {
// 					try {
// 						const emailResult = await axios.post(emailWebserviceUrl, postData);

// 						if (emailResult.status === 200) {
// 							emailSent = true;
// 							return res.json({
// 								status: session.status,
// 								payment_status: session.payment_status,
// 								customer_email: session.customer_details?.email,
// 								paymentSuccess,
// 								message: "Email de confirmação enviado com sucesso."
// 							});
// 						} else {
// 							attempts++;
// 						}
// 					} catch (emailError) {
// 						attempts++;
// 						if (attempts >= maxRetries) {
// 							console.error(
// 								"Erro ao chamar o webservice de envio de e-mail após múltiplas tentativas:",
// 								emailError
// 							);
// 							return res.status(500).json({
// 								message:
// 									"Erro interno ao enviar e-mail de confirmação de pagamento após múltiplas tentativas."
// 							});
// 						}
// 						// Aguardar um pouco antes de tentar novamente
// 						await new Promise(resolve => setTimeout(resolve, 2000));
// 					}
// 				}
// 			}
// 		} else {
// 			return res.status(400).json({ message: "Sessão não está completa." });
// 		}
// 	} catch (error) {
// 		console.error("Error retrieving session status:", error);
// 		return res.status(500).json({
// 			message: "Erro interno ao obter o status da sessão."
// 		});
// 	}
// };

// export const getSubscriptionStatus = async (req: Request, res: Response) => {
// 	try {
// 		const subscriptionId = req.params.subscriptionId;

// 		if (!subscriptionId) {
// 			return res.status(400).json({ message: "Subscription ID is required" });
// 		}

// 		// Recuperar os dados da assinatura da Stripe
// 		const subscription = await stripe.subscriptions.retrieve(subscriptionId);

// 		// Atualizar o status e a data de término da assinatura no banco de dados

// 		res.send({
// 			status: subscription.status,
// 			current_period_end: subscription.current_period_end,
// 			customer: subscription.customer,
// 			items: subscription.items.data
// 		});
// 	} catch (error) {
// 		console.error("Error retrieving subscription status:", error);
// 		res.status(500).json({
// 			message: "Erro interno ao obter o status da assinatura."
// 		});
// 	}
// };

// export const cancelSubscription = async (req: Request, res: Response) => {
// 	const { subscriptionId, attorneyId } = req.body;

// 	if (!subscriptionId || !attorneyId) {
// 		return res
// 			.status(400)
// 			.json({ message: "Subscription ID and Attorney ID are required" });
// 	}

// 	try {
// 		const canceledSubscription =
// 			await stripe.subscriptions.cancel(subscriptionId);

// 		// URL do webservice que enviará o e-mail
// 		const emailWebserviceUrl = process.env.APP_UTIL_API_URL + "/payment-cancel";

// 		// Dados a serem enviados para o webservice
// 		const postData = {
// 			attorney_id: attorneyId
// 		};

// 		try {
// 			// Chamar o webservice para enviar o e-mail
// 			const emailResult = await axios.post(emailWebserviceUrl, postData);

// 			if (emailResult.status === 200) {
// 				return res.json({
// 					message: "Subscription canceled successfully, and email sent.",
// 					canceledSubscription
// 				});
// 			} else {
// 				return res.status(500).json({
// 					message:
// 						"Subscription canceled successfully, but failed to send email."
// 				});
// 			}
// 		} catch (emailError) {
// 			console.error(
// 				"Erro ao chamar o webservice de envio de e-mail:",
// 				emailError
// 			);
// 			return res.status(500).json({
// 				message:
// 					"Subscription canceled successfully, but internal error occurred while sending email."
// 			});
// 		}
// 	} catch (error) {
// 		console.error("Error canceling subscription:", error);
// 		res.status(500).json({ message: "Internal Server Error" });
// 	}
// };
