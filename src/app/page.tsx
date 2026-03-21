import Image from "next/image";
import styles from "./page.module.css";
import BlogPage from "@/app/(pages)/bloglist/page";

export default function Home() {
  return (
    <div className={styles.page}>
        <BlogPage />
    </div>
  );
}
