import Link from "next/link";
import Logo from "../logo/Logo";
import styles from "./Header.module.css";

export default function Header(props: any) {

    return <header className={styles.header}>
        <Logo />
        <div className={styles.items}>
            <a href="#about">About</a>
            <a href="#services">Services</a>
            {/*<a href="#projects">Projects</a>*/}
            <a href="#contact">Contact</a>
            <Link className={styles.button} href="/resume.pdf">Resume</Link>
        </div>
    </header>;
}