import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("configs")
export class Config {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ length: 255 })
	codename: string;

	@Column("text")
	value: string;

	@Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
	created_at: Date;

	@Column({ type: "timestamp", nullable: true })
	updated_at: Date;

	@Column({ type: "timestamp", nullable: true })
	deleted_at: Date;
}
