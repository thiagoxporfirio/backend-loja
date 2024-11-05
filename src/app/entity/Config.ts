import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	DeleteDateColumn,
} from "typeorm";


@Entity("configs")
export class Config {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	codename: string;

	@Column("text")
	value: string;

	@CreateDateColumn({ type: "timestamp" })
	created_at: Date;

	@UpdateDateColumn({ type: "timestamp" })
	updated_at: Date;

	@DeleteDateColumn({ type: "timestamp" })
	deleted_at?: Date;
}
