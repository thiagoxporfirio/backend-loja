import { sign, verify } from "jsonwebtoken";
import { env, Env } from "../app/utils/Env";



const tokenVerifyCode = env.TYPEORM_JWT_SECRET;

export function verificaToken(token: string) {
	return verify(token, tokenVerifyCode);
}

export function cadastraToken(object: any) {
	return sign({ id: object.id }, tokenVerifyCode, {
		expiresIn: "1d"
	});
}
