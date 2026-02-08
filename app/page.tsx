import Link from 'next/link';
import styles from './page.module.css';

export default function Home() {
    return (
        <main className={styles.main}>
            <div className={styles.hero}>
                <div className="container">
                    <div className={styles.heroContent}>
                        <h1 className={`${styles.title} animate-fade-in`}>
                            Turn Your <span className="text-gradient">Waste</span> Into{' '}
                            <span className="text-gradient">Coins</span>
                        </h1>
                        <p className={`${styles.subtitle} animate-fade-in`}>
                            Join the blockchain revolution in waste management. Submit your waste,
                            get verified by officers, and earn WasteCoin (WST) tokens on the Sepolia blockchain.
                        </p>
                        <div className={`${styles.cta} animate-fade-in`}>
                            <Link href="/auth" className="btn btn-primary">
                                Get Started
                            </Link>
                            <Link href="/auth" className="btn btn-outline">
                                Learn More
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.features}>
                <div className="container">
                    <h2 className="text-center mb-xl">How It Works</h2>
                    <div className={styles.featureGrid}>
                        <div className="card">
                            <div className={styles.featureIcon}>📸</div>
                            <h3>Submit Waste</h3>
                            <p>
                                Take a photo of your waste, specify the type and weight, and submit it
                                to the system. No blockchain knowledge required!
                            </p>
                        </div>
                        <div className="card">
                            <div className={styles.featureIcon}>✅</div>
                            <h3>Officer Verification</h3>
                            <p>
                                Our trained officers review your submission and determine the
                                appropriate coin reward based on waste type and quantity.
                            </p>
                        </div>
                        <div className="card">
                            <div className={styles.featureIcon}>🪙</div>
                            <h3>Earn Coins</h3>
                            <p>
                                Receive WasteCoin (WST) tokens directly to your auto-generated wallet.
                                All transactions are recorded on the Sepolia blockchain.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.stats}>
                <div className="container">
                    <div className={styles.statsGrid}>
                        <div className={styles.statCard}>
                            <div className={styles.statNumber}>100%</div>
                            <div className={styles.statLabel}>Transparent</div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statNumber}>🔒</div>
                            <div className={styles.statLabel}>Secure</div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statNumber}>♻️</div>
                            <div className={styles.statLabel}>Sustainable</div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
