import styles from './page.module.scss';

export default function DonationSuccessPage() {
    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Thank You!</h2>
            <p className={styles.message}>Your donation was successful. We appreciate your support!</p>
        </div>
    );
}
