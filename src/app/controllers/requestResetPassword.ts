import { type Request, type Response } from "express";
import { AppDataSource } from "../../database/data-source";
import { User } from "../entity/User";
import { randomBytes } from "crypto";
import { env } from "../utils/Env";
import bcrypt from "bcrypt";
import axios from "axios";

export async function requestResetPassword(
	request: Request,
	response: Response
) {
	try {
		const { email } = request.body;

		const userRepository = AppDataSource.getRepository(User);

		const existingUser = await userRepository.findOneBy({ email });

		if (existingUser) {
			const token = randomBytes(6).toString("hex");

			existingUser.remember_token = token;
			await userRepository.save(existingUser);

			const resetPasswordUrl =  env.APP_URL+`/auth/reset-password/${token}`;
			//TODO:alterar a url para a API do admin
			const resetPasswordServiceUrl =  env.APP_UTIL_API_URL+ "/reset-password";

			const postData = {
				url: resetPasswordUrl,
				email: email
			};

			// E então enviar um e-mail para o usuário com o token ou um link para redefinir a senha
			const result = await axios.post(resetPasswordServiceUrl, postData);

			if (result.status === 200) {
				response.status(200).json({
					token,
					message: "E-mail de redefinição de senha enviado."
				});
			} else {
				response
					.status(500)
					.json({ message: "Erro ao enviar e-mail de redefinição de senha." });
			}
		} else {
			response.status(404).json({ message: "Usuário não encontrado" });
		}
	} catch (error) {
		console.error("Error aqui:", error);
		if(!env.isProduction){
			response
				.status(500)
				.json({ message: "Erro ao solicitar redefinição de senha" , data:error, 'apiUrl':process.env.APP_UTIL_API_URL});
		}else{
			response
				.status(500)
				.json({ message: "Erro ao solicitar redefinição de senha" });
		}

	}
}

export async function resetPassword(request: Request, response: Response) {
	try {
		const { remember_token, password } = request.body;

		if (password.length < 8) {
			return response
				.status(400)
				.json("A senha deve ter pelo menos 8 caracteres");
		}

		const userRepository = AppDataSource.getRepository(User);

		const userWithToken = await userRepository.findOneBy({ remember_token });

		if (userWithToken) {
			// Hash da nova senha
			const salt = await bcrypt.genSalt(12);
			let hashedPassword = await bcrypt.hash(password, salt);
			hashedPassword = hashedPassword.replace(/^\$2b/, "$2y");
			// Atualizar a senha do usuário no banco de dados
			userWithToken.password = hashedPassword;
			// Invalidar o token de redefinição de senha após o uso
			userWithToken.remember_token = null;

			await userRepository.save(userWithToken);

			response.status(200).json({ message: "Senha redefinida com sucesso" });
		} else {
			response.status(404).json({ message: "Token inválido ou expirado" });
		}
	} catch (error) {
		console.error(error);
		response.status(500).json({ message: "Erro ao redefinir a senha" });
	}
}

export async function updatePassword(request: Request, response: Response) {
	try {
		const { user_id, old_password, new_password } = request.body;

		if (!new_password || new_password.length < 8) {
			return response
				.status(400)
				.json({ message: "A nova senha deve ter pelo menos 8 caracteres." });
		}

		const userRepository = AppDataSource.getRepository(User);

		const user = await userRepository.findOneBy({ id: user_id });

		if (!user) {
			return response.status(404).json({ message: "Usuário não encontrado." });
		}

		const hashedOldPassword = user.password.replace(/^\$2y/, "$2b");
		const isOldPasswordValid = await bcrypt.compare(
			old_password,
			hashedOldPassword
		);
		if (!isOldPasswordValid) {
			return response.status(401).json({ message: "Senha antiga inválida." });
		}

		const salt = await bcrypt.genSalt(12);
		let hashedPassword = await bcrypt.hash(new_password, salt);
		hashedPassword = hashedPassword.replace(/^\$2b/, "$2y");
		// Atualizar a senha do usuário no banco de dados
		user.password = hashedPassword;
		user.password_reset_count += 1;
		await userRepository.save(user);

		response.status(200).json({ message: "Senha atualizada com sucesso." });
	} catch (error) {
		console.error(error);
		response.status(500).json({ message: "Erro ao atualizar a senha." });
	}
}

// {Verificação de e-mail}
export async function sendVerificationEmail(
	request: Request,
	response: Response
) {
	try {
		const { email } = request.body;

        const userRepository = AppDataSource.getRepository(User);
        const user = await userRepository.findOneBy({ email });

        if (!user) {
            return response.status(404).json({ message: "E-mail não cadastrado em nossa base de dados." });
        }
		
		const token = randomBytes(6).toString("hex");
		user.remember_token = token;
		user.email_verified_at = null;

		await userRepository.save(user);

		// URL do webservice que enviará o e-mail
		const verificationEmailServiceUrl =  process.env.APP_UTIL_API_URL+  "/validate-email";

		// Dados a serem enviados para o webservice
		const postData = {
			email: email,
			hash: token,
			url: `${process.env.APP_URL}/verify-email?token=${token}`
		};

		// Chamar o webservice para enviar o e-mail
		const result = await axios.post(verificationEmailServiceUrl, postData);

		if (result.status === 200) {
			response.status(200).json({
				message: "E-mail de verificação enviado com sucesso."
			});
		} else {
			response.status(500).json({
				message: "Erro ao enviar e-mail de verificação."
			});
		}
	} catch (error) {
		console.error("Error aqui:", error);
		response.status(500).json({
			message: "Erro interno ao processar a verificação de e-mail."
		});
	}
}

export async function verifyEmail(request: Request, response: Response) {
	try {
		const { token } = request.body;

		const userRepository = AppDataSource.getRepository(User);

		// Encontre o usuário pelo token de lembrete (supondo que este seja o token de verificação de e-mail)
		const userToVerify = await userRepository.findOneBy({
			remember_token: token
		});

		if (userToVerify) {
			userToVerify.email_verified_at = new Date();

			userToVerify.remember_token = null;

			await userRepository.save(userToVerify);

			response.status(200).json({ message: "E-mail verificado com sucesso." });
		} else {
			response.status(404).json({ message: "Token inválido ou expirado" });
		}
	} catch (error) {
		console.error(error);
		response.status(500).json({ message: "Erro ao verificar o e-mail." });
	}
}
