import {
	Column,
	Entity,
	PrimaryGeneratedColumn
} from "typeorm";

@Entity("users")
export class User {

	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	name: string;

	@Column({ unique: true })
	cpf_cnpj: string;

	@Column({ unique: true })
	email: string;

	@Column({ nullable: true })
	email_verified_at: Date;

	@Column()
	password_reset_count: number;

	@Column()
	password: string;

	@Column()
	photo: string;

	@Column({ nullable: true })
	remember_token: string | undefined;

	@Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
	created_at: Date;

	@Column({
		type: "timestamp",
		default: () => "CURRENT_TIMESTAMP",
		onUpdate: "CURRENT_TIMESTAMP"
	})
	updated_at: Date;
}
