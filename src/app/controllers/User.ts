import { type Request, type Response } from "express";
import { AppDataSource } from "../../database/data-source";
import { User } from "../entity/User";
import bcrypt from "bcrypt";

// Função para criar um novo usuário
export async function createUser(request: Request, response: Response) {
	try {
		const { first_name, last_name, email, password } = request.body;

		// Validação de nome
		const nameRegex = /^[a-zA-Z\s]+$/;
		if (!nameRegex.test(first_name) || !nameRegex.test(last_name)) {
			return response.status(400).json("O nome deve conter apenas letras");
		}

		// Validação de senha
		if (password.length < 8) {
			return response
				.status(400)
				.json("A senha deve ter pelo menos 8 caracteres");
		}

		const userRepository = AppDataSource.getRepository(User);

		// Verificar se já existe um usuário com o mesmo e-mail
		const existingEmail = await userRepository.findOneBy({ email });
		if (existingEmail) {
			return response.status(409).json("E-mail já registrado");
		}

		// Criptografar a senha
		const salt = await bcrypt.genSalt(12);
		const hashedPassword = await bcrypt.hash(password, salt);

		// Cria uma nova instância do usuário
		const user = new User();
		user.first_name = first_name;
		user.last_name = last_name;
		user.email = email;
		user.password = hashedPassword;

		// Salva o usuário no banco de dados
		await userRepository.save(user);
		return response.status(201).json({
			id: user.id,
			message: "Usuário criado com sucesso!"
		});
	} catch (error) {
		console.error("Erro ao criar usuário:", error);
		return response.status(500).send("Erro interno do servidor");
	}
}

// Função para atualizar os dados de um usuário
export async function updateUser(request: Request, response: Response) {
	try {
		const id = Number(request.params.id);
		const { first_name, last_name, email } = request.body;

		if (isNaN(id)) {
			return response.status(400).json("ID do usuário inválido");
		}

		// Validação de nome
		const nameRegex = /^[a-zA-Z\s]+$/;
		if (!nameRegex.test(first_name) || !nameRegex.test(last_name)) {
			return response.status(400).json("O nome deve conter apenas letras");
		}

		const userRepository = AppDataSource.getRepository(User);

		// Buscar usuário pelo ID
		const user = await userRepository.findOneBy({ id });
		if (!user) {
			return response.status(404).json("Usuário não encontrado");
		}

		// Atualizar os campos do usuário
		if (first_name) user.first_name = first_name;
		if (last_name) user.last_name = last_name;
		if (email) user.email = email;

		await userRepository.save(user);

		return response
			.status(200)
			.json("Dados do usuário atualizados com sucesso");
	} catch (error) {
		console.error("Erro ao atualizar usuário:", error);
		return response.status(500).send("Erro interno do servidor");
	}
}

// Função para buscar um usuário pelo ID
export async function getUser(request: Request, response: Response) {
	const userId = Number(request.params.id);

	try {
		const userRepository = AppDataSource.getRepository(User);
		const user = await userRepository.findOneBy({ id: userId });

		if (!user) {
			return response.status(404).send("Usuário não encontrado");
		}

		const userData = {
			id: user.id,
			first_name: user.first_name,
			last_name: user.last_name,
			email: user.email,
			created_at: user.created_at,
			updated_at: user.updated_at
		};

		return response.json(userData);
	} catch (error) {
		console.error("Erro ao buscar usuário:", error);
		return response.status(500).send("Erro interno do servidor");
	}
}

// Função para deletar um usuário pelo ID
export async function deleteUser(request: Request, response: Response) {
	try {
		const userId = Number(request.params.id);

		if (isNaN(userId)) {
			return response.status(400).json({ message: "ID do usuário inválido" });
		}

		const userRepository = AppDataSource.getRepository(User);

		const user = await userRepository.findOneBy({ id: userId });
		if (!user) {
			return response.status(404).json({ message: "Usuário não encontrado" });
		}

		// Deletar o usuário do banco de dados
		await userRepository.remove(user);

		return response.status(200).json({ message: "Usuário deletado com sucesso!" });
	} catch (error) {
		console.error("Erro ao deletar usuário:", error);
		return response.status(500).send("Erro interno do servidor");
	}
}
