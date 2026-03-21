"use client";
import LoginForm from "./LoginForm";
import styles from './page.module.scss';

export default function LoginPage() {
    const handleLogin = () => {
        window.location.reload();
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Login</h1>
            <LoginForm onLogin={handleLogin} />
        </div>
    );
}