"use client";
import { useEffect, useState } from "react";
import UserForm from "@/app/components/forms/UserForm/UserForm"; // Change this line
import Table from "../../components/Table/Table";
import {RequireRole} from "@/app/components/RequireRole/RequireRole";
import styles from './page.module.scss';
import DefaultButton from "@/app/components/buttons/DefaultButton/DefaultButton";

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);

  const fetchUsers = () => {
    setLoading(true);
    fetch("/api/users")
      .then((res) => res.json())
      .then((data) => {
        setUsers(data);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAdd = () => {
    setEditUser(null);
    setShowForm(true);
  };

  const handleEdit = (user: User) => {
    setEditUser(user);
    setShowForm(true);
  };

  const handleDelete = async (user: User) => {
    const confirmed = window.confirm(`Are you sure you want to delete user "${user.name}"?`);
    if (!confirmed) return;
    const res = await fetch(`/api/users/${user.id}`, { method: "DELETE" });
    if (res.ok) {
      fetchUsers();
    } else {
      alert("Failed to delete user.");
    }
  };

  const columns = [
    { key: "id", label: "ID" },
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "role", label: "Role" },
  ];

  return (
      <RequireRole allowedRoles={["admin"]}>
          <div className={styles.container}>
              <h1 className={styles.title}>All Users</h1>
              <DefaultButton type='button' text='Add User' onClick={handleAdd}/>

              {showForm && (
                <UserForm
                  onSuccess={fetchUsers}
                  onClose={() => setShowForm(false)}
                  user={editUser || undefined}
                />
              )}
              {loading ? (
                <p className={styles.loading}>Loading...</p>
              ) : (
                <Table
                  columns={columns}
                  data={users}
                  actions={(user) => (
                    <>
                      <button className={styles.actionBtn} onClick={() => handleEdit(user)}>Edit</button>
                      <button
                        className={`${styles.actionBtn} ${styles.deleteBtn}`}
                        onClick={() => handleDelete(user)}
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
