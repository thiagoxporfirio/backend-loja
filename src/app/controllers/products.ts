import { Request, Response } from "express";
import { AppDataSource } from "../../database/data-source";
import { Product } from "../entity/Product";
import AWS from "aws-sdk";
import { v4 as uuidv4 } from "uuid";
import { MoreThanOrEqual } from "typeorm";

// Configuração do S3
const s3 = new AWS.S3({
	accessKeyId: process.env.AWS_ACCESS_KEY_ID,
	secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
	region: process.env.AWS_REGION
});

export async function createProduct(request: Request, response: Response) {
	try {
		const {
			name,
			short_description,
			price,
			tax_included,
			sizes,
			details,
			category,
			fit_info,
			care_instructions
		} = request.body;

		const productRepository = AppDataSource.getRepository(Product);

		const product = new Product();
		product.name = name;
		product.short_description = short_description;
		product.price = price;
		product.tax_included = tax_included;
		product.sizes = sizes;
		product.details = details;
		product.category = category;
		product.fit_info = fit_info;
		product.care_instructions = care_instructions;

		// Upload das imagens para o S3 e obtenção das URLs
		const uploadedImageUrls: string[] = [];
		const files = request.files as Express.Multer.File[]; // Assegurando que request.files é um array de arquivos

		if (files && files.length > 0) {
			for (const file of files) {
				// Configura o upload para o S3
				const uploadParams = {
					Bucket: process.env.AWS_BUCKET_NAME || "", // Certifique-se de configurar o nome do seu bucket no .env
					Key: `products/${uuidv4()}-${file.originalname}`, // Nome do arquivo no S3
					Body: file.buffer,
					ACL: "public-read", // Defina a permissão como pública
					ContentType: file.mimetype
				};

				// Faz o upload da imagem para o S3
				const uploadResult = await s3.upload(uploadParams).promise();
				uploadedImageUrls.push(uploadResult.Location); // Armazena a URL retornada
			}
		}

		// Armazena as URLs das imagens no banco de dados
		product.images = uploadedImageUrls;

		await productRepository.save(product);

		return response.status(201).json({
			message: "Produto criado com sucesso!",
			product
		});
	} catch (error) {
		console.error(error);
		return response.status(500).json({ message: "Erro ao criar o produto." });
	}
}

export async function updateProduct(request: Request, response: Response) {
	try {
		const productId = Number(request.params.id);
		const {
			name,
			short_description,
			price,
			tax_included,
			sizes,
			details,
			category,
			fit_info,
			care_instructions
		} = request.body;

		const productRepository = AppDataSource.getRepository(Product);
		const product = await productRepository.findOneBy({ id: productId });

		if (!product) {
			return response.status(404).json({ message: "Produto não encontrado." });
		}

		// Atualizar os campos do produto
		if (name) product.name = name;
		if (short_description) product.short_description = short_description;
		if (price) product.price = price;
		if (tax_included !== undefined) product.tax_included = tax_included;
		if (sizes) product.sizes = sizes;
		if (details) product.details = details;
		if (category) product.category = category;
		if (fit_info) product.fit_info = fit_info;
		if (care_instructions) product.care_instructions = care_instructions;

		// Remove as imagens antigas do S3, se houver
		if (product.images && product.images.length > 0) {
			for (const oldImageUrl of product.images) {
				const key = oldImageUrl.split("/").pop(); // Extrai a chave do arquivo da URL
				if (key) {
					await s3
						.deleteObject({
							Bucket: process.env.AWS_BUCKET_NAME || "",
							Key: `products/${key}`
						})
						.promise();
				}
			}
		}

		// Verificar se novas imagens foram enviadas e fazer o upload
		const files = request.files as Express.Multer.File[]; // Verifica se request.files contém imagens
		const uploadedImageUrls: string[] = [];

		if (files && files.length > 0) {
			for (const file of files) {
				const uploadParams = {
					Bucket: process.env.AWS_BUCKET_NAME || "",
					Key: `products/${uuidv4()}-${file.originalname}`, // Gera um nome único para cada imagem
					Body: file.buffer,
					ACL: "public-read",
					ContentType: file.mimetype
				};

				// Faz o upload da imagem e armazena a URL retornada
				const uploadResult = await s3.upload(uploadParams).promise();
				uploadedImageUrls.push(uploadResult.Location);
			}

			// Atualiza o campo `images` do produto com as novas URLs
			product.images = uploadedImageUrls;
		}

		await productRepository.save(product);

		return response
			.status(200)
			.json({ message: "Produto atualizado com sucesso!", product });
	} catch (error) {
		console.error(error);
		return response
			.status(500)
			.json({ message: "Erro ao atualizar o produto." });
	}
}

export async function deleteProduct(request: Request, response: Response) {
	try {
		const productId = Number(request.params.id);

		const productRepository = AppDataSource.getRepository(Product);

		const product = await productRepository.findOneBy({ id: productId });
		if (!product) {
			return response.status(404).json({ message: "Produto não encontrado." });
		}

		await productRepository.remove(product);

		return response
			.status(200)
			.json({ message: "Produto deletado com sucesso!" });
	} catch (error) {
		console.error(error);
		return response.status(500).json({ message: "Erro ao deletar o produto." });
	}
}

// Função para obter todos os produtos
export async function getAllProducts(request: Request, response: Response) {
	try {
		const productRepository = AppDataSource.getRepository(Product);

		const products = await productRepository.find();
		return response.status(200).json(products);
	} catch (error) {
		console.error(error);
		return response.status(500).json({ message: "Erro ao obter os produtos." });
	}
}


// Função para obter produtos dos últimos 45 dias /new-products
export async function getRecentProducts(request: Request, response: Response) {
	try {
		const productRepository = AppDataSource.getRepository(Product);

		// Calcula a data de 45 dias atrás
		const fortyFiveDaysAgo = new Date();
		fortyFiveDaysAgo.setDate(fortyFiveDaysAgo.getDate() - 45);

		// Busca produtos onde o created_at é maior ou igual à data de 45 dias atrás
		const recentProducts = await productRepository.find({
			where: {
				created_at: MoreThanOrEqual(fortyFiveDaysAgo)
			}
		});

		return response.status(200).json(recentProducts);
	} catch (error) {
		console.error(error);
		return response.status(500).json({ message: "Erro ao obter produtos recentes." });
	}
}