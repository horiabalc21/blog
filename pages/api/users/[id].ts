import { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { User } from "@/entities/User";
import bcrypt from "bcryptjs";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const db = await connectDB();
  const userRepo = db.getRepository(User);
  const { id } = req.query;

  const user = await userRepo.findOneBy({ id: Number(id) });
  if (!user) return res.status(404).json({ error: "User not found" });

  switch (req.method) {
    case "GET":
      return res.status(200).json(user);

    case "PUT": {
      const { name, email, password, role } = req.body;
      user.name = name ?? user.name;
      user.email = email ?? user.email;
      if (password) {
          // Only hash if password is provided and different
          const isSame = await bcrypt.compare(password, user.password);
          user.password = isSame ? user.password : await bcrypt.hash(password, 10);
      }
      user.role = role ?? user.role;
      await userRepo.save(user);
      return res.status(200).json(user);
    }

    case "DELETE":
      await userRepo.remove(user);
      return res.status(204).end();

    default:
      return res.status(405).json({ error: "Method not allowed" });
  }
}
