'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './officer.module.css';

interface User {
    id: string;
    userId: string;
    name: string;
    email: string;
    walletAddress: string;
    createdAt: Date;
}

export default function OfficerDashboard() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedUserId, setSelectedUserId] = useState('');
    const [coinAmount, setCoinAmount] = useState('');
    const [processing, setProcessing] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');

        if (!token || !userData) {
            router.push('/auth');
            return;
        }

        const parsedUser = JSON.parse(userData);
        if (parsedUser.role !== 'officer') {
            router.push('/dashboard');
            return;
        }

        setUser(parsedUser);
        fetchUsers(token);
    }, [router]);

    const fetchUsers = async (token: string) => {
        try {
            const response = await fetch('/api/users/list', {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            if (response.ok) {
                setUsers(data.users);
            }
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddCoins = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedUserId || !coinAmount) {
            setMessage('❌ Please select a user and enter amount');
            return;
        }

        setProcessing(true);
        setMessage('');

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/officer/add-coins', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    user_id: selectedUserId,
                    amount: parseFloat(coinAmount),
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error);
            }

            setMessage(`✅ Successfully added ${coinAmount} WST to ${data.transaction.user}`);
            setCoinAmount('');
            setSelectedUserId('');
        } catch (error: any) {
            setMessage('❌ ' + error.message);
        } finally {
            setProcessing(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/');
    };

    if (loading) return <div className={styles.loading}>Loading...</div>;

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className="container">
                    <div className={styles.headerContent}>
                        <h1 className={styles.logo}>👮 Officer Dashboard</h1>
                        <button onClick={handleLogout} className="btn btn-outline">
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            <main className={styles.main}>
                <div className="container">
                    <div className={styles.stats}>
                        <div className="card">
                            <h3>Total Users</h3>
                            <div className={styles.statNumber}>{users.length}</div>
                        </div>
                    </div>

                    <h2 className={styles.sectionTitle}>Add Coins to User</h2>

                    <div className={styles.addCoinsSection}>
                        <div className="card">
                            <form onSubmit={handleAddCoins}>
                                <div className="form-group">
                                    <label className="form-label">Select User</label>
                                    <select
                                        className="form-select"
                                        value={selectedUserId}
                                        onChange={(e) => setSelectedUserId(e.target.value)}
                                        required
                                    >
                                        <option value="">-- Select a user --</option>
                                        {users.map((user) => (
                                            <option key={user.id} value={user.id}>
                                                {user.userId} - {user.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Coin Amount (WST)</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={coinAmount}
                                        onChange={(e) => setCoinAmount(e.target.value)}
                                        min="0.1"
                                        step="0.1"
                                        placeholder="e.g., 100"
                                        required
                                    />
                                </div>

                                {message && (
                                    <div className={message.startsWith('✅') ? styles.success : styles.error}>
                                        {message}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    className="btn btn-secondary"
                                    disabled={processing}
                                    style={{ width: '100%' }}
                                >
                                    {processing ? 'Adding Coins...' : 'Add Coins'}
                                </button>
                            </form>
                        </div>
                    </div>

                    <h2 className={styles.sectionTitle}>User List</h2>

                    {users.length === 0 ? (
                        <div className="card text-center">
                            <p>No users registered yet.</p>
                        </div>
                    ) : (
                        <div className={styles.userGrid}>
                            {users.map((user) => (
                                <div key={user.id} className={`card ${styles.userCard}`}>
                                    <h3>{user.userId}</h3>
                                    <p><strong>Name:</strong> {user.name}</p>
                                    <p><strong>Email:</strong> {user.email}</p>
                                    <p>
                                        <strong>Wallet:</strong>{' '}
                                        <code>{user.walletAddress.slice(0, 10)}...{user.walletAddress.slice(-8)}</code>
                                    </p>
                                    <p>
                                        <strong>Joined:</strong>{' '}
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
