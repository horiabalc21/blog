"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import styles from "./page.module.scss";

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"success" | "error" | "pending">("pending");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    const token = searchParams?.get("token");
    if (!token) {
      setStatus("error");
      setMessage("Invalid verification link.");
      return;
    }
    fetch(`/api/verify?token=${token}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.message && data.message.toLowerCase().includes("verified")) {
          setStatus("success");
          setMessage("Your email has been verified! Thank you for subscribing.");
        } else {
          setStatus("error");
          setMessage(data.message || "Verification failed.");
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Verification failed. Please try again later.");
      });
  }, [searchParams]);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Email Verification</h1>
      <div className={styles.message + " " + (status === "success" ? styles.success : styles.error)}>
        {message}
      </div>
      {status === "success" && (
        <Link href="/bloglist">
          <button className={styles.button}>Go to Blog</button>
        </Link>
      )}
      {status === "error" && (
        <Link href="/public">
          <button className={styles.button}>Go Home</button>
        </Link>
      )}
    </div>
  );
}
