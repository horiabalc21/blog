import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity()
export class Payment {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    email: string;

    @Column("decimal", { precision: 10, scale: 2 })
    amount: number;

    @Column({ nullable: true })
    stripeSessionId: string;

    @CreateDateColumn()
    createdAt: Date;
}

