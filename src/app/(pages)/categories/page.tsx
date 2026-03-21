"use client";
import { useEffect, useState } from "react";
import CategoryForm from "@/app/components/forms/CategoryForm/CategoryForm";
import Table from "../../components/Table/Table";
import {RequireRole} from "@/app/components/RequireRole/RequireRole";
import styles from './page.module.scss';
import DefaultButton from "@/app/components/buttons/DefaultButton/DefaultButton";

type Category = {
  id: number;
  name: string;
  description: string;
  articles?: any[]; // For article count
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);

  const fetchCategories = () => {
    setLoading(true);
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        setCategories(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching categories:", error);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAdd = () => {
    setEditCategory(null);
    setShowForm(true);
  };

  const handleEdit = (category: Category) => {
    setEditCategory(category);
    setShowForm(true);
  };

  const handleDelete = async (category: Category) => {
    const articleCount = category.articles?.length || 0;

    if (articleCount > 0) {
      alert(`Cannot delete category "${category.name}" because it has ${articleCount} article(s). Please move or delete the articles first.`);
      return;
    }

    const confirmed = window.confirm(`Are you sure you want to delete category "${category.name}"?`);
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/categories/${category.id}`, { method: "DELETE" });
      if (res.ok) {
        fetchCategories();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete category.");
      }
    } catch (error) {
      alert("Network error occurred while deleting category.");
    }
  };

  const columns = [
    { key: "id", label: "ID" },
    { key: "name", label: "Name" },
    { key: "slug", label: "Slug" },
    { key: "description", label: "Description" },
    {
      key: "articleCount",
      label: "Articles",
      render: (category: Category) => category.articles?.length || 0
    },
  ];

  return (
      <RequireRole allowedRoles={["admin", "editor"]}>
          <div className={styles.container}>
            <h1 className={styles.title}>All Categories</h1>
            <DefaultButton type='button' text='Add Category' onClick={handleAdd} />
              {showForm && (
                <CategoryForm
                  onSuccess={fetchCategories}
                  onClose={() => setShowForm(false)}
                  category={editCategory || undefined}
                />
              )}

              {loading ? (
                <p className={styles.loading}>Loading...</p>
              ) : (
                <Table
                  columns={columns}
                  data={categories}
                  actions={(category) => (
                    <>
                      <button className={styles.actionBtn} onClick={() => handleEdit(category)}>Edit</button>
                      <button
                        className={`${styles.actionBtn} ${styles.deleteBtn}`}
                        onClick={() => handleDelete(category)}
                      >
                        Delete
                      </button>
                    </>
                  )}
                />
              )}
            </div>
        </RequireRole>
  );
}