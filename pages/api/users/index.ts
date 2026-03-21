import { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { User } from "@/entities/User";
import bcrypt from "bcryptjs";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const db = await connectDB();
  const userRepo = db.getRepository(User);

  switch (req.method) {
    case "GET": {
      // Get all users
      const users = await userRepo.find();
      return res.status(200).json(users);
    }

    case "POST": {
      // Create a new user
      const { name, email, password, role } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const existing = await userRepo.findOneBy({ email });
      if (existing) return res.status(400).json({ error: "Email already exists" });
      
      const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds

      const newUser = userRepo.create({
        name,
        email,
        password: hashedPassword,
        role: role || "editor",
      });

      await userRepo.save(newUser);
      return res.status(201).json(newUser);
    }

    default:
      return res.status(405).json({ error: "Method not allowed" });
  }
}