import React, { useState } from "react";
import styles from './DonationModal.module.scss';

interface DonationModalProps {
    open: boolean;
    onClose: () => void;
}

const PRESET_AMOUNTS = [5, 10, 25, 50, 100];

export default function DonationModal({ open, onClose }: DonationModalProps) {
    const [amount, setAmount] = useState<number | string>(5);
    const [customAmount, setCustomAmount] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handlePresetClick = (value: number) => {
        setAmount(value);
        setCustomAmount("");
        setError("");
    };

    const handleCustomAmountChange = (value: string) => {
        const sanitized = value.replace(/[^\d.]/g, '');
        setCustomAmount(sanitized);
        setAmount(sanitized);
        setError("");
    };

    const handleDonate = async () => {
        setLoading(true);
        setError("");
        try {
            const donationAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

            if (!donationAmount || donationAmount < 1) {
                setError("Minimum donation is €1");
                setLoading(false);
                return;
            }

            const res = await fetch("/api/create-checkout-session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount: donationAmount }),
            });
            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                setError("Failed to start donation session.");
            }
        } catch (err) {
            setError("Error: " + (err instanceof Error ? err.message : String(err)));
        } finally {
            setLoading(false);
        }
    };

    if (!open) return null;

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <h2 className={styles.title}>
                    <svg className={styles.heartIcon} width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                    Support Trail Tales
                </h2>
                <p className={styles.description}>
                    Your donation helps us continue sharing amazing stories from the trails and adventures.
                </p>

                <div className={styles.amountSection}>
                    <label className={styles.label}>Select an amount</label>
                    <div className={styles.presetGrid}>
                        {PRESET_AMOUNTS.map(preset => (
                            <button
                                key={preset}
                                type="button"
                                className={`${styles.presetBtn} ${amount === preset ? styles.active : ''}`}
                                onClick={() => handlePresetClick(preset)}
                            >
                                €{preset}
                            </button>
                        ))}
                    </div>
                </div>

                <div className={styles.customSection}>
                    <label htmlFor="custom-amount" className={styles.label}>
                        Or enter a custom amount
                    </label>
                    <div className={styles.inputWrapper}>
                        <svg className={styles.inputIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="1" x2="12" y2="23"></line>
                            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                        </svg>
                        <input
                            id="custom-amount"
                            type="text"
                            value={customAmount}
                            onChange={(e) => handleCustomAmountChange(e.target.value)}
                            placeholder="Enter amount"
                            className={styles.input}
                        />
                    </div>
                    <p className={styles.euroLabel}>Amount in EUR (€)</p>
                </div>

                <div className={styles.actions}>
                    <button
                        type="button"
                        onClick={handleDonate}
                        disabled={loading}
                        className={styles.donateBtn}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                        </svg>
                        {loading ? "Processing..." : "Donate with Stripe"}
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className={styles.closeBtn}
                    >
                        Close
                    </button>
                </div>

                {error && <div className={styles.error}>{error}</div>}
            </div>
        </div>
    );
}
