"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import DonationButton from "@/app/components/buttons/DonationButton/DonationButton";
import styles from './page.module.scss';
import SubscribeModal from "@/app/components/modals/SubscribeModal/SubscribeModal";
import DefaultButton from "@/app/components/buttons/DefaultButton/DefaultButton";

type Article = {
  id: number;
  title: string;
  content: string;
  published: boolean;
  category: { id: number; name: string };
  author: { id: number; name: string };
  updatedAt?: Date;
};

const renderers = {
  img: ({ src, alt }: { src?: string; alt?: string }) => {
    if (!src) return null;

    const imageUrl = src.startsWith("http")
      ? src
      : `${process.env.NEXT_PUBLIC_BASE_URL}${src}`;

    return (
      <img
        src={imageUrl}
        alt={alt || "Image"}
        width={800}
        height={600}
        style={{ maxWidth: "100%", height: "auto" }}
      />
    );
  },
};

export default function BlogArticlePage() {
    const [article, setArticle] = useState<Article | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const params = useParams();
    const articleId = params?.id;
    const [showSubscribe, setShowSubscribe] = useState(false);

    useEffect(() => {
        if (articleId) {
            fetch(`/api/articles/${articleId}`)
                .then((res) => {
                    if (!res.ok) throw new Error("Article not found");
                    return res.json();
                })
                .then((data) => {
                    if (!data.published) {
                        setError("This article is not published yet.");
                    } else {
                        setArticle(data);
                    }
                    setLoading(false);
                })
                .catch(() => {
                    setError("Article not found or failed to load");
                    setLoading(false);
                });
        } else {
            setError("No article ID provided");
            setLoading(false);
        }
    }, [articleId]);

    const handleSubscribe = async () => {
      try {
        const response = await fetch("/api/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });

        const data = await response.json();
        setMessage(data.message);
      } catch (error) {
        setMessage("Failed to subscribe.");
      }
    };

    if (loading) {
        return (
            <div className={`${styles.container} ${styles.centered}`}>
                <p>Loading article...</p>
            </div>
        );
    }

    if (error || !article) {
        return (
            <div className={`${styles.container} ${styles.centered}`}>
                <h2>Article Not Found</h2>
                <p>{error || "The article you're looking for doesn't exist."}</p>
                <DefaultButton text="Go Back" onClick={() => window.history.back()} />
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>{article.title}</h1>
                <div className={styles.meta}>
                    <span>
                        <strong>Author:</strong> {article.author?.name || "Unknown"}
                    </span>
                    <span>
                        <strong>Category:</strong>
                        <span className={styles.category}>
                            {article.category?.name || "Uncategorized"}
                        </span>
                    </span>
                    <span>
                        <strong>Date:</strong>
                        <span className={styles.category}>
                            {article.updatedAt && new Date(article.updatedAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                            })}
                        </span>
                    </span>
                </div>
            </header>
            <main className={styles.main}>
                <ReactMarkdown components={renderers} remarkPlugins={[remarkGfm]}>
                    {article.content}
                </ReactMarkdown>
            </main>
            <footer className={styles.footer}>
                <DonationButton amount={5} />
                <DefaultButton text="Subscribe to Newsletter" onClick={() => setShowSubscribe(true)}/>
                <SubscribeModal open={showSubscribe} onClose={() => setShowSubscribe(false)} />

            </footer>
        </div>
    );
}
