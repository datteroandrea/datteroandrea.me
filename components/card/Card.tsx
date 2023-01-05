import styles from "./Card.module.css";

export default function Card(props: any) {
    return <section className={styles.card} onClick={() => props.onClick()}>
        <p className={styles.cardTitle}>{props.title}</p>
        <div className={styles.cardOffer}>
        {
            props.offer?.map((off: any) => {
                return <p key={off} className={styles.cardOfferText}>{off}</p>;
            })
        }
        </div>
        {props.children}
        <button className={styles.cardButton}>{props.price}</button>
    </section>;
}