import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeHighlight from "rehype-highlight";
import { makeNoteUrlResolver } from "@/lib/notes";
import styles from "./Markdown.module.css";

type MarkdownProps = {
  /** Raw markdown content. */
  content: string;
  /** Repository path of the note, used to resolve relative links and images. */
  notePath: string;
  /** Commit SHA (or branch) of the notes repo the note was fetched at. */
  noteRef: string;
};

/**
 * Renders note markdown as sanitized HTML. Raw HTML in the source is ignored by
 * default (no `rehype-raw`), so untrusted markup cannot inject scripts. GFM
 * tables/strikethrough/task-lists, heading anchors, and syntax highlighting are
 * enabled.
 */
export default function Markdown({ content, notePath, noteRef }: MarkdownProps) {
  const urlTransform = makeNoteUrlResolver(notePath, noteRef);

  return (
    <div className={styles.prose}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSlug, [rehypeHighlight, { detect: true, ignoreMissing: true }]]}
        urlTransform={urlTransform}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
