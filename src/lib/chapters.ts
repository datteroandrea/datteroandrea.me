import GithubSlugger from "github-slugger";
import type { Heading, Nodes, Root } from "mdast";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import { unified } from "unified";
import { visit } from "unist-util-visit";

/**
 * Splits book-sized notes into one page per `## ` chapter. Rendered whole, the
 * largest notes exceed Vercel's ~19 MB limit for prerendered pages.
 */

/** A slice of a note's markdown and the ids its headings have in the full note. */
export type NoteSection = {
  content: string;
  /** Heading ids in document order, as rehype-slug assigns them to the full note. */
  headingIds: string[];
};

export type NoteChapter = NoteSection & {
  /** URL segment, e.g. `12-deep-learning` (the chapter heading's id). */
  slug: string;
  title: string;
};

export type SplitNote = {
  /** Everything before the first chapter (usually the `# Title`). */
  intro: NoteSection;
  /** Hand-written tables of contents (`## Index`, `## Contents`), shown with the intro. */
  contents: NoteSection[];
  chapters: NoteChapter[];
  /** Heading id → slug of the chapter containing it (`""` for the overview). */
  anchors: Record<string, string>;
};

const CONTENTS_TITLE = /^(index|contents|table of contents)$/i;

/**
 * Plain text of a heading as rehype-slug sees it after rendering: raw HTML is
 * dropped and images contribute nothing.
 */
function headingText(node: Nodes): string {
  if (node.type === "text" || node.type === "inlineCode") return node.value;
  if ("children" in node) return node.children.map(headingText).join("");
  return "";
}

const offsetOf = (node: Nodes) => node.position?.start.offset ?? 0;

/**
 * Split a note on its top-level `## ` headings. Returns `null` when the note
 * has fewer than two chapters, in which case it should be rendered whole.
 */
export function splitNote(markdown: string): SplitNote | null {
  const tree = unified().use(remarkParse).use(remarkGfm).parse(markdown) as Root;

  const chapterHeadings = tree.children.filter(
    (node): node is Heading => node.type === "heading" && node.depth === 2,
  );
  if (chapterHeadings.length < 2) return null;

  // Ids the full note would get, so links (e.g. from the Index) resolve to the
  // right chapter and duplicate headings keep their `-1`, `-2` suffixes.
  const slugger = new GithubSlugger();
  const headings: { offset: number; id: string }[] = [];
  visit(tree, "heading", (node) => {
    headings.push({ offset: offsetOf(node), id: slugger.slug(headingText(node)) });
  });

  // Link and footnote definitions apply to the whole note, so every section
  // gets a copy (unreferenced ones render nothing).
  const definitions = tree.children
    .filter((node) => node.type === "definition" || node.type === "footnoteDefinition")
    .map((node) => markdown.slice(offsetOf(node), node.position?.end.offset))
    .join("\n\n");

  const section = (from: number, to: number): NoteSection => ({
    content: definitions
      ? `${markdown.slice(from, to)}\n\n${definitions}\n`
      : markdown.slice(from, to),
    headingIds: headings
      .filter((h) => h.offset >= from && h.offset < to)
      .map((h) => h.id),
  });

  const bounds = chapterHeadings.map(offsetOf);
  const intro = section(0, bounds[0]);
  const contents: NoteSection[] = [];
  const chapters: NoteChapter[] = [];
  const anchors: Record<string, string> = {};
  for (const id of intro.headingIds) anchors[id] = "";

  chapterHeadings.forEach((heading, i) => {
    const part = section(bounds[i], bounds[i + 1] ?? markdown.length);
    const title = headingText(heading).trim();

    if (CONTENTS_TITLE.test(title)) {
      contents.push(part);
      for (const id of part.headingIds) anchors[id] = "";
      return;
    }

    const slug = part.headingIds[0] || `chapter-${chapters.length + 1}`;
    chapters.push({ ...part, slug, title });
    for (const id of part.headingIds) anchors[id] = slug;
  });

  if (chapters.length < 2) return null;
  return { intro, contents, chapters, anchors };
}
