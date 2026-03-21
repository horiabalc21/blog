import { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { Category } from "@/entities/Category";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const db = await connectDB();
    const categoryRepo = db.getRepository(Category);
    const { id } = req.query;

    const categoryId = parseInt(id as string);
    if (isNaN(categoryId)) {
      return res.status(400).json({ error: "Invalid category ID" });
    }

    switch (req.method) {
      case "GET": {
        // Get single category with articles
        const category = await categoryRepo.findOne({
          where: { id: categoryId },
          relations: ["articles"]
        });
        if (!category) {
          return res.status(404).json({ error: "Category not found" });
        }
        return res.status(200).json(category);
      }

      case "PUT": {
        // Update category
        const { name, description, slug } = req.body;
        
        const category = await categoryRepo.findOneBy({ id: categoryId });
        if (!category) {
          return res.status(404).json({ error: "Category not found" });
        }

        // Validation
        if (!name || !name.trim()) {
          return res.status(400).json({ error: "Category name is required" });
        }

        if (!slug || !slug.trim()) {
          return res.status(400).json({ error: "Category slug is required" });
        }

        // Check if name is being changed and if it already exists
        if (name !== category.name) {
          const existing = await categoryRepo.findOneBy({ name });
          if (existing) {
            return res.status(400).json({ error: "Category name already exists" });
          }
        }

        if (slug !== category.slug) {
          const existing = await categoryRepo.findOneBy({ slug });
          if (existing) {
            return res.status(400).json({ error: "Category slug already exists" });
          }
        }

        // Update fields
        category.slug = slug;
        category.name = name;
        if (description !== undefined) {
          category.description = description;
        }

        const updatedCategory = await categoryRepo.save(category);
        return res.status(200).json(updatedCategory);
      }

      case "DELETE": {
        // Delete category (only if no articles)
        const category = await categoryRepo.findOne({
          where: { id: categoryId },
          relations: ["articles"]
        });
        
        if (!category) {
          return res.status(404).json({ error: "Category not found" });
        }

        // Check if category has articles
        if (category.articles && category.articles.length > 0) {
          return res.status(400).json({ 
            error: "Cannot delete category with existing articles" 
          });
        }

        await categoryRepo.remove(category);
        return res.status(200).json({ message: "Category deleted successfully" });
      }

      default:
        return res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error) {
    console.error("Database error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}