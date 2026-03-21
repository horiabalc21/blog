import { useEffect, useState } from "react";
import LoginPage from "@/app/(pages)/login/page"; // Adjust import as needed
import { jwtDecode } from "jwt-decode";
import styles from './RequireRole.module.scss';

type JwtPayload = { role: string };
export function RequireRole({ allowedRoles, children }: { allowedRoles: string[], children: React.ReactNode }) {
    const [role, setRole] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

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
        setLoading(false);
    }, []);

    if (loading) {
        return <div className={styles.loading}>Loading...</div>;
    }

    if ((!role || !allowedRoles.includes(role)) && !loading) {
        return <LoginPage />;
    }

    return <>{children}</>;
}