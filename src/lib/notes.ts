import "server-only";

/**
 * Data layer for the Notes section. Content is sourced live from the public
 * GitHub repository `datteroandrea/notes`.
 *
 * The repository is public, so no credentials are required. If you make the
 * repo private (or start hitting the unauthenticated GitHub rate limit of 60
 * req/hour), set `GITHUB_NOTES_TOKEN` in the environment and it will be sent as
 * a Bearer token. Never hard-code a token in source.
 */

export const NOTES_OWNER = "datteroandrea";
export const NOTES_REPO = "notes";
export const NOTES_BRANCH = "main";

const RAW_ROOT = `https://raw.githubusercontent.com/${NOTES_OWNER}/${NOTES_REPO}/${NOTES_BRANCH}/`;

// Re-fetch from GitHub at most once an hour (ISR). Notes change infrequently.
const REVALIDATE_SECONDS = 3600;

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

type GitHubTreeEntry = {
  path: string;
  type: "blob" | "tree";
};

type GitHubTreeResponse = {
  tree?: GitHubTreeEntry[];
  message?: string;
};

function authHeaders(): Record<string, string> {
  const token = process.env.GITHUB_NOTES_TOKEN;
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
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
 * Fetch the full recursive tree of the notes repo and return every markdown
 * file grouped by its top-level directory.
 */
export async function getNoteCategories(): Promise<NoteCategory[]> {
  const res = await fetch(
    `https://api.github.com/repos/${NOTES_OWNER}/${NOTES_REPO}/git/trees/${NOTES_BRANCH}?recursive=1`,
    { headers: authHeaders(), next: { revalidate: REVALIDATE_SECONDS } },
  );

  if (!res.ok) {
    throw new Error(
      `Failed to load notes tree from GitHub (${res.status} ${res.statusText})`,
    );
  }

  const data = (await res.json()) as GitHubTreeResponse;
  const entries = data.tree ?? [];

  const byCategory = new Map<string, NoteCategory>();

  for (const entry of entries) {
    if (entry.type !== "blob") continue;
    if (!entry.path.toLowerCase().endsWith(".md")) continue;

    const slug = entry.path.replace(/\.md$/i, "").split("/");
    const key = slug.length > 1 ? slug[0] : "";
    const note: NoteFile = {
      path: entry.path,
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

export type Note = {
  path: string;
  title: string;
  content: string;
};

/**
 * Fetch the raw markdown for a note identified by its URL slug segments.
 * Returns `null` if the note is not part of the repository (prevents fetching
 * arbitrary paths).
 */
export async function getNote(slug: string[]): Promise<Note | null> {
  const path = `${slug.join("/")}.md`;

  // Allow-list against the actual tree — this also blocks path traversal.
  const notes = await getAllNotes();
  const match = notes.find((n) => n.path === path);
  if (!match) return null;

  const res = await fetch(RAW_ROOT + encodeURI(path), {
    next: { revalidate: REVALIDATE_SECONDS },
  });
  if (!res.ok) return null;

  const content = await res.text();
  return { path, title: match.title, content };
}

/**
 * Build a URL transformer for a note, used by the markdown renderer to:
 *  - resolve relative image/resource paths to raw.githubusercontent URLs
 *  - rewrite relative links to other `.md` notes into internal /notes routes
 *  - leave anchors and absolute URLs untouched
 *  - strip dangerous protocols
 */
export function makeNoteUrlResolver(notePath: string): (url: string) => string {
  const dir = notePath.includes("/")
    ? notePath.slice(0, notePath.lastIndexOf("/"))
    : "";

  return (url: string): string => {
    if (!url) return "";
    if (/^\s*(javascript|data|vbscript):/i.test(url)) return "";
    if (url.startsWith("#")) return url;
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

    if (resolved.toLowerCase().endsWith(".md")) {
      return `/notes/${resolved.slice(0, -3)}${hash}`;
    }
    return `${RAW_ROOT}${encodeURI(resolved)}${hash}`;
  };
}
