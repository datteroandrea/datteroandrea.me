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
            <a className={styles.button}>Resume</a>
        </div>
    </header>;
}