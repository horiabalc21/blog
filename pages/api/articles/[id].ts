import { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { Article } from "@/entities/Article";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const db = await connectDB();
    const articleRepo = db.getRepository(Article);
    const { id } = req.query;

    const articleId = parseInt(id as string);
    if (isNaN(articleId)) {
      return res.status(400).json({ error: "Invalid article ID" });
    }

    switch (req.method) {
      case "GET": {
        // Get single article with author and category
        const article = await articleRepo.findOne({
          where: { id: articleId },
          relations: ["author", "category"]
        });
        if (!article) {
          return res.status(404).json({ error: "Article not found" });
        }
        return res.status(200).json(article);
      }

      case "PUT": {
        // Update article
        const { title, content, categoryId, published } = req.body;
        
        const article = await articleRepo.findOne({
          where: { id: articleId },
          relations: ["author", "category"]
        });
        
        if (!article) {
          return res.status(404).json({ error: "Article not found" });
        }

        // Validation
        if (title !== undefined && (!title || !title.trim())) {
          return res.status(400).json({ error: "Article title is required" });
        }

        if (content !== undefined && (!content || !content.trim())) {
          return res.status(400).json({ error: "Article content is required" });
        }

        // Update fields if provided
        if (title) article.title = title;
        if (content) article.content = content;
        if (categoryId) article.category = { id: categoryId } as any;
        if (published !== undefined) article.published = published;

        const updatedArticle = await articleRepo.save(article);
        
        // Return with relations loaded
        const articleWithRelations = await articleRepo.findOne({
          where: { id: updatedArticle.id },
          relations: ["author", "category"]
        });

        return res.status(200).json(articleWithRelations);
      }

      case "DELETE": {
        // Delete article
        const article = await articleRepo.findOneBy({ id: articleId });
        if (!article) {
          return res.status(404).json({ error: "Article not found" });
        }

        await articleRepo.remove(article);
        return res.status(200).json({ message: "Article deleted successfully" });
      }

      default:
        return res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error) {
    console.error("Database error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}