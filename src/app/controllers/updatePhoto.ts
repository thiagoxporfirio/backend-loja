import { Request, Response } from "express";
import { AppDataSource } from "../../database/data-source";
import { User } from "../entity/User";
import multer from "multer";
import mime from "mime-types";
import { Storage } from "@google-cloud/storage";
import { env } from "../utils/Env";

const storage = new Storage({
	keyFilename: env.GOOGLE_APPLICATION_CREDENTIALS
});

console.log(`Current working directory: ${process.cwd()}`);

// Configuração do Multer para armazenamento em memória
const upload = multer({ storage: multer.memoryStorage() });

const bucket = storage.bucket("cdn.causaganha.app");

export const uploadPhoto = upload.single("photo");

export async function updateUserPhoto(request: Request, response: Response) {
	try {
		const { file }: any = request;
		const { id } = request.params;

		// Agora, atualizamos a entidade User com a nova URL da foto
		const userRepository = AppDataSource.getRepository(User);
		const user = await userRepository.findOneBy({
			id: parseInt(id)
		});

		if (!user) {
			return response.status(404).send("Usuário não encontrado");
		}

		if (!file) {
			return response.status(400).send("Nenhum arquivo foi enviado.");
		}

		const filename =`${env.APP_CDN_SUFFIX}/users/${id}.${mime.extension(file.mimetype)}`;
		const blob = bucket.file(filename);

		const blobStream = blob.createWriteStream({
			resumable: false
		});

		blobStream.on("error", error => {
			console.error(error);
			return response.status(500).send("Erro ao fazer upload da imagem.");
		});

		blobStream.on("finish", async () => {
			let publicUrl = `cdn.causaganha.app/${filename}`;
			publicUrl = publicUrl.replace("//", "/");

			publicUrl = "https://" + publicUrl;

			// user.photo = publicUrl;
			await userRepository.save(user);

			return response.status(200).json({ photo: publicUrl });
		});

		blobStream.end(file.buffer);
	} catch (error) {
		console.error(error);
		return response.status(500).send("Erro interno do servidor");
	}
}

