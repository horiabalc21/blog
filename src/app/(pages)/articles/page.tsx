"use client";
import { useEffect, useState } from "react";
import ArticleForm from "@/app/components/forms/ArticleForm/ArticleForm";
import Table from "../../components/Table/Table";
import {RequireRole} from "@/app/components/RequireRole/RequireRole";
import styles from './page.module.scss';
import DefaultButton from "@/app/components/buttons/DefaultButton/DefaultButton";
import NeutralActionButton from "@/app/components/buttons/NeutralActionButton/NeutralActionButton";
import DeleteButton from "@/app/components/buttons/DeleteButton/DeleteButton";

type Article = {
  id: number;
  title: string;
  content: string;
  published: boolean;
  category: { id: number; name: string };
  author: { id: number; name: string };
  createdAt?: string;
  publishedAt?: string;
  updatedAt?: string;
};

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editArticle, setEditArticle] = useState<Article | null>(null);
  // const [viewArticle, setEditArticle] = useState<Article | null>(null);

  const fetchArticles = () => {
    setLoading(true);
    fetch("/api/articles")
      .then((res) => res.json())
      .then((data) => {
        setArticles(data);
        setLoading(false);
        console.log(data);
      })
      .catch((error) => {
        console.error("Error fetching articles:", error);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchArticles();
    console.log(articles);
  }, []);

  const handleAdd = () => {
    setEditArticle(null);
    setShowForm(true);
  };

  const handleEdit = (article: Article) => {
    setEditArticle(article);
    setShowForm(true);
  };

  const handleDelete = async (article: Article) => {
    const confirmed = window.confirm(`Are you sure you want to delete article "${article.title}"?`);
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/articles/${article.id}`, { method: "DELETE" });
      if (res.ok) {
        fetchArticles();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete article.");
      }
    } catch (error) {
      alert("Network error occurred while deleting article.");
    }
  };

  const columns = [
    { key: "id", label: "ID" },
    { key: "title", label: "Title" },
    { 
      key: "category", 
      label: "Category", 
      render: (article: Article) => article.category?.name || "No Category" 
    },
    { 
      key: "author", 
      label: "Author", 
      render: (article: Article) => article.author?.name || "No Author" 
    },
    { 
      key: "published", 
      label: "Status", 
      render: (article: Article) => 
        <span className={`${styles.status} ${article.published ? styles.published : styles.draft}`}>
          {article.published ? "Published" : "Draft"}
        </span>
    },
    {
      key: "createdAt",
      label: "Created date",
      render: (article: Article) =>
        article.createdAt
          ? new Date(article.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })
          : "N/A"
    },
    {
      key: "publishedAt",
      label: "Publish date",
      render: (article: Article) =>
        article.publishedAt
          ? new Date(article.publishedAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })
          : "N/A"
    },
    {
      key: "updatedAt",
      label: "Last modify date",
      render: (article: Article) =>
        article.updatedAt
          ? new Date(article.updatedAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })
          : "N/A"
    },
  ];

  return (
      <RequireRole allowedRoles={["admin", "editor"]}>
          <div className={styles.container}>
              <h1 className={styles.title}>All Articles</h1>
              <DefaultButton type='button' text='Add Article' onClick={handleAdd}/>
              {showForm && (
                <ArticleForm
                  onSuccess={fetchArticles}
                  onClose={() => setShowForm(false)}
                  article={editArticle || undefined}
                />
              )}

              {loading ? (
                <p className={styles.loading}>Loading...</p>
              ) : (
                <Table
                  columns={columns}
                  data={articles}
                  actions={(article) => (
                    <>
                        <NeutralActionButton text="Edit" type="button" onClick={() => handleEdit(article)} />
                        <DeleteButton text="Delete" type="button" onClick={() => handleDelete(article)} />
                        <NeutralActionButton text="View" type="button" onClick={() => window.open(`/blog/${article.id}`, '_blank')} />
                    </>
                  )}
                />
              )}
          </div>
      </RequireRole>
  );
}