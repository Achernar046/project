'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './dashboard.module.css';

export default function Dashboard() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [balance, setBalance] = useState('0');
    const [wasteType, setWasteType] = useState('plastic');
    const [weight, setWeight] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

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
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/waste/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    waste_type: wasteType,
                    weight_kg: parseFloat(weight),
                    description,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error);
            }

            setMessage('✅ Waste submission successful! Waiting for officer approval.');
            setWeight('');
            setDescription('');
        } catch (error: any) {
            setMessage('❌ ' + error.message);
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
                    <div className={styles.grid}>
                        {/* Wallet Card */}
                        <div className={`card ${styles.walletCard}`}>
                            <h2>Your Wallet</h2>
                            <div className={styles.balance}>
                                <div className={styles.balanceAmount}>{balance}</div>
                                <div className={styles.balanceLabel}>WST</div>
                            </div>
                            <div className={styles.walletAddress}>
                                <small>Address:</small>
                                <code>{user.walletAddress}</code>
                            </div>
                        </div>

                        {/* Submit Waste Form */}
                        <div className={`card ${styles.submitCard}`}>
                            <h2>Submit Waste</h2>
                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label className="form-label">Waste Type</label>
                                    <select
                                        className="form-select"
                                        value={wasteType}
                                        onChange={(e) => setWasteType(e.target.value)}
                                    >
                                        <option value="plastic">Plastic</option>
                                        <option value="paper">Paper</option>
                                        <option value="metal">Metal</option>
                                        <option value="glass">Glass</option>
                                        <option value="organic">Organic</option>
                                        <option value="electronic">Electronic</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Weight (kg)</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={weight}
                                        onChange={(e) => setWeight(e.target.value)}
                                        step="0.1"
                                        min="0.1"
                                        required
                                        placeholder="e.g., 2.5"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Description (Optional)</label>
                                    <textarea
                                        className="form-input"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        rows={3}
                                        placeholder="Additional details about your waste..."
                                    />
                                </div>

                                {message && (
                                    <div className={message.startsWith('✅') ? styles.success : styles.error}>
                                        {message}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={loading}
                                    style={{ width: '100%' }}
                                >
                                    {loading ? 'Submitting...' : 'Submit Waste'}
                                </button>
                            </form>
                        </div>
                    </div>

                    <div className={styles.info}>
                        <div className="card">
                            <h3>How to Earn Coins</h3>
                            <ol>
                                <li>Submit your waste with accurate type and weight</li>
                                <li>Wait for an officer to review your submission</li>
                                <li>Receive WST coins directly to your wallet</li>
                                <li>Track all transactions on the Sepolia blockchain</li>
                            </ol>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
