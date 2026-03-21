"use client";
import { useState, useEffect } from "react";
import styles from './UserForm.module.scss';
import DefaultButton from "@/app/components/buttons/DefaultButton/DefaultButton";

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt?: string;
  updatedAt?: string;
};

type Props = {
  onSuccess: () => void;
  onClose: () => void;
  user?: User;
};

export default function UserForm({ onSuccess, onClose, user }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "editor">("editor");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isEditing = !!user;

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setRole(user.role as "admin" | "editor");
      setPassword("");
    } else {
      setName("");
      setEmail("");
      setRole("editor");
      setPassword("");
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!name.trim() || !email.trim()) {
      setError("Name and email are required");
      setLoading(false);
      return;
    }

    if (!isEditing && !password.trim()) {
      setError("Password is required for new users");
      setLoading(false);
      return;
    }

    try {
      const method = isEditing ? "PUT" : "POST";
      const url = isEditing ? `/api/users/${user?.id}` : "/api/users";
      const body: any = { name, email, role };

      if (password.trim()) {
        body.password = password;
      }

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
        setError(data.error || `Failed to ${isEditing ? "update" : "create"} user`);
      }
    } catch (err) {
      setError("Network error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setName("");
    setEmail("");
    setPassword("");
    setRole("editor");
    setError("");
    onClose();
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.formContainer}>
        <h2 className={styles.title}>{isEditing ? "Edit User" : "Add New User"}</h2>
        {error && (
          <div className={styles.error}>{error}</div>
        )}
        <form onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label}>
              Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className={styles.input}
              disabled={loading}
              required
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>
              Email *
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className={styles.input}
              disabled={loading}
              required
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>
              Password {isEditing ? "(leave blank to keep current)" : "*"}
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className={styles.input}
              disabled={loading}
              placeholder={isEditing ? "Enter new password..." : "Enter password..."}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>
              Role
            </label>
            <select
              value={role}
              onChange={e => setRole(e.target.value as "admin" | "editor")}
              className={styles.select}
              disabled={loading}
            >
              <option value="editor">Editor</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          {isEditing && (
            <div className={styles.meta}>
              <div>Created: {user?.createdAt ? new Date(user.createdAt).toLocaleString() : "-"}</div>
              <div>Updated: {user?.updatedAt ? new Date(user.updatedAt).toLocaleString() : "-"}</div>
            </div>
          )}
          <div className={styles.actions}>
            <button
              type="button"
              onClick={handleCancel}
              className={styles.cancelBtn}
              disabled={loading}
            >
              Cancel
            </button>
              <DefaultButton type="submit" text={loading ? "Saving..." : (isEditing ? "Update User" : "Create User")} />
          </div>
        </form>
      </div>
    </div>
  );
}