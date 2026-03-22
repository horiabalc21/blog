"use client";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import styles from './page.module.scss';
import Image from 'next/image';
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

// Smart truncation that preserves complete markdown syntax
function smartTruncateMarkdown(markdown: string, maxLength: number): string {
  if (markdown.length <= maxLength) {
    return markdown;
  }

  let truncated = markdown.substring(0, maxLength);

  // Count unclosed markdown syntax
  const boldCount = (truncated.match(/\*\*/g) || []).length;
  const italicCount = (truncated.match(/(?<!\*)\*(?!\*)/g) || []).length;
  const codeCount = (truncated.match(/`/g) || []).length;
  const headerMatch = truncated.match(/#+\s[^#\n]*$/);

  // Remove incomplete markdown syntax at the end
  // Remove incomplete bold (**text)
  if (boldCount % 2 !== 0) {
    const lastBoldIndex = truncated.lastIndexOf('**');
    if (lastBoldIndex !== -1) {
      truncated = truncated.substring(0, lastBoldIndex);
    }
  }

  // Remove incomplete italic (*text)
  if (italicCount % 2 !== 0) {
    const lastItalicIndex = truncated.lastIndexOf('*');
    if (lastItalicIndex !== -1 && truncated.charAt(lastItalicIndex - 1) !== '*' && truncated.charAt(lastItalicIndex + 1) !== '*') {
      truncated = truncated.substring(0, lastItalicIndex);
    }
  }

  // Remove incomplete code (`text)
  if (codeCount % 2 !== 0) {
    const lastCodeIndex = truncated.lastIndexOf('`');
    if (lastCodeIndex !== -1) {
      truncated = truncated.substring(0, lastCodeIndex);
    }
  }

  // Remove incomplete headers (# incomplete header at end)
  if (headerMatch) {
    truncated = truncated.substring(0, headerMatch.index);
  }

  // Remove incomplete links [text]( or [text](url
  const incompleteLinkMatch = truncated.match(/\[([^\]]*)\](\([^)]*)?$/);
  if (incompleteLinkMatch) {
    truncated = truncated.substring(0, incompleteLinkMatch.index);
  }

  return truncated.trim();
}

const renderers = {
  img: (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
    const imageUrl = typeof props.src === 'string' && props.src.startsWith('http') ? props.src : `${process.env.NEXT_PUBLIC_BASE_URL}${props.src}`;
    return (
      <Image
        src={imageUrl || ''}
        alt={props.alt || ''}
        width={800}
        height={600}
        style={{ maxWidth: '100%', height: 'auto' }}
      />
    );
  },
};

export default function BlogPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedAuthor, setSelectedAuthor] = useState("");
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);

  const LIMIT = 9;

  useEffect(() => {
    setLoading(true);
    fetch(`/api/articles?limit=${LIMIT}&offset=0`)
      .then((res) => res.json())
      .then((data) => {
        const articlesArr = Array.isArray(data.articles)
          ? data.articles
          : Array.isArray(data)
            ? data
            : [];
        // Only show published articles
        const filteredArticles = articlesArr.filter((article: Article) => article.published);
        setArticles(filteredArticles);
        setTotal(data.total || articlesArr.length || 0);
        setOffset(articlesArr.length);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching articles:", error);
        setLoading(false);
      });
  }, []);

  const handleLoadMore = () => {
    setLoadingMore(true);
    fetch(`/api/articles?limit=${LIMIT}&offset=${offset}`)
      .then((res) => res.json())
      .then((data) => {
        const newArticles = Array.isArray(data.articles) ? data.articles : [];
        setArticles(prevArticles => [
          ...prevArticles,
          ...newArticles.filter((article: Article) => article.published)
        ]);
        setOffset(offset + newArticles.length);
        setLoadingMore(false);
      })
      .catch((error) => {
        console.error("Error loading more articles:", error);
        setLoadingMore(false);
      });
  };
  console.log({articles});
  const filteredArticles = articles.filter((article) => {
    const matchesTitle = article.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory ? article.category?.name === selectedCategory : true;
    const matchesAuthor = selectedAuthor ? article.author?.name === selectedAuthor : true;
    return matchesTitle && matchesCategory && matchesAuthor;
  });

  if (loading) {
    return (
      <div className={styles.loading}>
        <p>Loading articles...</p>
      </div>
    );
  }

  const categories = Array.from(new Set(articles.map((article) => article.category?.name).filter(Boolean)));
  const authors = Array.from(new Set(articles.map((article) => article.author?.name).filter(Boolean)));
  // Color palette for category badges
  const categoryColors = [
    '#166534','#166534', '#dc2626', '#ca8a04', '#7c3aed', '#db2777', '#0891b2'
  ];

  // Remove unused variable in getCategoryColor
  const getCategoryColor = (categoryName: string) => {
    const index = categoryName.length % categoryColors.length;
    return categoryColors[0];
  };


  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <div className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Stories from the Trail</h1>
          <p className={styles.heroSubtitle}>
            Adventures, insights, and inspiration from the mountains, forests, and trails that we love
          </p>
        </div>
      </div>
      {/* Filters */}
        <div className={styles.filtersContent}>
          <div className={styles.filtersInner}>
            {/* Search Bar */}
            <div className={styles.searchWrapper}>
              <svg className={styles.searchIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search articles by title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.input}
              />
            </div>

            {/* Category and Author Filters */}
            <div className={styles.filterRow}>
              <div className={styles.filterControls}>
                <span className={styles.filterLabel}>Filter by:</span>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className={styles.select}
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedAuthor}
                  onChange={(e) => setSelectedAuthor(e.target.value)}
                  className={styles.select}
                >
                  <option value="">All Authors</option>
                  {authors.map((author) => (
                    <option key={author} value={author}>
                      {author}
                    </option>
                  ))}
                </select>
              </div>
              <span className={styles.articleCount}>
                {filteredArticles.length} {filteredArticles.length === 1 ? 'article' : 'articles'}
              </span>
            </div>
          </div>
        </div>
      {/* Articles Grid */}
      <div className={styles.content}>
        {filteredArticles.length === 0 ? (
          <div className={styles.emptyState}>
            <p className={styles.emptyText}>No articles found. Try adjusting your filters.</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {filteredArticles.map((article) => {
              const categoryColor = getCategoryColor(article.category?.name || '');
              return (
                <article
                  key={article.id}
                  className={styles.articleCard}
                  onClick={() => window.location.href = `/blog/${article.id}`}
                >
                  {/* Category color bar */}
                  <div
                    className={styles.categoryBar}
                    style={{ backgroundColor: categoryColor }}
                  />

                  {/* Content */}
                  <div className={styles.cardContent}>
                    <div className={styles.cardMeta}>
                      <span
                        className={styles.badge}
                        style={{ backgroundColor: categoryColor }}
                      >
                        {article.category?.name || "Uncategorized"}
                      </span>
                      {/*<span className={styles.readTime}>*/}
                      {/*  <svg className={styles.clockIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">*/}
                      {/*    <circle cx="12" cy="12" r="10"/>*/}
                      {/*    <polyline points="12,6 12,12 16,14"/>*/}
                      {/*  </svg>*/}
                      {/*  5 min read*/}
                      {/*</span>*/}
                    </div>

                    <h2 className={styles.articleTitle}>{article.title}</h2>

                    <div className={styles.articleExcerpt}>
                      <ReactMarkdown components={renderers} remarkPlugins={[remarkGfm]}>
                        {smartTruncateMarkdown(article.content, 150) + (article.content.length > 150 ? "..." : "")}
                      </ReactMarkdown>
                    </div>

                    {/* Author */}
                    <div className={styles.authorSection}>
                      {/*<div className={styles.authorAvatar} />*/}
                      <div className={styles.authorInfo}>
                        <p className={styles.authorName}>{article.author?.name || "Unknown"}</p>
                        <p className={styles.authorDate}>
                            {article.updatedAt && new Date(article.updatedAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                            })}
                        </p>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}

          </div>
        )}
      </div>
        {/* Load More Button */}
        {offset < total && (
            <div className={styles.loadMoreWrapper}>
                {/*<button className={styles.loadMoreBtn} onClick={handleLoadMore} disabled={loadingMore}>*/}
                {/*  {loadingMore ? "Loading..." : "Load More"}*/}
                {/*</button>*/}
                <DefaultButton type='button' text={loadingMore ? "Loading..." : "Load More"} onClick={handleLoadMore} disabled={loadingMore} />
            </div>
        )}
    </div>
  );
}