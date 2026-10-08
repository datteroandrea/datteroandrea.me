import "server-only";
import { splitNote, type NoteChapter, type SplitNote } from "./chapters";

/**
 * Data layer for the Notes section. Content is sourced live from the public
 * GitHub repository `datteroandrea/notes` via the jsDelivr CDN.
 *
 * jsDelivr mirrors public GitHub repos with no API rate limit and global edge
 * caching, so no credentials are required:
 * 
 *   - File listing: https://data.jsdelivr.com/v1/packages/gh/<owner>/<repo>@<ref>
 *   - File content: https://cdn.jsdelivr.net/gh/<owner>/<repo>@<ref>/<path>
 *
 * Note: the repo must remain public (jsDelivr does not serve private repos).
 * jsDelivr caches branch refs (`@main`) for hours and named refs like `@HEAD`
 * for up to a year, so both URLs are pinned to the latest commit SHA of
 * NOTES_BRANCH (see `resolveNotesRef`). SHA URLs are immutable, so jsDelivr
 * can never serve a stale tree for them.
 */

export const NOTES_OWNER = "datteroandrea";
export const NOTES_REPO = "notes";
export const NOTES_BRANCH = "main";

// Git's smart-HTTP ref advertisement (what `git clone` reads first): ~1 KB,
// no token, and not subject to the REST API's 60 requests/hour limit.
const GIT_REFS_URL = `https://github.com/${NOTES_OWNER}/${NOTES_REPO}.git/info/refs?service=git-upload-pack`;
const COMMIT_URL = `https://api.github.com/repos/${NOTES_OWNER}/${NOTES_REPO}/commits/${NOTES_BRANCH}`;

const cdnRoot = (ref: string) =>
  `https://cdn.jsdelivr.net/gh/${NOTES_OWNER}/${NOTES_REPO}@${ref}/`;
const listingUrl = (ref: string) =>
  `https://data.jsdelivr.com/v1/packages/gh/${NOTES_OWNER}/${NOTES_REPO}@${ref}`;

// Re-resolve the latest commit at most once an hour (ISR). Notes change
// infrequently.
const REVALIDATE_SECONDS = 3600;

const SHA = /^[0-9a-f]{40}$/i;

async function shaFromGitRefs(): Promise<string | null> {
  const res = await fetch(GIT_REFS_URL, {
    next: { revalidate: REVALIDATE_SECONDS },
  });
  if (!res.ok) throw new Error(`git refs: ${res.status} ${res.statusText}`);
  // Lines look like `003d<sha> refs/heads/main` (4-hex-digit length prefix).
  const match = (await res.text()).match(
    new RegExp(`([0-9a-f]{40}) refs/heads/${NOTES_BRANCH}\\n`),
  );
  return match?.[1] ?? null;
}

async function shaFromApi(): Promise<string | null> {
  const headers: HeadersInit = { Accept: "application/vnd.github.sha" };
  // Optional: raises the REST API limit on shared serverless IPs.
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  const res = await fetch(COMMIT_URL, {
    headers,
    cache: "force-cache",
    next: { revalidate: REVALIDATE_SECONDS },
  });
  if (!res.ok) throw new Error(`GitHub API: ${res.status} ${res.statusText}`);
  const sha = (await res.text()).trim();
  return SHA.test(sha) ? sha : null;
}

/**
 * Resolve the latest commit SHA of NOTES_BRANCH, trying git's ref
 * advertisement and then the GitHub API. Falls back to the branch name if
 * both fail, which may be stale but keeps the section working.
 */
async function resolveNotesRef(): Promise<string> {
  const errors: unknown[] = [];
  for (const source of [shaFromGitRefs, shaFromApi]) {
    try {
      const sha = await source();
      if (sha) return sha;
    } catch (error) {
      errors.push(error);
    }
  }
  console.warn(
    `Failed to resolve notes commit SHA; falling back to @${NOTES_BRANCH}`,
    ...errors,
  );
  return NOTES_BRANCH;
}

export type NoteFile = {
  /** Repository path, e.g. `computer-science/data-science.md`. */
  path: string;
  /** URL segments for the /notes route, e.g. `["computer-science", "data-science"]`. */
  slug: string[];
  /** Human-readable title derived from the file name. */
  title: string;
};

export type NoteCategory = {
  /** Top-level directory, e.g. `computer-science` (empty string for root files). */
  key: string;
  /** Human-readable category name. */
  name: string;
  notes: NoteFile[];
};

type JsDelivrEntry =
  | { type: "file"; name: string; hash?: string; size?: number }
  | { type: "directory"; name: string; files?: JsDelivrEntry[] };

type JsDelivrListing = {
  files?: JsDelivrEntry[];
  status?: string;
  message?: string;
};

/** Recursively flatten jsDelivr's nested tree into full file paths. */
function flattenPaths(entries: JsDelivrEntry[], prefix = ""): string[] {
  const paths: string[] = [];
  for (const entry of entries) {
    const path = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.type === "directory") {
      paths.push(...flattenPaths(entry.files ?? [], path));
    } else {
      paths.push(path);
    }
  }
  return paths;
}

function humanize(segment: string): string {
  return segment
    .replace(/\.md$/i, "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Fetch the full tree of the notes repo from jsDelivr and return every
 * markdown file grouped by its top-level directory.
 */
export async function getNoteCategories(): Promise<NoteCategory[]> {
  const ref = await resolveNotesRef();
  const res = await fetch(listingUrl(ref), {
    next: { revalidate: REVALIDATE_SECONDS },
  });

  if (!res.ok) {
    throw new Error(
      `Failed to load notes listing from jsDelivr (${res.status} ${res.statusText})`,
    );
  }

  const data = (await res.json()) as JsDelivrListing;
  const paths = flattenPaths(data.files ?? []).filter((p) =>
    p.toLowerCase().endsWith(".md"),
  );

  const byCategory = new Map<string, NoteCategory>();

  for (const path of paths) {
    const slug = path.replace(/\.md$/i, "").split("/");
    const key = slug.length > 1 ? slug[0] : "";
    const note: NoteFile = {
      path,
      slug,
      title: humanize(slug[slug.length - 1]),
    };

    let category = byCategory.get(key);
    if (!category) {
      category = { key, name: key ? humanize(key) : "General", notes: [] };
      byCategory.set(key, category);
    }
    category.notes.push(note);
  }

  const categories = [...byCategory.values()];
  // Sort notes within a category, and root-level "General" notes first.
  for (const category of categories) {
    category.notes.sort((a, b) => a.title.localeCompare(b.title));
  }
  categories.sort((a, b) => {
    if (a.key === "") return -1;
    if (b.key === "") return 1;
    return a.name.localeCompare(b.name);
  });

  return categories;
}

/** Flat list of every note (used for validation and static generation). */
export async function getAllNotes(): Promise<NoteFile[]> {
  const categories = await getNoteCategories();
  return categories.flatMap((c) => c.notes);
}

// Notes larger than this are split into one page per `## ` chapter (see
// chapters.ts); rendered whole they approach Vercel's 19 MB page limit.
const SPLIT_THRESHOLD_BYTES = 512 * 1024;

/** A note's markdown, or its chapters when it is large enough to be split. */
type LoadedNote = string | SplitNote;

// Next's data cache skips responses over 2 MB, so without this every chapter
// page would re-download and re-parse its whole note. Entries are keyed by
// commit SHA and dropped when it changes; the mutable branch fallback is only
// trusted for REVALIDATE_SECONDS.
let loadedRef = "";
let loadedAt = 0;
const loadedNotes = new Map<string, Promise<LoadedNote | null>>();

async function fetchNote(path: string, ref: string): Promise<LoadedNote | null> {
  const res = await fetch(cdnRoot(ref) + encodeURI(path), {
    next: { revalidate: REVALIDATE_SECONDS },
  });
  if (!res.ok) return null;

  const content = await res.text();
  if (content.length <= SPLIT_THRESHOLD_BYTES) return content;
  return splitNote(content) ?? content;
}

function loadNote(path: string, ref: string): Promise<LoadedNote | null> {
  const expired =
    ref === NOTES_BRANCH && Date.now() - loadedAt > REVALIDATE_SECONDS * 1000;
  if (ref !== loadedRef || expired) {
    loadedNotes.clear();
    loadedRef = ref;
    loadedAt = Date.now();
  }
  let loaded = loadedNotes.get(path);
  if (!loaded) {
    // Don't remember failures (likely transient: the path is allow-listed).
    loaded = fetchNote(path, ref).then(
      (note) => {
        if (note === null) loadedNotes.delete(path);
        return note;
      },
      (error: unknown) => {
        loadedNotes.delete(path);
        throw error;
      },
    );
    loadedNotes.set(path, loaded);
  }
  return loaded;
}

export type ChapterLink = { href: string; title: string };

type NotePageBase = {
  path: string;
  /** Commit SHA (or branch fallback) the content was fetched at. */
  ref: string;
  /** Route of the note (or of a split note's overview), e.g. `/notes/math/calculus`. */
  href: string;
  noteTitle: string;
};

/** What a `/notes/...` route renders. */
export type NotePage = NotePageBase &
  (
    | { kind: "note"; content: string }
    | {
        /** Landing page of a split note: intro, chapter list, Index. */
        kind: "overview";
        split: SplitNote;
        chapters: ChapterLink[];
      }
    | {
        kind: "chapter";
        split: SplitNote;
        chapter: NoteChapter;
        prev: ChapterLink | null;
        next: ChapterLink | null;
      }
  );

/**
 * Resolve a `/notes/...` route: either a note (`[..., "data-science"]`) or a
 * chapter of a split note (`[..., "data-science", "12-deep-learning"]`).
 * Returns `null` for anything that is not in the repository's tree, which
 * prevents fetching arbitrary paths.
 */
export async function getNotePage(slug: string[]): Promise<NotePage | null> {
  // Allow-list against the actual tree — this also blocks path traversal.
  const notes = await getAllNotes();
  const findNote = (segments: string[]) =>
    segments.length > 0
      ? notes.find((n) => n.path === `${segments.join("/")}.md`)
      : undefined;

  // Memoized by Next's fetch cache, so this matches the ref used for the tree.
  const ref = await resolveNotesRef();

  const note = findNote(slug);
  if (note) {
    const loaded = await loadNote(note.path, ref);
    if (loaded === null) return null;

    const base = basePage(note, ref);
    if (typeof loaded === "string") {
      return { ...base, kind: "note", content: loaded };
    }
    return {
      ...base,
      kind: "overview",
      split: loaded,
      chapters: loaded.chapters.map((c) => chapterLink(base.href, c)),
    };
  }

  const parent = findNote(slug.slice(0, -1));
  if (!parent) return null;
  const loaded = await loadNote(parent.path, ref);
  if (loaded === null || typeof loaded === "string") return null;

  const chapters = loaded.chapters;
  const index = chapters.findIndex((c) => c.slug === slug[slug.length - 1]);
  if (index < 0) return null;

  const base = basePage(parent, ref);
  return {
    ...base,
    kind: "chapter",
    split: loaded,
    chapter: chapters[index],
    prev: index > 0 ? chapterLink(base.href, chapters[index - 1]) : null,
    next:
      index < chapters.length - 1
        ? chapterLink(base.href, chapters[index + 1])
        : null,
  };
}

function basePage(note: NoteFile, ref: string): NotePageBase {
  return {
    path: note.path,
    ref,
    href: `/notes/${note.slug.join("/")}`,
    noteTitle: note.title,
  };
}

function chapterLink(noteHref: string, chapter: NoteChapter): ChapterLink {
  return { href: `${noteHref}/${chapter.slug}`, title: chapter.title };
}

/** Route slugs of every note and every chapter of a split note. */
export async function getAllNoteSlugs(): Promise<string[][]> {
  const [notes, ref] = await Promise.all([getAllNotes(), resolveNotesRef()]);
  const slugs = await Promise.all(
    notes.map(async (note) => {
      const loaded = await loadNote(note.path, ref);
      if (!loaded || typeof loaded === "string") return [note.slug];
      return [
        note.slug,
        ...loaded.chapters.map((c) => [...note.slug, c.slug]),
      ];
    }),
  );
  return slugs.flat();
}

/** How links inside a note (or a section of a split note) are resolved. */
export type NoteLinkContext = {
  path: string;
  ref: string;
  /** Split notes: heading id → chapter slug (`""` for the overview). */
  anchors?: Record<string, string>;
  /** Split notes: slug of the chapter being rendered (`""` for the overview). */
  chapter?: string;
};

/**
 * Build a URL transformer for a note, used by the markdown renderer to:
 *  - resolve relative image/resource paths to the jsDelivr content CDN
 *  - rewrite relative links to other `.md` notes into internal /notes routes
 *  - point anchors in a split note at the chapter containing the heading
 *  - leave other anchors and absolute URLs untouched
 *  - strip dangerous protocols
 */
export function makeNoteUrlResolver({
  path: notePath,
  ref,
  anchors,
  chapter = "",
}: NoteLinkContext): (url: string) => string {
  const dir = notePath.includes("/")
    ? notePath.slice(0, notePath.lastIndexOf("/"))
    : "";
  const noteHref = `/notes/${notePath.slice(0, -3)}`;

  const resolveAnchor = (hash: string): string => {
    let id = hash.slice(1);
    try {
      id = decodeURIComponent(id);
    } catch {
      // Malformed escape — look the id up as written.
    }
    const target = anchors?.[id];
    if (target === undefined || target === chapter) return hash;
    return `${target ? `${noteHref}/${target}` : noteHref}${hash}`;
  };

  return (url: string): string => {
    if (!url) return "";
    if (/^\s*(javascript|data|vbscript):/i.test(url)) return "";
    if (url.startsWith("#")) return resolveAnchor(url);
    if (/^[a-z][a-z0-9+.-]*:/i.test(url) || url.startsWith("//")) return url;

    // Relative path — resolve against the note's directory.
    const hashIndex = url.indexOf("#");
    const hash = hashIndex >= 0 ? url.slice(hashIndex) : "";
    const rawPath = hashIndex >= 0 ? url.slice(0, hashIndex) : url;

    const stack: string[] = [];
    for (const segment of (dir ? dir.split("/") : []).concat(rawPath.split("/"))) {
      if (segment === "" || segment === ".") continue;
      if (segment === "..") stack.pop();
      else stack.push(segment);
    }
    const resolved = stack.join("/");

    if (resolved === notePath) {
      return hash ? resolveAnchor(hash) : noteHref;
    }
    if (resolved.toLowerCase().endsWith(".md")) {
      return `/notes/${resolved.slice(0, -3)}${hash}`;
    }
    return `${cdnRoot(ref)}${encodeURI(resolved)}${hash}`;
  };
}
