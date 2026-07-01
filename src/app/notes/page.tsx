import type { Metadata } from "next";
import Link from "next/link";
import AnimatedSection from "@/components/AnimatedSection";
import { getNoteCategories } from "@/lib/notes";
import styles from "./notes.module.css";

export const metadata: Metadata = {
  title: "Notes — Andrea D'Attero",
  description:
    "Personal engineering and study notes on computer science, system design, languages and more — sourced live from my open notes repository.",
};

export default async function NotesIndexPage() {
  const categories = await getNoteCategories();
  const total = categories.reduce((sum, c) => sum + c.notes.length, 0);

  return (
    <div className="container">
      <AnimatedSection>
        <header className={styles.pageHeader}>
          <p className={styles.eyebrow}>Notes</p>
          <h1 className={styles.pageTitle}>Things I&apos;m learning</h1>
          <p className={styles.lead}>
            A living collection of {total} note{total === 1 ? "" : "s"} on
            computer science, system design, and languages — written for myself
            and pulled straight from my{" "}
            <a
              href="https://github.com/datteroandrea/notes"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.inlineLink}
            >
              open notes repository ↗
            </a>
            .
          </p>
        </header>
      </AnimatedSection>

      {categories.length === 0 ? (
        <p className={styles.empty}>No notes published yet — check back soon.</p>
      ) : (
        <div className={styles.categories}>
          {categories.map((category, i) => (
            <AnimatedSection key={category.key || "general"} delay={i * 0.05}>
              <section className={styles.category}>
                <h2 className={styles.categoryName}>{category.name}</h2>
                <ul className={styles.noteList} role="list">
                  {category.notes.map((note) => (
                    <li key={note.path}>
                      <Link
                        href={`/notes/${note.slug.join("/")}`}
                        className={styles.noteCard}
                      >
                        <span className={styles.noteTitle}>{note.title}</span>
                        <span className={styles.noteArrow} aria-hidden="true">
                          →
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            </AnimatedSection>
          ))}
        </div>
      )}
    </div>
  );
}
