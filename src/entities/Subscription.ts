import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Subscription {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    email: string;

    @Column()
    token: string;

    @Column({ default: false })
    verified: boolean;

    @Column("simple-array", { nullable: true })
    categories: string[];

    @Column("simple-array", { nullable: true })
    editors: string[];

    @Column({ default: false })
    subscribeAll: boolean;
}

