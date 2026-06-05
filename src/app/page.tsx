import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Highlights from "@/components/Highlights";
import Projects from "@/components/Projects";
import About from "@/components/About";
import Skills from "@/components/Skills";
import Experience from "@/components/Experience";
import Contact from "@/components/Contact";
import styles from "./page.module.css";

export default function Page() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Highlights />
        <Projects />
        <About />
        <Skills />
        <Experience />
        <Contact />
      </main>
      <footer className={styles.footer}>
        <div className="container">
          <div className={styles.footerInner}>
            <span>© 2026 Andrea D&apos;Attero</span>
            <a
              href="https://docs.google.com/document/d/1xL6ZeHVIzjfw8SphNEMQku1CZzcd6pduB75Qo8Te5D0/edit?usp=sharing"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.footerLink}
            >
              Download résumé ↗
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}
