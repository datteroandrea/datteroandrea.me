import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Markdown from "@/components/Markdown";
import { getAllNotes, getNote } from "@/lib/notes";
import styles from "../notes.module.css";

type Params = { slug: string[] };

export async function generateStaticParams(): Promise<Params[]> {
  const notes = await getAllNotes();
  return notes.map((note) => ({ slug: note.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const note = await getNote(slug);
  if (!note) return { title: "Note not found — Andrea D'Attero" };
  return {
    title: `${note.title} — Notes — Andrea D'Attero`,
    description: `Notes on ${note.title} by Andrea D'Attero.`,
  };
}

export default async function NotePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const note = await getNote(slug);

  if (!note) notFound();

  return (
    <article className={styles.article}>
      <Link href="/notes" className={styles.backLink}>
        ← All notes
      </Link>
      <Markdown content={note.content} notePath={note.path} />
    </article>
  );
}
