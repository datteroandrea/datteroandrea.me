import Nav from "@/components/Nav";
import styles from "./notes.module.css";

export default function NotesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Nav />
      <main className={styles.main}>{children}</main>
      <footer className={styles.footer}>
        <div className="container">
          <span>© 2026 Andrea D&apos;Attero</span>
        </div>
      </footer>
    </>
  );
}
