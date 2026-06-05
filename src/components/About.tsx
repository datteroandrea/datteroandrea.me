import AnimatedSection from "./AnimatedSection";
import styles from "./About.module.css";

export default function About() {
  return (
    <section id="about" className={styles.section} aria-labelledby="about-heading">
      <div className="container">
        <div className={styles.inner}>
          <AnimatedSection>
            <header className={styles.header}>
              <p className={styles.eyebrow}>About</p>
              <h2 id="about-heading" className={styles.heading}>
                Building software that matters
              </h2>
            </header>
          </AnimatedSection>

          <AnimatedSection delay={0.1}>
            <div className={styles.body}>
              <p>
                I&apos;m a full-stack software engineer based in Zurich,
                Switzerland. My career has spanned financial institutions and
                independent product work — from engineering trading and advisory
                platforms used by millions of clients at Credit Suisse and UBS,
                to founding and building Gridscript from the ground up as the
                sole engineer.
              </p>
              <p>
                I care about writing clean, maintainable code and shipping
                products that work reliably at scale. I&apos;m comfortable
                across the full stack — architecting React frontends, building
                Spring Boot microservices, wiring up CI/CD pipelines on Jenkins,
                or designing browser-based developer tooling with JS and Python
                runtimes.
              </p>
              <p>
                I hold a Bachelor of Computer Science from Ca&apos; Foscari
                University in Venice and am fluent in both Italian (native) and
                English.
              </p>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
