import { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { Article } from "@/entities/Article";
import { Category } from "@/entities/Category";
import { User } from "@/entities/User";
import { sendArticleNotification } from "@/lib/sendArticleNotification";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const db = await connectDB();
    const articleRepo = db.getRepository(Article);
    const categoryRepo = db.getRepository(Category);
    const userRepo = db.getRepository(User);

    switch (req.method) {
      case "GET": {
        // Pagination support and optionally return all articles
        const limit = parseInt(req.query.limit as string) || 20;
        const offset = parseInt(req.query.offset as string) || 0;
        const showAll = req.query.all === 'true';
        const where = showAll ? {} : { published: true };
        // Get total count
        const total = await articleRepo.count({ where });
        // Get paginated articles
        const articles = await articleRepo.find({
          relations: ["author", "category"],
          order: { id: "DESC" },
          skip: offset,
          take: limit,
          where,
        });
        return res.status(200).json({ articles, total });
      }

      case "POST": {
        const { title, content, categoryId, authorId, published, slug, excerpt } = req.body;

        if (!title || !title.trim()) {
          return res.status(400).json({ error: "Article title is required" });
        }

        if (!content || !content.trim()) {
          return res.status(400).json({ error: "Article content is required" });
        }

        if (!slug || !slug.trim()) {
          return res.status(400).json({ error: "Article slug is required" });
        }

        if (!categoryId) {
          return res.status(400).json({ error: "Category ID is required" });
        }

        if (!authorId) {
          return res.status(400).json({ error: "Author ID is required" });
        }

        // Verify category and author exist
        const category = await categoryRepo.findOneBy({ id: Number(categoryId) });
        if (!category) {
          return res.status(400).json({ error: "Category not found" });
        }

        const author = await userRepo.findOneBy({ id: Number(authorId) });
        if (!author) {
          return res.status(400).json({ error: "Author not found" });
        }

        // Check for existing slug
        const existingSlug = await articleRepo.findOneBy({ slug });
        if (existingSlug) {
          return res.status(400).json({ error: "Article slug already exists" });
        }

        const newArticle = articleRepo.create({
          title,
          content,
          slug,
          excerpt: excerpt || undefined,
          category,
          author,
          published: published !== undefined ? published : true,
          publishedAt: published ? new Date() : undefined
        });

        const savedArticle = await articleRepo.save(newArticle);
        // Fetch the article with relations
        const articleWithRelations = await articleRepo.findOne({
          where: { id: savedArticle.id },
          relations: ["author", "category"]
        });

        // Optionally send notifications here
        // if (articleWithRelations && articleWithRelations.published) {
        //   await sendArticleNotification({
        //     id: articleWithRelations.id,
        //     title: articleWithRelations.title,
        //     content: articleWithRelations.content,
        //     category: articleWithRelations.category?.name || "",
        //     author: articleWithRelations.author?.name || "",
        //     url: `${process.env.NEXT_PUBLIC_BASE_URL}/blog/${articleWithRelations.id}`
        //   });
        // }

        return res.status(201).json(articleWithRelations);
      }

      default:
        return res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error) {
    console.error("Database error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}