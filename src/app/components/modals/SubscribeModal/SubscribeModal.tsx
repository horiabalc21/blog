"use client";
import React, { useState, useEffect } from "react";
import styles from './SubscribeModal.module.scss';

interface SubscribeModalProps {
    open: boolean;
    onClose: () => void;
}

type Category = { id: number; name: string; slug: string; description?: string };
type User = { id: number; name: string; email: string; role: "admin" | "editor" };

export default function SubscribeModal({ open, onClose }: SubscribeModalProps) {
    const [email, setEmail] = useState("");
    const [categories, setCategories] = useState<string[]>([]);
    const [editors, setEditors] = useState<string[]>([]);
    const [subscribeAll, setSubscribeAll] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [availableCategories, setAvailableCategories] = useState<string[]>([]);
    const [availableEditors, setAvailableEditors] = useState<string[]>([]);

    useEffect(() => {
        // Fetch categories from API
        fetch("/api/categories")
            .then(res => res.json())
            .then((data: Category[]) => {
                if (Array.isArray(data)) {
                    setAvailableCategories(data.map((cat) => cat.name));
                }
            });
        // Fetch editors from API
        fetch("/api/users")
            .then(res => res.json())
            .then((data: User[]) => {
                if (Array.isArray(data)) {
                    setAvailableEditors(data.filter((user) => user.role === "editor").map((user) => user.name));
                }
            });
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");
        try {
            const res = await fetch("/api/subscribe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, categories, editors, subscribeAll }),
            });
            if (!res.ok) throw new Error("Failed to subscribe");
            setMessage("You are almost subscribed! Please verify your email.");
        } catch (err) {
            setMessage("Subscription failed. Try again.");
        } finally {
            setLoading(false);
        }
    };

    if (!open) return null;

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <h2 className={styles.title}>Subscribe to Newsletter</h2>
                <form onSubmit={handleSubmit} className={styles.form}>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Your email" required className={styles.input} />
                    <div className={styles.checkboxGroup}>
                        <label className={styles.checkboxLabel}>
                            <input type="checkbox" checked={subscribeAll} onChange={e => setSubscribeAll(e.target.checked)} />
                            All articles
                        </label>
                    </div>
                    <div className={styles.checkboxGroup}>
                        <strong>Categories:</strong>
                        {availableCategories.map(cat => (
                            <label key={cat} className={styles.checkboxLabel}>
                                <input type="checkbox" checked={categories.includes(cat)} onChange={e => {
                                    setCategories(e.target.checked ? [...categories, cat] : categories.filter(c => c !== cat));
                                }} />
                                {cat}
                            </label>
                        ))}
                    </div>
                    <div className={styles.checkboxGroup}>
                        <strong>Editors:</strong>
                        {availableEditors.map(ed => (
                            <label key={ed} className={styles.checkboxLabel}>
                                <input type="checkbox" checked={editors.includes(ed)} onChange={e => {
                                    setEditors(e.target.checked ? [...editors, ed] : editors.filter(c => c !== ed));
                                }} />
                                {ed}
                            </label>
                        ))}
                    </div>
                    <button type="submit" disabled={loading} className={styles.button}>Subscribe</button>
                </form>
                {message && <p className={styles.message}>{message}</p>}
                <button onClick={onClose} className={styles.closeBtn}>Close</button>
            </div>
        </div>
    );
}
