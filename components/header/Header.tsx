import Link from "next/link";
import Logo from "../logo/Logo";
import styles from "./Header.module.css";

export default function Header(props: any) {

    return <header className={styles.header}>
        <Logo />
        <div className={styles.items}>
            <a>About</a>
            <a>Services</a>
            <a>Projects</a>
            <a>Contact</a>
            <Link className={styles.button} href="/resume.pdf">Resume</Link>
        </div>
    </header>;
}