import { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { Category } from "@/entities/Category";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const db = await connectDB();
    const categoryRepo = db.getRepository(Category);

    switch (req.method) {
      case "GET": {
        // Get all categories with their articles count
        const categories = await categoryRepo.find({
          relations: ["articles"]
        });
        return res.status(200).json(categories);
      }

      case "POST": {
        // Create a new category
        const { name, description, slug } = req.body;

        if (!name || !name.trim()) {
          return res.status(400).json({ error: "Category name is required" });
        }

         if (!slug || !slug.trim()) {
          return res.status(400).json({ error: "Category slug is required" });
        }

        const existing = await categoryRepo.findOneBy({ name });
        if (existing) {
          return res.status(400).json({ error: "Category name already exists" });
        }

        const newCategory = categoryRepo.create({
          name,
          description: description || "",
          slug,
        });

        const savedCategory = await categoryRepo.save(newCategory);
        return res.status(201).json(savedCategory);
      }

      default:
        return res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error) {
    console.error("Database error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
