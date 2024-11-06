import {
	Column,
	Entity,
	PrimaryGeneratedColumn,
	CreateDateColumn,
	UpdateDateColumn
} from "typeorm";

@Entity("users")
export class User {

	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	first_name: string;

	@Column()
	last_name: string;

	@Column({ unique: true })
	email: string;

	@Column()
	password: string;

	@Column({ nullable: true })
	remember_token: string | null;

	@Column({ type: "timestamp", nullable: true })
	email_verified_at: Date | null;

	@CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
	created_at: Date;

	@UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
	updated_at: Date;
}
