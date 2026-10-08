import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeHighlight from "rehype-highlight";
import type { Element, Root } from "hast";
import type { PluggableList } from "unified";
import { visit } from "unist-util-visit";
import { makeNoteUrlResolver, type NoteLinkContext } from "@/lib/notes";
import styles from "./Markdown.module.css";

type MarkdownProps = {
  /** Raw markdown content. */
  content: string;
  /** The note being rendered, used to resolve relative links and images. */
  link: NoteLinkContext;
  /**
   * Heading ids to use instead of slugging the headings here, so a chapter of
   * a split note keeps the ids its headings have in the full note.
   */
  headingIds?: string[];
};

/** Assign precomputed ids to headings in order; any left over get rehype-slug's. */
function rehypeHeadingIds({ ids }: { ids: string[] }) {
  return (tree: Root) => {
    let i = 0;
    visit(tree, "element", (node: Element) => {
      if (!/^h[1-6]$/.test(node.tagName)) return;
      const id = ids[i++];
      if (id) node.properties.id = id;
    });
  };
}

/**
 * Renders note markdown as sanitized HTML. Raw HTML in the source is ignored by
 * default (no `rehype-raw`), so untrusted markup cannot inject scripts. GFM
 * tables/strikethrough/task-lists, heading anchors, and syntax highlighting are
 * enabled.
 */
export default function Markdown({ content, link, headingIds }: MarkdownProps) {
  const urlTransform = makeNoteUrlResolver(link);
  const rehypePlugins: PluggableList = [
    rehypeSlug,
    [rehypeHighlight, { detect: true, ignoreMissing: true }],
  ];
  if (headingIds) rehypePlugins.unshift([rehypeHeadingIds, { ids: headingIds }]);

  return (
    <div className={styles.prose}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={rehypePlugins}
        urlTransform={urlTransform}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
