import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn
} from "typeorm";

@Entity("failed_jobs")
export class FailedJob {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ type: "uuid" })
	uuid: string;

	@Column()
	connection: string;

	@Column()
	queue: string;

	@Column("text")
	payload: string;

	@Column("text")
	exception: string;

	@CreateDateColumn({ name: "failed_at" })
	failedAt: Date;
}
