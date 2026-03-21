import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "./User";

@Entity()
export class Article {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ unique: true })
  slug: string;

  @Column({ type: "text" })
  content: string;

  @Column({ type: "text", nullable: true })
  excerpt: string;

  @ManyToOne("Category", "articles")
  category: any;

  @ManyToOne(() => User)
  author: User;

  @Column({ default: true })
  published: boolean;

  @Column({ type: "timestamp", nullable: true })
  publishedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
