import styles from "./notes.module.css";

export default function NotesLoading() {
  return (
    <div className="container">
      <div className={styles.skeletonHeader} aria-hidden="true" />
      <div className={styles.skeletonGrid} aria-hidden="true">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className={styles.skeletonCard} />
        ))}
      </div>
      <span className={styles.srOnly} role="status">
        Loading notes…
      </span>
    </div>
  );
}
