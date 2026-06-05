import AnimatedSection from "./AnimatedSection";
import styles from "./Experience.module.css";

const JOBS = [
  {
    company: "UBS",
    location: "Zurich, CH",
    role: "Software Engineer",
    period: "April 2024 – Present",
    current: true,
    bullets: [
      "Developed and maintained a full-stack application for trading and settlement of securities.",
      "Maintained and supported legacy Credit Suisse applications throughout the UBS merger integration.",
      "Built Jenkins CI/CD pipelines automating deployments across DEV, UAT, and PROD environments.",
    ],
  },
  {
    company: "Credit Suisse",
    location: "Zurich, CH",
    role: "Software Engineer & Scrum Master",
    period: "October 2022 – April 2024",
    current: false,
    bullets: [
      "Led Scrum ceremonies and requirements engineering across a cross-functional team.",
      "Developed and maintained a full-stack financial advisory and trading platform serving 1M+ clients.",
      "Organized company events as a board member of the Career Starter Committee.",
    ],
  },
];

const EDUCATION = {
  school: "Ca' Foscari University",
  location: "Venice, Italy",
  degree: "Bachelor of Computer Science",
  period: "2019 – 2022",
};

export default function Experience() {
  return (
    <section
      id="experience"
      className={styles.section}
      aria-labelledby="experience-heading"
    >
      <div className="container">
        <AnimatedSection>
          <header className={styles.header}>
            <p className={styles.eyebrow}>Experience</p>
            <h2 id="experience-heading" className={styles.heading}>
              Where I&apos;ve worked
            </h2>
          </header>
        </AnimatedSection>

        <div className={styles.list}>
          {JOBS.map((job, i) => (
            <AnimatedSection key={job.company} delay={i * 0.1}>
              <article className={styles.card}>
                <div className={styles.cardHeader}>
                  <div>
                    <div className={styles.companyRow}>
                      <h3 className={styles.company}>{job.company}</h3>
                      {job.current && (
                        <span className={styles.currentBadge} aria-label="Current employer">
                          Current
                        </span>
                      )}
                    </div>
                    <p className={styles.role}>{job.role}</p>
                    <p className={styles.location}>{job.location}</p>
                  </div>
                  <time className={styles.period}>{job.period}</time>
                </div>
                <ul className={styles.bullets} role="list">
                  {job.bullets.map((bullet) => (
                    <li key={bullet} className={styles.bullet}>
                      <span className={styles.bulletDot} aria-hidden="true" />
                      {bullet}
                    </li>
                  ))}
                </ul>
              </article>
            </AnimatedSection>
          ))}
        </div>

        {/* Education */}
        <AnimatedSection delay={0.15}>
          <div className={styles.eduWrap}>
            <h3 className={styles.eduTitle}>Education</h3>
            <article className={styles.card}>
              <div className={styles.cardHeader}>
                <div>
                  <h4 className={styles.company}>{EDUCATION.school}</h4>
                  <p className={styles.role}>{EDUCATION.degree}</p>
                  <p className={styles.location}>{EDUCATION.location}</p>
                </div>
                <time className={styles.period}>{EDUCATION.period}</time>
              </div>
            </article>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
