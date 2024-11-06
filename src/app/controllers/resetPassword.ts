import { type Request, type Response } from "express";
import { AppDataSource } from "../../database/data-source";
import { User } from "../entity/User";
import { randomBytes } from "crypto";
import bcrypt from "bcrypt";
import axios from "axios";

// Endpoint para solicitar redefinição de senha
export async function requestResetPassword(request: Request, response: Response) {
	try {
		const { email } = request.body;
		const userRepository = AppDataSource.getRepository(User);
		const user = await userRepository.findOneBy({ email });

		if (!user) {
			return response.status(404).json({ message: "Usuário não encontrado." });
		}

		// Gerar um token de redefinição
		const token = randomBytes(6).toString("hex");
		user.remember_token = token;
		await userRepository.save(user);

		const resetPasswordUrl = `${process.env.APP_URL}/auth/reset-password/${token}`;
		const resetPasswordServiceUrl = `${process.env.APP_UTIL_API_URL}/reset-password`;

		// Dados para enviar o e-mail de redefinição de senha
		const postData = { url: resetPasswordUrl, email };

		// Enviar e-mail de redefinição de senha
		const result = await axios.post(resetPasswordServiceUrl, postData);

		if (result.status === 200) {
			return response.status(200).json({
				message: "E-mail de redefinição de senha enviado com sucesso."
			});
		} else {
			return response.status(500).json({
				message: "Erro ao enviar e-mail de redefinição de senha."
			});
		}
	} catch (error) {
		console.error("Erro ao solicitar redefinição de senha:", error);
		return response.status(500).json({ message: "Erro interno do servidor." });
	}
}

// Endpoint para redefinir a senha usando o token
export async function resetPassword(request: Request, response: Response) {
	try {
		const { token, password } = request.body;

		if (password.length < 8) {
			return response.status(400).json({ message: "A senha deve ter pelo menos 8 caracteres." });
		}

		const userRepository = AppDataSource.getRepository(User);
		const user = await userRepository.findOneBy({ remember_token: token });

		if (!user) {
			return response.status(404).json({ message: "Token inválido ou expirado." });
		}

		// Hash da nova senha e atualizar o usuário
		const salt = await bcrypt.genSalt(12);
		user.password = await bcrypt.hash(password, salt);
		user.remember_token = null; // Invalidar o token após o uso
		await userRepository.save(user);

		return response.status(200).json({ message: "Senha redefinida com sucesso." });
	} catch (error) {
		console.error("Erro ao redefinir senha:", error);
		return response.status(500).json({ message: "Erro interno do servidor." });
	}
}

// Endpoint para atualizar a senha (com verificação de senha antiga)
export async function updatePassword(request: Request, response: Response) {
	try {
		const { user_id, old_password, new_password } = request.body;

		if (!new_password || new_password.length < 8) {
			return response.status(400).json({ message: "A nova senha deve ter pelo menos 8 caracteres." });
		}

		const userRepository = AppDataSource.getRepository(User);
		const user = await userRepository.findOneBy({ id: user_id });

		if (!user) {
			return response.status(404).json({ message: "Usuário não encontrado." });
		}

		const isOldPasswordValid = await bcrypt.compare(old_password, user.password.replace(/^\$2y/, "$2b"));
		if (!isOldPasswordValid) {
			return response.status(401).json({ message: "Senha antiga inválida." });
		}

		// Hash da nova senha e salvar
		const salt = await bcrypt.genSalt(12);
		user.password = await bcrypt.hash(new_password, salt);
		await userRepository.save(user);

		return response.status(200).json({ message: "Senha atualizada com sucesso." });
	} catch (error) {
		console.error("Erro ao atualizar a senha:", error);
		return response.status(500).json({ message: "Erro interno do servidor." });
	}
}

// Endpoint para enviar e-mail de verificação de conta
export async function sendVerificationEmail(request: Request, response: Response) {
	try {
		const { email } = request.body;
		const userRepository = AppDataSource.getRepository(User);
		const user = await userRepository.findOneBy({ email });

		if (!user) {
			return response.status(404).json({ message: "E-mail não cadastrado." });
		}

		// Gerar token para verificação de e-mail
		const token = randomBytes(6).toString("hex");
		user.remember_token = token;
		await userRepository.save(user);

		const verificationUrl = `${process.env.APP_URL}/auth/verify-email/${token}`;
		const verificationServiceUrl = `${process.env.APP_UTIL_API_URL}/verify-email`;

		// Dados para enviar o e-mail de verificação
		const postData = { url: verificationUrl, email };

		// Enviar o e-mail de verificação
		const result = await axios.post(verificationServiceUrl, postData);

		if (result.status === 200) {
			return response.status(200).json({ message: "E-mail de verificação enviado com sucesso." });
		} else {
			return response.status(500).json({ message: "Erro ao enviar e-mail de verificação." });
		}
	} catch (error) {
		console.error("Erro ao enviar e-mail de verificação:", error);
		return response.status(500).json({ message: "Erro interno ao processar a verificação de e-mail." });
	}
}

// Endpoint para verificar o e-mail com token
export async function verifyEmail(request: Request, response: Response) {
	try {
		const { token } = request.body;
		const userRepository = AppDataSource.getRepository(User);

		const user = await userRepository.findOneBy({ remember_token: token });

		if (!user) {
			return response.status(404).json({ message: "Token inválido ou expirado." });
		}

		user.email_verified_at = new Date();
		user.remember_token = null;
		await userRepository.save(user);

		return response.status(200).json({ message: "E-mail verificado com sucesso." });
	} catch (error) {
		console.error("Erro ao verificar o e-mail:", error);
		return response.status(500).json({ message: "Erro ao verificar o e-mail." });
	}
}
