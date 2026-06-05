import AnimatedSection from "./AnimatedSection";
import styles from "./Hero.module.css";

export default function Hero() {
  return (
    <section className={styles.section} aria-label="Introduction">
      {/* Decorative blobs */}
      <div className={styles.blob1} aria-hidden="true" />
      <div className={styles.blob2} aria-hidden="true" />

      <div className={`container ${styles.inner}`}>
        <AnimatedSection delay={0.05}>
          <div className={styles.badge}>
            <span className={styles.badgeDot} aria-hidden="true" />
            Open to new opportunities
          </div>
        </AnimatedSection>

        <AnimatedSection delay={0.15}>
          <h1 className={styles.headline}>
            Full-Stack
            <br />
            <span className={styles.headlineAccent}>Software Engineer</span>
          </h1>
        </AnimatedSection>

        <AnimatedSection delay={0.25}>
          <p className={styles.tagline}>
            I build high-performance, production-grade software — from trading
            platforms at UBS to developer tools for the modern web. Based in
            Zurich, Switzerland.
          </p>
        </AnimatedSection>

        <AnimatedSection delay={0.35}>
          <div className={styles.ctas}>
            <a href="#work" className={styles.ctaPrimary}>
              View my work
            </a>
            <a
              href="/resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.ctaSecondary}
            >
              Download résumé ↗
            </a>
          </div>
        </AnimatedSection>
      </div>

      <a href="#work" className={styles.scroll} aria-label="Scroll to projects">
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12 5v14M5 12l7 7 7-7" />
        </svg>
      </a>
    </section>
  );
}
