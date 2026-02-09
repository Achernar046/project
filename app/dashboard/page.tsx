'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './dashboard.module.css';

export default function Dashboard() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [balance, setBalance] = useState('0');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');

        if (!token || !userData) {
            router.push('/auth');
            return;
        }

        setUser(JSON.parse(userData));
        fetchBalance(token);
    }, [router]);

    const fetchBalance = async (token: string) => {
        try {
            const response = await fetch('/api/wallet/balance', {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            if (response.ok) {
                setBalance(data.balance);
            }
        } catch (error) {
            console.error('Failed to fetch balance:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/');
    };

    if (!user) return <div className={styles.loading}>Loading...</div>;

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className="container">
                    <div className={styles.headerContent}>
                        <h1 className={styles.logo}>🪙 WasteCoin</h1>
                        <button onClick={handleLogout} className="btn btn-outline">
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            <main className={styles.main}>
                <div className="container">
                    <div className={styles.welcomeSection}>
                        <h2>Welcome, {user.email}!</h2>
                        <p>View your WasteCoin balance below</p>
                    </div>

                    <div className={styles.balanceContainer}>
                        <div className={`card ${styles.walletCard}`}>
                            <h2>Your Wallet</h2>
                            <div className={styles.balance}>
                                <div className={styles.balanceAmount}>
                                    {loading ? '...' : balance}
                                </div>
                                <div className={styles.balanceLabel}>WST</div>
                            </div>
                            <div className={styles.walletAddress}>
                                <small>Wallet Address:</small>
                                <code>{user.walletAddress}</code>
                            </div>
                        </div>
                    </div>

                    <div className={styles.info}>
                        <div className="card">
                            <h3>ℹ️ About WasteCoin</h3>
                            <p>
                                WasteCoin (WST) is a digital currency that rewards you for your contributions.
                                Officers can add coins to your wallet, and you can track your balance here.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
