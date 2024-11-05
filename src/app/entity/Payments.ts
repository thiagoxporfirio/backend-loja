import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from "typeorm";
import { Subscription } from "./Subscription";

@Entity("payments")
export class Payment {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    created_at: Date;

    @Column({ type: "timestamp", nullable: true })
    updated_at: Date;

    @Column({ nullable: true })
    subscription_id: number;

    @Column()
    transaction_id: string;

    @Column()
    status: string;

    @Column("text")
    raw: string;

    @Column("varchar", { length: 255 })
    payment_method: string;

    @Column({ nullable: true })
    card_brand: string;

    @Column({ nullable: true })
    card_last_four: string;

    @Column({ nullable: true })
    paid_status: string;

}