import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn
} from "typeorm";

@Entity("supports")
@Entity("supports")
export class Support {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ nullable: true })
  deleted_at: Date;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 255 })
  email: string;

  @Column({ length: 45 })
  phone: string;

  @Column({ length: 255, nullable: true })
  subject: string;

  @Column("text", { nullable: true })
  description: string;
}
