"use client";
import { useState, useEffect } from "react";
import styles from './CategoryForm.module.scss';
import DefaultButton from "@/app/components/buttons/DefaultButton/DefaultButton";

type Category = {
    id: number;
    name: string;
    description: string;
    slug?: string;
};

type User = {
    id: number;
    name: string;
};

type Props = {
    onSuccess: () => void;
    onClose: () => void;
    category?: Category;
};

function generateSlug(text: string) {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
}

export default function CategoryForm({ onSuccess, onClose, category }: Props) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [slug, setSlug] = useState("");
    const [users, setUsers] = useState<User[]>([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const isEditing = !!category;

    useEffect(() => {
        // Fetch users for the creator select
        fetch("/api/users")
            .then(res => res.json())
            .then(data => setUsers(data));
    }, []);

    useEffect(() => {
        if (category) {
            setName(category.name);
            setDescription(category.description || "");
            setSlug(category.slug || generateSlug(category.name));
        } else {
            setName("");
            setDescription("");
            setSlug("");
        }
    }, [category]);

    useEffect(() => {
        setSlug(generateSlug(name));
    }, [name]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        if (!name.trim()) {
            setError("Category name is required");
            setLoading(false);
            return;
        }

        try {
            const method = isEditing ? "PUT" : "POST";
            const url = isEditing ? `/api/categories/${category?.id}` : "/api/categories";
            const body = { name, description, slug };

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
                setError(data.error || `Failed to ${isEditing ? "update" : "create"} category`);
            }
        } catch (err) {
            setError("Network error occurred");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setName("");
        setDescription("");
        setSlug("");
        setError("");
        onClose();
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.formContainer}>
                <h2 className={styles.title}>{isEditing ? "Edit Category" : "Add New Category"}</h2>
                {error && (
                    <div className={styles.error}>
                        {error}
                    </div>
                )}
                <form onSubmit={handleSubmit}>
                    <div className={styles.field}>
                        <label className={styles.label}>
                            Name *
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
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
                            Description
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className={`${styles.input} ${styles.textarea}`}
                            disabled={loading}
                            placeholder="Optional description..."
                        />
                    </div>
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
                            text={loading ? "Saving..." : (isEditing ? "Update Category" : "Create Category")}
                            type="submit"
                            disabled={loading}
                        />
                    </div>
                </form>
            </div>
        </div>
    );
}