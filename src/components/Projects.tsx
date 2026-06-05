import AnimatedSection from "./AnimatedSection";
import styles from "./Projects.module.css";

const PROJECTS = [
  {
    name: "Prep & Rehab",
    tagline: "Mobile physiotherapy platform for Zürich",
    description:
      "Designed and built the full digital stack for a Zürich-based mobile physiotherapy practice — public marketing site with integrated booking flow, an internal CRM for patient records and appointment management, and end-to-end company infrastructure setup. The practice specialises in orthopaedic rehabilitation, pelvic floor therapy, and geriatric care, all delivered in patients' homes.",
    tags: ["Next.js", "TypeScript", "Supabase"],
    url: "https://prep-rehab.ch",
    role: "Freelance Full-Stack Developer",
    period: "2026",
  },
  {
    name: "Gridscript",
    tagline: "Browser-based data workspace",
    description:
      "Architected and built Gridscript.io from the ground up — a browser-based data workspace that blends the familiarity of a spreadsheet with the power of scripting and visualization. Features include Excel/CSV import, interactive grid editing (filter, sort, join, split), a full JS/Python scripting editor, and AI/ML model pipelines using TensorFlow.js and Scikit-learn.",
    tags: ["Next.js", "TypeScript", "Python", "TensorFlow.js", "Scikit-learn", "pandas"],
    url: "https://gridscript.io",
    role: "Founder & Sole Engineer",
    period: "July 2025 – Present",
  },
];

export default function Projects() {
  return (
    <section id="work" className={styles.section} aria-labelledby="work-heading">
      <div className="container">
        <AnimatedSection>
          <header className={styles.header}>
            <p className={styles.eyebrow}>Featured Work</p>
            <h2 id="work-heading" className={styles.heading}>
              Projects I&apos;ve shipped
            </h2>
          </header>
        </AnimatedSection>

        <div className={styles.list}>
          {PROJECTS.map((project, i) => (
            <AnimatedSection key={project.name} delay={i * 0.1}>
              <article className={styles.card}>
                <div className={styles.cardGlow} aria-hidden="true" />
                <div className={styles.cardBody}>
                  <div className={styles.cardTop}>
                    <div>
                      <p className={styles.meta}>
                        {project.role} &middot; {project.period}
                      </p>
                      <h3 className={styles.name}>{project.name}</h3>
                      <p className={styles.tagline}>{project.tagline}</p>
                    </div>
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.visitBtn}
                      aria-label={`Visit ${project.name}`}
                    >
                      Visit site ↗
                    </a>
                  </div>
                  <p className={styles.description}>{project.description}</p>
                  <ul className={styles.tags} role="list" aria-label="Technologies">
                    {project.tags.map((tag) => (
                      <li key={tag} className={styles.tag}>
                        {tag}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
