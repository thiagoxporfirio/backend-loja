import { type Request, type Response } from "express";
import { AppDataSource } from "../../database/data-source";
import { User } from "../entity/User";
import bcrypt from "bcrypt";
import { Attorneys } from "../entity/Attorneys";
import { Causes } from "../entity/Causes";
import { Addresses } from "../entity/Addresses";
import { Click } from "../entity/Clicks";
import { Notification } from "../entity/Notifications";
import { Contacts } from "../entity/Contacts";
import { Subscription } from "../entity/Subscription";
import axios from "axios";

const APP_URL_API = process.env.APP_URL_API;

export async function createUser(request: Request, response: Response) {
	try {
		const { name, email, cpf_cnpj, password } = request.body;

		const nameRegex = /^[a-zA-Z\s]+$/;
		if (!nameRegex.test(name)) {
			return response.status(400).json("O nome deve conter apenas letras");
		}

		if (password.length < 8) {
			return response
				.status(400)
				.json("A senha deve ter pelo menos 8 caracteres");
		}

		const cpfCnpjRegex = /^\d+$/;
		if (!cpfCnpjRegex.test(cpf_cnpj)) {
			return response.status(400).json("CPF/CNPJ deve conter apenas números");
		}

		const userRepository = AppDataSource.getRepository(User);

		// Verificar se já existe um usuário com o mesmo cpf_cnpj
		const existingCpf_Cnpj = await userRepository.findOneBy({ cpf_cnpj });
		if (existingCpf_Cnpj) {
			return response.status(409).json("CPF ou CNPJ ja existe");
		}

		// Verificar se já existe um usuário com o mesmo e-mail
		const existingEmail = await userRepository.findOneBy({ email });
		if (existingEmail) {
			return response.status(409).json("E-mail já registrado");
		}

		const salt = await bcrypt.genSalt(12);
		let hashedPassword = await bcrypt.hash(password, salt);
		hashedPassword = hashedPassword.replace(/^\$2b/, "$2y");
		// Cria uma nova instância do usuário
		const user = new User();
		user.id = null;
		user.name = name;
		user.email = email;
		user.email_verified_at = null;
		user.password_reset_count = 0;
		user.password = hashedPassword;
		user.cpf_cnpj = cpf_cnpj;
		user.created_at = new Date();
		user.updated_at = new Date();

		await userRepository.save(user);
		return response.status(201).json({
			id: user.id,
			message: "Usuário criado com sucesso!"
		});
	} catch (error) {
		console.log(error);
		return response.status(500).send("Internal Server Error: " + error?.detail);
	}
}

export async function createNewUser({ name, email, password, cpf_cnpj }) {
	try {
		const userRepository = AppDataSource.getRepository(User);

		const salt = await bcrypt.genSalt(12);
		let hashedPassword = await bcrypt.hash(password, salt);
		hashedPassword = hashedPassword.replace(/^\$2b/, "$2y");

		const user = new User();
		user.name = name;
		user.email = email;
		user.password = hashedPassword;
		user.cpf_cnpj = cpf_cnpj;
		user.email_verified_at = null;
		user.created_at = new Date();
		user.updated_at = new Date();

		await userRepository.save(user);
		return user;
	} catch (error) {
		console.error(error);
		return null;
	}
}

export async function updateUser(request: Request, response: Response) {
	try {
		const id = Number(request.params.id);
		const { name, email, cpf_cnpj } = request.body;

		if (isNaN(id)) {
			return response.status(400).json("Invalid user ID");
		}

		const nameRegex = /^[a-zA-Z\s]+$/;
		if (!nameRegex.test(name)) {
			return response.status(400).json("O nome deve conter apenas letras");
		}

		// const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
		// if (!emailRegex.test(email)) {
		// 	return response.status(400).json("E-mail inválido");
		// }

		const cpfCnpjRegex = /^\d+$/;
		if (!cpfCnpjRegex.test(cpf_cnpj)) {
			return response.status(400).json("CPF/CNPJ deve conter apenas números");
		}

		const userRepository = AppDataSource.getRepository(User);

		// Buscar usuário pelo ID
		const user = await userRepository.findOneBy({ id });
		if (!user) {
			return response.status(404).json("Usuário não encontrado");
		}

		if (name) user.name = name;
		if (email) user.email = email;
		if (cpf_cnpj) user.cpf_cnpj = cpf_cnpj;
		user.updated_at = new Date();

		await userRepository.save(user);

		return response
			.status(200)
			.json("Dados do usuário atualizados com sucesso");
	} catch (error) {
		console.log(error);
		return response.status(500).send("Internal Server Error");
	}
}

export async function getUser(request: Request, response: Response) {
    const userId = Number(request.params.id);

    try {
        const userRepository = AppDataSource.getRepository(User);
        const attorneysRepository = AppDataSource.getRepository(Attorneys);
        const subscriptionRepository = AppDataSource.getRepository(Subscription);

        const user = await userRepository.findOne({
            where: { id: userId },
            relations: ["attorney"]
        });

        if (!user) {
            return response.status(404).send("User not found");
        }

        const userData = {
            id: user.id,
            name: user.name,
            cpf_cnpj: user.cpf_cnpj,
            email: user.email,
            photo: user.photo,
            email_verified_at: user.email_verified_at,
            password_reset_count: user.password_reset_count,
            created_at: user.created_at,
            updated_at: user.updated_at,
            attorney: null
        };

        const attorneyData = await attorneysRepository.findOne({
            where: { user_id: userId },
            relations: ["subscriptions"]
        });

        if (attorneyData) {
            const subscriptionData = await subscriptionRepository.findOne({
                where: { attorney_id: attorneyData.user_id },
                order: { created_at: "DESC" } // Obtendo a assinatura mais recente
            });

            if (subscriptionData) {
                try {
                    const subscriptionStatusResponse = await axios.get(`${APP_URL_API}/subscription-status/${subscriptionData.subscription_id}`);
                    const subscriptionStatusData = subscriptionStatusResponse.data;

                    userData.attorney = {
                        id: attorneyData.user_id,
                        oab: attorneyData.oab,
                        state: attorneyData.state,
                        status: attorneyData.status,
                        resume: attorneyData.resume,
                        rating: attorneyData.rating,
                        photo: attorneyData.photo,
                        subscription: {
                            id: subscriptionData.id,
                            subscription: subscriptionData.subscription_id,
                            created_at: subscriptionData.created_at,
                            updated_at: subscriptionData.updated_at,
                            deleted_at: subscriptionData.deleted_at,
                            payment_platform: subscriptionData.payment_platform,
                            payment_platform_status: subscriptionData.payment_platform_status,
                            status: subscriptionStatusData.status,
                            ends_at: new Date(subscriptionStatusData.current_period_end * 1000), // Convertendo timestamp para Date
                            stripe_details: subscriptionStatusData
                        }
                    };
                } catch (error) {
                    // console.error("Error retrieving subscription status from Stripe:", error);
                }
            } else {
                userData.attorney = {
                    id: attorneyData.user_id,
                    oab: attorneyData.oab,
                    state: attorneyData.state,
                    status: attorneyData.status,
                    resume: attorneyData.resume,
                    rating: attorneyData.rating,
                    photo: attorneyData.photo,
                    subscription: null
                };
            }
        }

        return response.json(userData);
    } catch (error) {
        console.error(error);
        return response.status(500).send("Internal Server Error");
    }
}

export async function deleteUser(request: Request, response: Response) {
	try {
		const userId = Number(request.params.id);

		if (isNaN(userId)) {
			return response.status(400).json({ message: "Invalid user ID" });
		}

		await AppDataSource.transaction(async entityManager => {
			// Primeiro, deleta todas as notificações relacionadas ao usuário
			await entityManager
				.createQueryBuilder()
				.delete()
				.from(Notification)
				.where("user_id = :userId", { userId })
				.execute();

			// Depois deleta outros registros que possam estar relacionados ao usuário
			await entityManager
				.createQueryBuilder()
				.delete()
				.from(Causes)
				.where("user_id = :userId", { userId })
				.execute();

			await entityManager
				.createQueryBuilder()
				.delete()
				.from(Attorneys)
				.where("user_id = :userId", { userId })
				.execute();

			await entityManager.delete(Contacts, { user_id: userId });
			await entityManager.delete(Addresses, { user_id: userId });

			// Finalmente, deleta o usuário
			await entityManager
				.createQueryBuilder()
				.delete()
				.from(User)
				.where("id = :userId", { userId })
				.execute();
		});

		return response.status(200).json({ message: "Usuário deletado!" });
	} catch (error) {
		console.error("Error deleting user:", error);
		if (!response.headersSent) {
			return response.status(500).send("Internal Server Error");
		}
	}
}
