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
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
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

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (!target.closest('.form-group')) {
                setShowDropdown(false);
            }
        };

        if (showDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showDropdown]);

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

    // Filter users based on search query
    const filteredUsers = users.filter(user => {
        const userIdMatch = user.userId?.toLowerCase().includes(searchQuery.toLowerCase());
        const nameMatch = user.name?.toLowerCase().includes(searchQuery.toLowerCase());
        return userIdMatch || nameMatch;
    });

    const handleUserSelect = (user: User) => {
        setSelectedUser(user);
        setSelectedUserId(user.id);
        setSearchQuery(`${user.userId} - ${user.name}`);
        setShowDropdown(false);
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setShowDropdown(true);
        if (!e.target.value) {
            setSelectedUser(null);
            setSelectedUserId('');
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
            setSelectedUser(null);
            setSearchQuery('');
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
                        <div className={styles.headerRight}>
                            <div className={styles.officerInfo}>
                                <span className={styles.officerName}>{user?.name || 'Officer'}</span>
                                <span className={styles.officerRole}>Officer</span>
                            </div>
                            <button onClick={handleLogout} className="btn btn-outline">
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className={styles.main}>
                <div className="container">
                    {/* Stats Overview */}
                    <div className={styles.statsGrid}>
                        <div className={`card ${styles.statCard}`}>
                            <div className={styles.statIcon}>👥</div>
                            <div className={styles.statContent}>
                                <h3>Total Users</h3>
                                <div className={styles.statNumber}>{users.length}</div>
                                <p className={styles.statLabel}>Registered users</p>
                            </div>
                        </div>

                        <div className={`card ${styles.statCard}`}>
                            <div className={styles.statIcon}>💰</div>
                            <div className={styles.statContent}>
                                <h3>Total Coins</h3>
                                <div className={styles.statNumber}>-</div>
                                <p className={styles.statLabel}>WST distributed</p>
                            </div>
                        </div>

                        <div className={`card ${styles.statCard}`}>
                            <div className={styles.statIcon}>📊</div>
                            <div className={styles.statContent}>
                                <h3>Transactions</h3>
                                <div className={styles.statNumber}>-</div>
                                <p className={styles.statLabel}>Recent activity</p>
                            </div>
                        </div>
                    </div>

                    {/* Two Column Layout */}
                    <div className={styles.gridLayout}>
                        {/* Left Column - Add Coins Form */}
                        <div className={styles.leftColumn}>
                            <div className="card">
                                <h2 className={styles.cardTitle}>💸 Add Coins to User</h2>
                                <form onSubmit={handleAddCoins}>
                                    <div className="form-group">
                                        <label className="form-label">Select User</label>
                                        <div style={{ position: 'relative' }}>
                                            <input
                                                type="text"
                                                className="form-input"
                                                value={searchQuery}
                                                onChange={handleSearchChange}
                                                onFocus={() => setShowDropdown(true)}
                                                placeholder="Search by User ID or Name..."
                                                required
                                            />
                                            {showDropdown && searchQuery && filteredUsers.length > 0 && (
                                                <div className={styles.dropdown}>
                                                    {filteredUsers.slice(0, 10).map((user) => (
                                                        <div
                                                            key={user.id}
                                                            className={styles.dropdownItem}
                                                            onClick={() => handleUserSelect(user)}
                                                        >
                                                            <div className={styles.userInfo}>
                                                                <strong>{user.userId}</strong>
                                                                <span className={styles.userName}>{user.name}</span>
                                                            </div>
                                                            <div className={styles.userEmail}>{user.email}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            {showDropdown && searchQuery && filteredUsers.length === 0 && (
                                                <div className={styles.dropdown}>
                                                    <div className={styles.dropdownItem} style={{ cursor: 'default' }}>
                                                        No users found
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        {selectedUser && (
                                            <div className={styles.selectedUserInfo}>
                                                <strong>Selected:</strong> {selectedUser.userId} - {selectedUser.name}
                                            </div>
                                        )}
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

                        {/* Right Column - User List */}
                        <div className={styles.rightColumn}>
                            <div className="card">
                                <div className={styles.userListHeader}>
                                    <h2 className={styles.cardTitle}>👥 User Directory</h2>
                                    <div className={styles.userCount}>{users.length} users</div>
                                </div>

                                {users.length === 0 ? (
                                    <div className={styles.emptyState}>
                                        <div className={styles.emptyIcon}>👤</div>
                                        <p>No users registered yet.</p>
                                    </div>
                                ) : (
                                    <div className={styles.userList}>
                                        {users.map((user) => (
                                            <div key={user.id} className={styles.userListItem}>
                                                <div className={styles.userAvatar}>
                                                    {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                                                </div>
                                                <div className={styles.userDetails}>
                                                    <div className={styles.userMainInfo}>
                                                        <h4>{user.name}</h4>
                                                        <span className={styles.userId}>{user.userId}</span>
                                                    </div>
                                                    <div className={styles.userMetaInfo}>
                                                        <span className={styles.userEmail}>{user.email}</span>
                                                        <span className={styles.userWallet}>
                                                            {user.walletAddress.slice(0, 6)}...{user.walletAddress.slice(-4)}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className={styles.userActions}>
                                                    <button
                                                        className={styles.quickAddBtn}
                                                        onClick={() => {
                                                            handleUserSelect(user);
                                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                                        }}
                                                        title="Add coins to this user"
                                                    >
                                                        💰
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
