"use client";
import { useState, useEffect } from "react";
import {ArticleEditor} from "@/app/components/ArticleEditor/ArticleEditor";
import events from "node:events";
import styles from './ArticleForm.module.scss';
import DefaultButton from "@/app/components/buttons/DefaultButton/DefaultButton";

type Article = {
  id: number;
  title: string;
  content: string;
  published: boolean;
  category: { id: number; name: string };
  author: { id: number; name: string };
  slug?: string;
  excerpt?: string;
  createdAt?: string;
  updatedAt?: string;
};

type Category = {
  id: number;
  name: string;
};

type User = {
  id: number;
  name: string;
};

type Props = {
  onSuccess: () => void;
  onClose: () => void;
  article?: Article;
};

function generateSlug(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function ArticleForm({ onSuccess, onClose, article }: Props) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [authorId, setAuthorId] = useState<number | "">("");
  const [published, setPublished] = useState(true);
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [authors, setAuthors] = useState<User[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isEditing = !!article;

  // Fetch categories and authors
  useEffect(() => {
    Promise.all([
      fetch("/api/categories").then(res => res.json()),
      fetch("/api/users").then(res => res.json())
    ]).then(([categoriesData, usersData]) => {
      setCategories(categoriesData);
      setAuthors(usersData);
    });
  }, []);

  // Pre-fill form when editing
  useEffect(() => {
    if (article) {
      setTitle(article.title);
      setContent(article.content);
      setCategoryId(article.category?.id || "");
      setAuthorId(article.author?.id || "");
      setPublished(article.published);
      setSlug(article.slug || generateSlug(article.title));
      setExcerpt(article.excerpt || "");
    } else {
      setTitle("");
      setContent("");
      setCategoryId("");
      setAuthorId("");
      setPublished(true);
      setSlug("");
      setExcerpt("");
    }
  }, [article]);

  // Generate slug when title changes
  useEffect(() => {
    setSlug(generateSlug(title));
  }, [title]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validation
    if (!title.trim()) {
      setError("Article title is required");
      setLoading(false);
      return;
    }

    if (!content.trim()) {
      setError("Article content is required");
      setLoading(false);
      return;
    }

    if (!categoryId) {
      setError("Please select a category");
      setLoading(false);
      return;
    }

    if (!isEditing && !authorId) {
      setError("Please select an author");
      setLoading(false);
      return;
    }

    try {
      const method = isEditing ? "PUT" : "POST";
      const url = isEditing ? `/api/articles/${article?.id}` : "/api/articles";
      const body: any = { title, content, categoryId, published, slug, excerpt };

      // Only include authorId when creating new article
      if (!isEditing) {
        body.authorId = authorId;
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        onSuccess();
        onClose();
      } else {
        const data = await res.json();
        setError(data.error || `Failed to ${isEditing ? "update" : "create"} article`);
      }
    } catch (err) {
      setError("Network error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form
    setTitle("");
    setContent("");
    setCategoryId("");
    setAuthorId("");
    setPublished(true);
    setSlug("");
    setExcerpt("");
    setError("");
    onClose();
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.formContainer}>
        <h2 className={styles.title}>{isEditing ? "Edit Article" : "Add New Article"}</h2>
        {error && (
          <div className={styles.error}>{error}</div>
        )}
        <form onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label}>
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={styles.input}
              disabled={loading}
              required
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>
              Slug
            </label>
            <input
              type="text"
              value={slug}
              onChange={e => setSlug(e.target.value)}
              className={styles.input}
              disabled={loading}
              required
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>
              Excerpt
            </label>
            <textarea
              value={excerpt}
              onChange={e => setExcerpt(e.target.value)}
              className={`${styles.input} ${styles.textarea}`}
              disabled={loading}
              placeholder="Short summary for preview"
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>
              Content *
            </label>
            <ArticleEditor value={content} onChange={setContent} />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>
              Category *
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(Number(e.target.value))}
              className={styles.select}
              disabled={loading}
              required
            >
              <option value="">Select a category...</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          {!isEditing && (
            <div className={styles.field}>
              <label className={styles.label}>
                Author *
              </label>
              <select
                value={authorId}
                onChange={(e) => setAuthorId(Number(e.target.value))}
                className={styles.select}
                disabled={loading}
                required
              >
                <option value="">Select an author...</option>
                {authors.map((author) => (
                  <option key={author.id} value={author.id}>
                    {author.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className={styles.field}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
                disabled={loading}
                className={styles.checkbox}
              />
              Published
            </label>
          </div>
          {isEditing && (
            <div className={styles.meta}>
              <div>Created: {article?.createdAt ? new Date(article.createdAt).toLocaleString() : "-"}</div>
              <div>Updated: {article?.updatedAt ? new Date(article.updatedAt).toLocaleString() : "-"}</div>
            </div>
          )}
          <div className={styles.actions}>
            <button
              type="button"
              onClick={handleCancel}
              className={styles.cancelBtn}
              disabled={loading}
            >
              Cancel
            </button>
              <DefaultButton
                  text={loading ? "Saving..." : (isEditing ? "Update Article" : "Create Article")}
                  type="submit"
                  disabled={loading}
              />
          </div>
        </form>
      </div>
    </div>
  );
}