import {type Request, type Response} from "express";
import {AppDataSource} from "../../database/data-source";
import {User} from "../entity/User";

export async function health(request: Request, response: Response) {
    try {
        // Rota de teste
        const userRepository = AppDataSource.getRepository(User);
        const total = await userRepository.count();
        const users = await userRepository.find();
        const result = {
            status: "ok",
            total,
            users
        }
        return response.status(201).json(result);
    } catch (error) {
        return response.status(500).send("Internal Server Error");
    }
}
