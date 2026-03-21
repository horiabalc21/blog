import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

export type UserRole = "admin" | "editor";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ type: "enum", enum: ["admin", "editor"], default: "editor" })
  role: UserRole;
}
