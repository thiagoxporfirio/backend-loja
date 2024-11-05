import { type NextFunction, type Request, type Response } from "express";
import { verificaToken } from "../../config/JwtConfig";
import { loggerInfo, loggerInfoItem } from "../utils/LoggerUtil";

type ExtendedRequest = {
	user?: any;
} & Request;

export default async function tokenMiddleware(
	req: ExtendedRequest,
	res: Response,
	next: NextFunction
) {
	try {
		loggerInfo("Start token validation");
		const { authorization } = req.headers;
		if (!authorization) {
			return res.sendStatus(401);
		}

		const token = authorization.replace("Barer", "").trim();

		const data: any = verificaToken(token);
		if (!verificaToken(token)) {
			return res.sendStatus(401);
		}

		loggerInfoItem("Token Valido: ", token);
		next();
	} catch {
		return res.sendStatus(401);
	}
}
