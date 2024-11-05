import { type Request, type Response } from "express";
import { AppDataSource } from "../../database/data-source";
import { User } from "../entity/User";
import { Attorneys } from "../entity/Attorneys";
import { cadastraToken } from "../../config/JwtConfig";
import bcrypt from "bcrypt";
import { Subscription } from "../entity/Subscription";
import { Companies } from "../entity/Companies";

export async function loginUser(request: Request, response: Response) {
	try {
		const { email, password } = request.body;

		const userRepository = AppDataSource.getRepository(User);
		const attorneysRepository = AppDataSource.getRepository(Attorneys);
		const companiesRepository = AppDataSource.getRepository(Companies);
		const subscriptionRepository = AppDataSource.getRepository(Subscription);

		const user = await userRepository.findOneBy({ email });
		let userData = null;
		let token = null;

		if (user) {
			const passwordHash = user.password.replace(/^\$2y/, "$2b");
			const isPasswordValid = await bcrypt.compare(password, passwordHash);

			if (!isPasswordValid) {
				return response.status(401).json({ message: "Senha inválida" });
			}

			// Verificar se o usuário é um advogado
			const attorney = await attorneysRepository.findOne({
				where: { user_id: user.id },
				relations: ["subscriptions"]
			});

			// Buscar a assinatura do advogado, se existir
			let subscriptionData = null;
			if (attorney) {
				subscriptionData = await subscriptionRepository.findOne({
					where: { attorney_id: attorney.user_id },
					order: { created_at: "DESC" }
				});
			}

			token = cadastraToken({ id: user.id });

			userData = {
				status: "Logado",
				id: user.id,
				photo: user.photo,
				name: user.name,
				cpf_cnpj: user.cpf_cnpj,
				email: user.email,
				attorneyData: attorney
					? {
							oab: attorney.oab,
							state: attorney.state,
							status: attorney.status,
							photo: attorney.photo,
							rating: attorney.rating,
							resume: attorney.resume,
							subscription: subscriptionData
								? {
										id: subscriptionData.id,
										subscription: subscriptionData.subscription_id,
										created_at: subscriptionData.created_at,
										updated_at: subscriptionData.updated_at,
										deleted_at: subscriptionData.deleted_at,
										payment_platform: subscriptionData.payment_platform,
										payment_platform_status:
											subscriptionData.payment_platform_status,
										status: subscriptionData.status,
										ends_at: subscriptionData.ends_at
									}
								: null
						}
					: null,
				companyData: null // Adiciona companyData como null quando não for uma empresa
			};
		} else {
			const company = await companiesRepository.findOneBy({ email });
			if (company) {
				const passwordHash = company.password.replace(/^\$2y/, "$2b");
				const isPasswordValid = await bcrypt.compare(password, passwordHash);

				if (!isPasswordValid) {
					return response.status(401).json({ message: "Senha inválida" });
				}

				token = cadastraToken({ id: company.id });

				userData = {
					status: "Logado",
					id: company.id,
					name: company.name,
					cpf_cnpj: company.cnpj,
					email: company.email,
					companyData: {
						razao_social: company.razao_social,
						phone: company.phone,
						inscricao_estadual: company.inscricao_estadual,
						inscricao_municipal: company.inscricao_municipal,
						cep: company.cep,
						address: company.address,
						number: company.number,
						complement: company.complement,
						neighborhood: company.neighborhood,
						city: company.city,
						state: company.state,
						country: company.country
					},
					attorneyData: null // Adiciona attorneyData como null quando for uma empresa
				};
			} else {
				return response.status(404).json("Usuário ou Companhia não encontrado");
			}
		}

		return response.status(200).json({ token, userData });
	} catch (error) {
		console.error(error);
		return response.status(500).send("Internal Server Error");
	}
}
