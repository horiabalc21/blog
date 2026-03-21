import { DataSource } from "typeorm";
import { User } from "@/entities/User";
import { Category } from "@/entities/Category";
import { Article } from "@/entities/Article";
import { Subscription } from "@/entities/Subscription";
import { Payment } from "@/entities/Payment";

export const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  synchronize: true, // ❗ Disable in production
  logging: false,
  entities: [User, Category, Article, Subscription, Payment],
});
