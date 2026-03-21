"use client";
import React, {useEffect, useState} from "react";
import Link from "next/link";
import { jwtDecode } from "jwt-decode";
import SubscribeModal from "@/app/components/modals/SubscribeModal/SubscribeModal";
import DonationButton from "@/app/components/buttons/DonationButton/DonationButton";
import styles from './MainNavbar.module.scss';

type JwtPayload = { role: string };
export function MainNavbar() {
    const [role, setRole] = useState<string | null>(null);
    const [showSubscribe, setShowSubscribe] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const decoded = jwtDecode<JwtPayload>(token);
                setRole(decoded.role);
            } catch {
                setRole(null);
            }
        }
    }, []);

    if (role === null) {
        return null;
    }

    return (
        <nav className={styles.navbar}>
            <div className={styles.container}>
                <div className={styles.content}>
                    <Link href="/" className={styles.logo}>
                        <div className={styles.logoText}>
                            <span className={styles.logoTitle}>Trail Tales</span>
                            <span className={styles.logoSubtitle}>Stories & Adventures</span>
                        </div>
                    </Link>

                    {/* Navigation */}
                    <div className={styles.navigation}>
                        {/* Desktop Navigation */}
                        <div className={styles.navLinks}>
                            <Link href="/" className={styles.link}>
                                Blog
                            </Link>
                            {(role === "admin" || role === "editor") && (
                                <>
                                    <Link href="/articles" className={styles.link}>Articles</Link>
                                    <Link href="/categories" className={styles.link}>Categories</Link>
                                </>
                            )}
                            {role === "admin" && (
                                <Link href="/users" className={styles.link}>Users</Link>
                            )}

                            <button
                                type="button"
                                onClick={() => setShowSubscribe(true)}
                                className={styles.iconButton}
                                title="Subscribe to newsletter"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
                                    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
                                </svg>
                            </button>

                            <DonationButton />
                        </div>

                        {/* Mobile Menu */}
                        <div className={styles.mobileMenu}>
                            <button
                                type="button"
                                onClick={() => setShowSubscribe(true)}
                                className={styles.iconButton}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
                                    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
                                </svg>
                            </button>
                            <DonationButton />
                        </div>
                    </div>
                </div>
            </div>
            <SubscribeModal open={showSubscribe} onClose={() => setShowSubscribe(false)} />
        </nav>
    );
}
