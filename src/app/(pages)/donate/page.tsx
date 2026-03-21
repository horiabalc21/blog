"use client";
import React, { useState } from "react";
import styles from './page.module.scss';

export default function DonatePage() {
    const [amount, setAmount] = useState(5);
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const handleDonate = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/create-checkout-session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount, email }),
            });
            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                alert("Failed to start donation session.");
            }
        } catch (err) {
            alert("Error: " + (err as Error).message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Support Our Blog</h2>
            <label className={styles.label}>
                Donation Amount ($):
                <input type="number" min={1} value={amount} onChange={e => setAmount(Number(e.target.value))} className={styles.input} />
            </label>
            <label className={styles.label}>
                Your Email (optional):
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className={styles.input} />
            </label>
            <button type="button" onClick={handleDonate} disabled={loading} className={styles.button}>
                {loading ? "Redirecting..." : "Donate with Stripe"}
            </button>
        </div>
    );
}
