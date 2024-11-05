import { DataSource } from "typeorm";
import { env } from "../app/utils/Env";
import { Addresses } from "../app/entity/Addresses";
import { Attorneys } from "../app/entity/Attorneys";
import { Attorney_specialty } from "../app/entity/Attorneys_specialty";
import { Causes } from "../app/entity/Causes";
import { Chat } from "../app/entity/Chats";
import { Click } from "../app/entity/Clicks";
import { Config } from "../app/entity/Configs";
import { Connections } from "../app/entity/Connections";
import { Contacts } from "../app/entity/Contacts";
import { FailedJob } from "../app/entity/Failes_jobs";
import { Notification } from "../app/entity/Notifications";
import { Payment } from "../app/entity/Payments";
import { Specialties } from "../app/entity/Specialties";
import { Subscription } from "../app/entity/Subscription";
import { User } from "../app/entity/User";
import { ChatAttorneys } from "../app/entity/Chat_attorneys";
import { Support } from "../app/entity/Support";
import {ContactRaw} from "../app/entity/ContactRaw";
import { Companies } from "../app/entity/Companies";

const entities =[
	Addresses,
	Attorneys,
	Attorney_specialty,
	ChatAttorneys,
	Causes,
	Chat,
	Click,
	Config,
	Connections,
	Contacts,
	ContactRaw,
	FailedJob,
	Notification,
	Payment,
	Specialties,
	Subscription,
	User,
	Support,
	Companies
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
