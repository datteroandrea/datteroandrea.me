import AnimatedSection from "./AnimatedSection";
import styles from "./Skills.module.css";

const SKILL_GROUPS = [
  {
    category: "Frontend",
    skills: ["React", "Next.js", "Angular", "React Native", "Flutter", "Three.js", "TypeScript"],
  },
  {
    category: "Backend",
    skills: ["Node.js", "Express", "Spring Boot", ".NET", "Socket.io", "Python"],
  },
  {
    category: "DevOps & Cloud",
    skills: ["Docker", "Jenkins", "Azure", "Nginx", "Vercel", "Netlify", "DigitalOcean"],
  },
  {
    category: "Databases",
    skills: ["PostgreSQL", "MySQL", "MongoDB", "MSSQL", "Redis"],
  },
  {
    category: "Languages",
    skills: ["Java", "JavaScript", "TypeScript", "Python", "C#", "Dart", "Bash"],
  },
  {
    category: "Testing & Data",
    skills: ["Cypress", "Selenium", "Puppeteer", "Pandas", "NumPy", "Scikit-learn"],
  },
];

export default function Skills() {
  return (
    <section id="skills" className={styles.section} aria-labelledby="skills-heading">
      <div className="container">
        <AnimatedSection>
          <header className={styles.header}>
            <p className={styles.eyebrow}>Skills</p>
            <h2 id="skills-heading" className={styles.heading}>
              Technologies I work with
            </h2>
          </header>
        </AnimatedSection>

        <dl className={styles.grid}>
          {SKILL_GROUPS.map((group, i) => (
            <AnimatedSection key={group.category} delay={Math.floor(i / 2) * 0.08}>
              <div className={styles.group}>
                <dt className={styles.category}>{group.category}</dt>
                <dd>
                  <ul className={styles.chips} role="list">
                    {group.skills.map((skill) => (
                      <li key={skill} className={styles.chip}>
                        {skill}
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
            </AnimatedSection>
          ))}
        </dl>
      </div>
    </section>
  );
}
