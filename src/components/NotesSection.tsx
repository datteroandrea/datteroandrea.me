import Link from "next/link";
import AnimatedSection from "./AnimatedSection";
import { getNoteCategories, type NoteCategory } from "@/lib/notes";
import styles from "./NotesSection.module.css";

export default async function NotesSection() {
  let categories: NoteCategory[] = [];
  let total = 0;
  try {
    categories = await getNoteCategories();
    total = categories.reduce((sum, c) => sum + c.notes.length, 0);
  } catch {
    // GitHub unreachable — fall back to a simple teaser without live counts.
  }

  return (
    <section id="notes" className={styles.section} aria-labelledby="notes-heading">
      <div className="container">
        <AnimatedSection>
          <div className={styles.card}>
            <div className={styles.content}>
              <p className={styles.eyebrow}>Notes</p>
              <h2 id="notes-heading" className={styles.heading}>
                I write down what I learn
              </h2>
              <p className={styles.description}>
                {total > 0
                  ? `A living collection of ${total} note${total === 1 ? "" : "s"} on computer science, system design, and languages — pulled straight from my open notes repository.`
                  : "A living collection of notes on computer science, system design, and languages — pulled straight from my open notes repository."}
              </p>

              {categories.length > 0 && (
                <ul className={styles.tags} role="list" aria-label="Note categories">
                  {categories
                    .filter((c) => c.key)
                    .map((category) => (
                      <li key={category.key} className={styles.tag}>
                        {category.name}
                      </li>
                    ))}
                </ul>
              )}
            </div>

            <Link href="/notes" className={styles.cta}>
              Browse notes →
            </Link>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
