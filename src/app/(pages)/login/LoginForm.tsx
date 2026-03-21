"use client";
import { useState } from "react";
import styles from './LoginForm.module.scss';

export default function LoginForm({ onLogin }: { onLogin: (user: any, token: string) => void }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (res.ok) {
            localStorage.setItem("token", data.token);
            localStorage.setItem("role", data.user.role);

            onLogin(data.user, data.token);
        } else {
            setError(data.error || "Login failed");
        }
    };

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required className={styles.input} />
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required className={styles.input} />
            <button type="submit" className={styles.button}>Login</button>
            {error && <div className={styles.error}>{error}</div>}
        </form>
    );
}