import { DataSource } from "typeorm";
import { env } from "../app/utils/Env";
import { Config } from "../app/entity/Configs";

import { User } from "../app/entity/User";


const entities =[
	Config,
	User,
];

const config: any = env.isDevelopment
	? {
			type: "postgres",
			host: env.TYPEORM_HOST,
			port: parseInt(env.TYPEORM_PORT),
			username: env.TYPEORM_USERNAME,
			password: env.TYPEORM_PASSWORD,
			database: env.TYPEORM_DATABASE,
			// entities: [`${__dirname}/../app/entity/*.{ts,js}`],
			entities ,
			synchronize: false // Lembre-se de que isso não deve ser usado em produção
		}
	: {
			type: "postgres",
			host: env.TYPEORM_HOST,
			port: parseInt(env.TYPEORM_PORT),
			username: env.TYPEORM_USERNAME,
			password: env.TYPEORM_PASSWORD,
			database: env.TYPEORM_DATABASE,
			extra: {
				socketPath: "/cloudsql/causa-ganha-app:us-central1:causa-ganha-app-db"
			},
			entities,
			synchronize: false // Lembre-se de que isso não deve ser usado em produção
		};
export const AppDataSource = new DataSource(config);
