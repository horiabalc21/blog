import styles from './page.module.scss';

export default function DonationCancelPage() {
    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Donation Cancelled</h2>
            <p className={styles.message}>Your donation was not completed. If you wish to try again, please return to the donation page.</p>
        </div>
    );
}
