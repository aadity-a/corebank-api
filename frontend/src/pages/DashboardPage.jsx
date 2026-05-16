import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getBalance, getHistory, createAccount, getMyAccount } from '../api';
import './DashboardPage.css';

function fmt(amount) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(amount);
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr);
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [balance, setBalance]       = useState(null);
  const [history, setHistory]       = useState([]);
  const [accountNum, setAccountNum] = useState(localStorage.getItem('accountNumber') || '');
  const [loading, setLoading]       = useState(false);
  const [creating, setCreating]     = useState(false);
  const [error, setError]           = useState('');

  const fetchData = useCallback(async (acctNum) => {
    if (!acctNum) return;
    setLoading(true);
    try {
      const [balRes, histRes] = await Promise.all([getBalance(acctNum), getHistory(acctNum)]);
      setBalance(balRes.data);
      setHistory(histRes.data.slice(0, 5));
    } catch {
      setError('Could not load account data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    async function syncAccount() {
      try {
        const res = await getMyAccount();
        if (res.data && res.data.accountNumber) {
          localStorage.setItem('accountNumber', res.data.accountNumber);
          setAccountNum(res.data.accountNumber);
        } else {
          localStorage.removeItem('accountNumber');
          setAccountNum('');
        }
      } catch (err) {
        localStorage.removeItem('accountNumber');
        setAccountNum('');
      }
    }
    syncAccount();
  }, []);

  useEffect(() => { if (accountNum) fetchData(accountNum); }, [accountNum, fetchData]);

  const handleCreateAccount = async () => {
    setCreating(true); setError('');
    try {
      const res = await createAccount();
      const num = res.data.accountNumber;
      localStorage.setItem('accountNumber', num);
      setAccountNum(num);
    } catch {
      setError('Failed to create account.');
    } finally {
      setCreating(false);
    }
  };

  const txCount = history.length;
  const deposits    = history.filter(t => t.transactionType === 'DEPOSIT').length;
  const withdrawals = history.filter(t => t.transactionType === 'WITHDRAW').length;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="dashboard animate-fadeInUp">
      {/* Header */}
      <div className="dash-header">
        <div>
          <h1 className="dash-greeting">{greeting}, {user?.name?.split(' ')[0] || 'User'} 👋</h1>
          <p className="dash-subtitle">Here's your financial overview for today.</p>
        </div>
        <Link to="/transfer" className="btn btn-primary" id="btn-quick-transfer">
          ↗ Quick Transfer
        </Link>
      </div>

      {error && <div className="alert alert-error">⚠ {error}</div>}

      {!accountNum ? (
        /* No account yet */
        <div className="no-account-card card">
          <div className="no-account-icon">🏦</div>
          <h2>Open Your First Account</h2>
          <p>Create a bank account to start managing your finances with apnabank.</p>
          <button className="btn btn-primary btn-lg" onClick={handleCreateAccount}
            disabled={creating} id="btn-create-account">
            {creating ? <><span className="spinner" /> Creating…</> : '+ Open Account'}
          </button>
        </div>
      ) : (
        <>
          {/* Stats Row */}
          <div className="stats-grid">
            <div className="stat-card card card-hover">
              <div className="stat-card-icon" style={{ background: 'rgba(59,130,246,0.15)', color: 'var(--accent-blue)' }}>₹</div>
              <div>
                <div className="stat-value">
                  {loading ? <span className="skeleton-text" /> : fmt(balance ?? 0)}
                </div>
                <div className="stat-label">Available Balance</div>
              </div>
            </div>

            <div className="stat-card card card-hover">
              <div className="stat-card-icon" style={{ background: 'rgba(16,185,129,0.15)', color: 'var(--accent-green)' }}>↓</div>
              <div>
                <div className="stat-value">{deposits}</div>
                <div className="stat-label">Recent Deposits</div>
              </div>
            </div>

            <div className="stat-card card card-hover">
              <div className="stat-card-icon" style={{ background: 'rgba(239,68,68,0.15)', color: 'var(--accent-red)' }}>↑</div>
              <div>
                <div className="stat-value">{withdrawals}</div>
                <div className="stat-label">Recent Withdrawals</div>
              </div>
            </div>

            <div className="stat-card card card-hover">
              <div className="stat-card-icon" style={{ background: 'rgba(139,92,246,0.15)', color: 'var(--accent-purple)' }}>⇄</div>
              <div>
                <div className="stat-value">{txCount}</div>
                <div className="stat-label">Recent Transactions</div>
              </div>
            </div>
          </div>

          {/* Account Info + Recent Transactions */}
          <div className="dash-grid-2">
            <div className="card">
              <h2 className="section-title">Account Details</h2>
              <div className="account-info-row">
                <span className="info-label">Account Number</span>
                <span className="info-value mono">{accountNum}</span>
              </div>
              <div className="account-info-row">
                <span className="info-label">Account Holder</span>
                <span className="info-value">{user?.name}</span>
              </div>
              <div className="account-info-row">
                <span className="info-label">Email</span>
                <span className="info-value">{user?.email}</span>
              </div>
              <div className="account-info-row">
                <span className="info-label">Status</span>
                <span className="badge badge-success">● Active</span>
              </div>
              <div className="dash-actions">
                <Link to="/transactions" className="btn btn-secondary btn-sm">View All Transactions</Link>
                <Link to="/account" className="btn btn-secondary btn-sm">Manage Account</Link>
              </div>
            </div>

            <div className="card">
              <div className="section-header">
                <h2 className="section-title">Recent Activity</h2>
                <Link to="/transactions" className="btn btn-ghost btn-sm">View all →</Link>
              </div>
              {loading ? (
                <div className="loading-center"><span className="spinner spinner-lg" /></div>
              ) : history.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📋</div>
                  <p>No transactions yet</p>
                  <Link to="/transactions" className="btn btn-primary btn-sm">Make your first transaction</Link>
                </div>
              ) : (
                <ul className="tx-list">
                  {history.map(tx => (
                    <li key={tx.id} className="tx-item">
                      <div className={`tx-dot ${tx.transactionType === 'DEPOSIT' ? 'dot-green' : tx.transactionType === 'WITHDRAW' ? 'dot-red' : 'dot-blue'}`} />
                      <div className="tx-info">
                        <span className="tx-type">{tx.transactionType}</span>
                        <span className="tx-desc">{tx.description || '—'}</span>
                      </div>
                      <div className="tx-right">
                        <span className={`tx-amount ${tx.transactionType === 'DEPOSIT' ? 'amount-green' : 'amount-red'}`}>
                          {tx.transactionType === 'DEPOSIT' ? '+' : '-'}{fmt(tx.amount)}
                        </span>
                        <span className="tx-time">{timeAgo(tx.transactionDate)}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
