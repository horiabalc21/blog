import { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { Article } from "@/entities/Article";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const db = await connectDB();
    const articleRepo = db.getRepository(Article);

    if (req.method !== "GET") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const limit = parseInt(req.query.limit as string) || 9;
    const offset = parseInt(req.query.offset as string) || 0;
    const [articles, total] = await articleRepo.findAndCount({
      relations: ["author", "category"],
      order: { publishedAt: "DESC", id: "DESC" },
      skip: offset,
      take: limit,
    });
    return res.status(200).json({ articles, total });
  } catch (error) {
    console.error("Database error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

