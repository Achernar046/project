'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './auth.module.css';

export default function AuthPage() {
    const [mode, setMode] = useState<'login' | 'register'>('login');
    const [userId, setUserId] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<'user' | 'officer'>('user');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
            const body = mode === 'login'
                ? { email, password }
                : { user_id: userId, name, email, password, role };

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Authentication failed');
            }

            // Store token
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            // Redirect based on role
            if (data.user.role === 'officer') {
                router.push('/officer');
            } else {
                router.push('/dashboard');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.authBox}>
                <h1 className={styles.title}>
                    {mode === 'login' ? 'Welcome Back' : 'Join WasteCoin'}
                </h1>
                <p className={styles.subtitle}>
                    {mode === 'login'
                        ? 'Sign in to your account'
                        : 'Create your account and start earning'}
                </p>

                <div className={styles.tabs}>
                    <button
                        className={`${styles.tab} ${mode === 'login' ? styles.active : ''}`}
                        onClick={() => setMode('login')}
                    >
                        Login
                    </button>
                    <button
                        className={`${styles.tab} ${mode === 'register' ? styles.active : ''}`}
                        onClick={() => setMode('register')}
                    >
                        Register
                    </button>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    {mode === 'register' && (
                        <>
                            <div className="form-group">
                                <label className="form-label">ID User</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={userId}
                                    onChange={(e) => setUserId(e.target.value)}
                                    required
                                    placeholder="e.g., USER001"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Name</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    placeholder="Your full name"
                                />
                            </div>
                        </>
                    )}

                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            className="form-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="your@email.com"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            className="form-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="••••••••"
                            minLength={6}
                        />
                    </div>

                    {mode === 'register' && (
                        <div className="form-group">
                            <label className="form-label">Role</label>
                            <select
                                className="form-select"
                                value={role}
                                onChange={(e) => setRole(e.target.value as 'user' | 'officer')}
                            >
                                <option value="user">User (Submit Waste)</option>
                                <option value="officer">Officer (Approve Submissions)</option>
                            </select>
                        </div>
                    )}

                    {error && <div className={styles.error}>{error}</div>}

                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                        style={{ width: '100%' }}
                    >
                        {loading ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Create Account'}
                    </button>
                </form>

                {mode === 'register' && (
                    <div className={styles.info}>
                        <p>✨ Your wallet will be created automatically</p>
                        <p>🔒 Private keys are encrypted and secure</p>
                    </div>
                )}
            </div>
        </div>
    );
}
