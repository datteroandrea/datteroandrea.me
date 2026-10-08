import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Markdown from "@/components/Markdown";
import { getAllNoteSlugs, getNotePage, type NotePage } from "@/lib/notes";
import styles from "../notes.module.css";

type Params = { slug: string[] };

export async function generateStaticParams(): Promise<Params[]> {
  const slugs = await getAllNoteSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = await getNotePage(slug);
  if (!page) return { title: "Note not found — Andrea D'Attero" };

  const title =
    page.kind === "chapter"
      ? `${page.chapter.title} — ${page.noteTitle}`
      : page.noteTitle;
  return {
    title: `${title} — Notes — Andrea D'Attero`,
    description: `Notes on ${title} by Andrea D'Attero.`,
  };
}

export default async function NotePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const page = await getNotePage(slug);

  if (!page) notFound();

  return (
    <article className={styles.article}>
      {page.kind === "chapter" ? (
        <Link href={page.href} className={styles.backLink}>
          ← {page.noteTitle}
        </Link>
      ) : (
        <Link href="/notes" className={styles.backLink}>
          ← All notes
        </Link>
      )}
      <NoteBody page={page} />
    </article>
  );
}

function NoteBody({ page }: { page: NotePage }) {
  const link = { path: page.path, ref: page.ref };

  switch (page.kind) {
    case "note":
      return <Markdown content={page.content} link={link} />;

    case "overview": {
      const { intro, contents, anchors } = page.split;
      const overviewLink = { ...link, anchors, chapter: "" };
      return (
        <>
          <Markdown {...intro} link={overviewLink} />
          <nav className={styles.chapters} aria-labelledby="chapters-heading">
            <h2 id="chapters-heading" className={styles.chaptersHeading}>
              {page.chapters.length} chapters
            </h2>
            <ol className={styles.chapterList} role="list">
              {page.chapters.map((chapter) => (
                <li key={chapter.href}>
                  <Link href={chapter.href} className={styles.noteCard}>
                    <span className={styles.noteTitle}>{chapter.title}</span>
                    <span className={styles.noteArrow} aria-hidden="true">
                      →
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </nav>
          {contents.map((section, i) => (
            <Markdown key={i} {...section} link={overviewLink} />
          ))}
        </>
      );
    }

    case "chapter": {
      const { chapter, prev, next } = page;
      return (
        <>
          <Markdown
            content={chapter.content}
            headingIds={chapter.headingIds}
            link={{ ...link, anchors: page.split.anchors, chapter: chapter.slug }}
          />
          <nav className={styles.pager} aria-label="Chapters">
            {prev && (
              <Link href={prev.href} className={styles.pagerLink} rel="prev">
                <span className={styles.pagerLabel}>← Previous</span>
                <span className={styles.noteTitle}>{prev.title}</span>
              </Link>
            )}
            {next && (
              <Link
                href={next.href}
                className={`${styles.pagerLink} ${styles.pagerNext}`}
                rel="next"
              >
                <span className={styles.pagerLabel}>Next →</span>
                <span className={styles.noteTitle}>{next.title}</span>
              </Link>
            )}
          </nav>
        </>
      );
    }
  }
}
