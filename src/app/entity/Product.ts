import {
	Column,
	Entity,
	PrimaryGeneratedColumn,
	CreateDateColumn,
	UpdateDateColumn
} from "typeorm";

@Entity("products")
export class Product {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	name: string;

	@Column("text", { nullable: true })
	short_description: string;

	@Column("decimal", { precision: 10, scale: 2 })
	price: number;

	@Column({ default: true })
	tax_included: boolean;

	@Column("simple-array", { nullable: true })
	sizes: string[]; // Exemplo: ["PP", "P", "M", "G", "GG"]

	@Column("text", { nullable: true })
	details: string;

	@Column({ nullable: true })
	category: string;

	@Column("text", { nullable: true })
	fit_info: string;

	@Column("text", { nullable: true })
	care_instructions: string;

	@Column("simple-array", { nullable: true })
	images: string[]; // URLs das imagens

	@CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
	created_at: Date;

	@UpdateDateColumn({
		type: "timestamp",
		default: () => "CURRENT_TIMESTAMP",
		onUpdate: "CURRENT_TIMESTAMP"
	})
	updated_at: Date;
}
