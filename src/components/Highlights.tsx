import AnimatedSection from "./AnimatedSection";
import styles from "./Highlights.module.css";

const ITEMS = [
  {
    stat: "1M+",
    label: "Users Served",
    desc: "Products I've built have reached over a million active clients.",
  },
  {
    stat: "3+",
    label: "Years in Fintech",
    desc: "Engineering at Credit Suisse and UBS — two of the world's largest banks.",
  },
  {
    stat: "End-to-End",
    label: "Full Stack",
    desc: "From React frontends to Spring Boot services, Docker, and CI/CD.",
  },
];

export default function Highlights() {
  return (
    <section className={styles.section} aria-label="Highlights">
      <div className="container">
        <dl className={styles.grid}>
          {ITEMS.map((item, i) => (
            <AnimatedSection key={item.label} delay={i * 0.08}>
              <div className={styles.item}>
                <dt>
                  <span className={styles.stat}>{item.stat}</span>
                  <span className={styles.label}>{item.label}</span>
                </dt>
                <dd className={styles.desc}>{item.desc}</dd>
              </div>
            </AnimatedSection>
          ))}
        </dl>
      </div>
    </section>
  );
}
