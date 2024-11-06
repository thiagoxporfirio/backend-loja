import { Request, Response } from "express";
import { AppDataSource } from "../../database/data-source";
import { Product } from "../entity/Product";

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
			care_instructions,
			images
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
		product.images = images;

		await productRepository.save(product);

		return response.status(201).json({ message: "Produto criado com sucesso!", product });
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
			care_instructions,
			images
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
		if (images) product.images = images;

		await productRepository.save(product);

		return response.status(200).json({ message: "Produto atualizado com sucesso!", product });
	} catch (error) {
		console.error(error);
		return response.status(500).json({ message: "Erro ao atualizar o produto." });
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

		return response.status(200).json({ message: "Produto deletado com sucesso!" });
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
