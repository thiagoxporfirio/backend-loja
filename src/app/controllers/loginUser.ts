import { type Request, type Response } from "express";
import { AppDataSource } from "../../database/data-source";
import { User } from "../entity/User";
import bcrypt from "bcrypt";
import { cadastraToken } from "../../config/JwtConfig";

export async function loginUser(request: Request, response: Response) {
	try {
		const { email, password } = request.body;

		// Repositório de usuário
		const userRepository = AppDataSource.getRepository(User);

		// Verificar se o usuário existe
		const user = await userRepository.findOneBy({ email });

		if (!user) {
			return response.status(404).json({ message: "Usuário não encontrado" });
		}

		// Verificar a senha
		const passwordHash = user.password.replace(/^\$2y/, "$2b");
		const isPasswordValid = await bcrypt.compare(password, passwordHash);

		if (!isPasswordValid) {
			return response.status(401).json({ message: "Senha inválida" });
		}

		// Gerar o token JWT
		const token = cadastraToken({ id: user.id });

		// Dados do usuário para resposta
		const userData = {
			status: "Logado",
			id: user.id,
			first_name: user.first_name,
			last_name: user.last_name,
			email: user.email
		};

		return response.status(200).json({ token, userData });
	} catch (error) {
		console.error("Erro no login do usuário:", error);
		return response.status(500).send("Erro interno do servidor");
	}
}
