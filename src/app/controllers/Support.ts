import { type Request, type Response } from "express";
import { AppDataSource } from "../../database/data-source";
import { Support } from "../entity/Support";

export async function supportUser(request: Request, response: Response) {
	try {
		const { name, email, phone, message } = request.body;

		const nameRegex = /^[a-zA-Z0-9\s!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]+$/;

		if (!nameRegex.test(name)) {
			return response.status(400).json("O nome deve conter apenas letras");
		}

		const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
		if (!emailRegex.test(email)) {
			return response.status(400).json("E-mail inválido");
		}

		const phoneRegex = /^\d+$/;
		if (!phoneRegex.test(phone)) {
			return response.status(400).json("Telefone deve conter apenas números");
		}

		const supportRepository = AppDataSource.getRepository(Support);

		const newSupport = new Support();
		newSupport.name = name;
		newSupport.email = email;
		newSupport.phone = phone;
		newSupport.description = message;
		newSupport.created_at = new Date();
		newSupport.updated_at = new Date();

		await supportRepository.save(newSupport);

		return response
			.status(200)
			.json({ message: "Mensagem enviada, aguarde o retorno do suporte." });
	} catch (error) {
		console.error("Error saving support request:", error);
		if (!response.headersSent) {
			return response
				.status(500)
				.send("Internal Server Error" + error.message + error.stack);
		}
	}
}
