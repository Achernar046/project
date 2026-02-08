'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './officer.module.css';

interface Submission {
    _id: string;
    waste_type: string;
    weight_kg: number;
    description?: string;
    created_at: string;
    user: {
        email: string;
        wallet_address: string;
    };
}

export default function OfficerDashboard() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState<string | null>(null);

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
        fetchPendingSubmissions(token);
    }, [router]);

    const fetchPendingSubmissions = async (token: string) => {
        try {
            const response = await fetch('/api/waste/pending', {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            if (response.ok) {
                setSubmissions(data.submissions);
            }
        } catch (error) {
            console.error('Failed to fetch submissions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (submissionId: string, coinAmount: number) => {
        setProcessing(submissionId);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/waste/approve', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    submission_id: submissionId,
                    coin_amount: coinAmount,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error);
            }

            alert(`✅ Approved! ${coinAmount} WST minted.\nTx: ${data.txHash}`);

            // Refresh submissions
            fetchPendingSubmissions(token!);
        } catch (error: any) {
            alert('❌ Error: ' + error.message);
        } finally {
            setProcessing(null);
        }
    };

    const calculateCoins = (wasteType: string, weight: number): number => {
        const rates: Record<string, number> = {
            plastic: 2,
            paper: 1,
            metal: 5,
            glass: 3,
            organic: 1,
            electronic: 10,
        };
        return (rates[wasteType] || 1) * weight;
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
                            <h3>Pending Submissions</h3>
                            <div className={styles.statNumber}>{submissions.length}</div>
                        </div>
                    </div>

                    <h2 className={styles.sectionTitle}>Review Submissions</h2>

                    {submissions.length === 0 ? (
                        <div className="card text-center">
                            <p>No pending submissions at the moment.</p>
                        </div>
                    ) : (
                        <div className={styles.submissionsGrid}>
                            {submissions.map((submission) => {
                                const suggestedCoins = calculateCoins(
                                    submission.waste_type,
                                    submission.weight_kg
                                );

                                return (
                                    <div key={submission._id} className={`card ${styles.submissionCard}`}>
                                        <div className={styles.submissionHeader}>
                                            <h3>{submission.waste_type.toUpperCase()}</h3>
                                            <span className={styles.badge}>{submission.weight_kg} kg</span>
                                        </div>

                                        <div className={styles.submissionDetails}>
                                            <p>
                                                <strong>User:</strong> {submission.user.email}
                                            </p>
                                            <p>
                                                <strong>Wallet:</strong>{' '}
                                                <code>{submission.user.wallet_address.slice(0, 10)}...</code>
                                            </p>
                                            {submission.description && (
                                                <p>
                                                    <strong>Description:</strong> {submission.description}
                                                </p>
                                            )}
                                            <p>
                                                <strong>Submitted:</strong>{' '}
                                                {new Date(submission.created_at).toLocaleString()}
                                            </p>
                                        </div>

                                        <div className={styles.approvalSection}>
                                            <div className={styles.coinSuggestion}>
                                                Suggested: <strong>{suggestedCoins} WST</strong>
                                            </div>
                                            <button
                                                className="btn btn-secondary"
                                                onClick={() => handleApprove(submission._id, suggestedCoins)}
                                                disabled={processing === submission._id}
                                                style={{ width: '100%' }}
                                            >
                                                {processing === submission._id
                                                    ? 'Processing...'
                                                    : `Approve & Mint ${suggestedCoins} WST`}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
