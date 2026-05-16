import { useState, useEffect } from 'react';
import { getBalance, createAccount } from '../api';
import './AccountPage.css';

function fmt(amount) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(amount ?? 0);
}

export default function AccountPage() {
  const [accountNum, setAccountNum] = useState(localStorage.getItem('accountNumber') || '');
  const [balance, setBalance]       = useState(null);
  const [loading, setLoading]       = useState(false);
  const [creating, setCreating]     = useState(false);
  const [error, setError]           = useState('');
  const [success, setSuccess]       = useState('');
  const [copied, setCopied]         = useState(false);

  useEffect(() => {
    if (!accountNum) return;
    setLoading(true);
    getBalance(accountNum)
      .then(r => setBalance(r.data))
      .catch(() => setError('Failed to fetch balance.'))
      .finally(() => setLoading(false));
  }, [accountNum]);

  const handleCreate = async () => {
    setCreating(true); setError(''); setSuccess('');
    try {
      const res = await createAccount();
      const num = res.data.accountNumber;
      localStorage.setItem('accountNumber', num);
      setAccountNum(num);
      setBalance(res.data.balance ?? 0);
      setSuccess('Account created successfully!');
    } catch {
      setError('Failed to create account.');
    } finally {
      setCreating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(accountNum);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRefresh = () => {
    if (!accountNum) return;
    setLoading(true); setError('');
    getBalance(accountNum)
      .then(r => { setBalance(r.data); setSuccess('Balance refreshed!'); setTimeout(() => setSuccess(''), 2000); })
      .catch(() => setError('Refresh failed.'))
      .finally(() => setLoading(false));
  };

  return (
    <div className="account-page animate-fadeInUp">
      <div className="page-header">
        <h1 className="page-title">Account Management</h1>
        <p className="page-subtitle">View your account details and current balance.</p>
      </div>

      {error   && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {!accountNum ? (
        <div className="card no-account-card">
          <div className="no-account-icon">🏦</div>
          <h2>No Account Found</h2>
          <p>You haven't opened a bank account yet. Create one to get started.</p>
          <button className="btn btn-primary btn-lg" onClick={handleCreate}
            disabled={creating} id="btn-create-acct">
            {creating ? <><span className="spinner" /> Creating…</> : '+ Open Bank Account'}
          </button>
        </div>
      ) : (
        <div className="acct-layout">
          {/* Balance Card */}
          <div className="balance-card card">
            <div className="balance-label">Total Balance</div>
            <div className="balance-amount">
              {loading ? <span className="spinner spinner-lg" /> : fmt(balance)}
            </div>
            <div className="balance-footer">
              <span className="badge badge-success">● Active Account</span>
              <button className="btn btn-ghost btn-sm" onClick={handleRefresh} id="btn-refresh" disabled={loading}>
                ↻ Refresh
              </button>
            </div>
          </div>

          {/* Details Card */}
          <div className="card acct-details-card">
            <h2 className="section-title">Account Information</h2>

            <div className="detail-row">
              <span className="detail-label">Account Number</span>
              <div className="detail-value-row">
                <span className="detail-value mono">{accountNum}</span>
                <button className="btn btn-ghost btn-sm" onClick={handleCopy} id="btn-copy-acct">
                  {copied ? '✓ Copied' : '⧉ Copy'}
                </button>
              </div>
            </div>

            <div className="detail-row">
              <span className="detail-label">Account Type</span>
              <span className="detail-value">Savings Account</span>
            </div>

            <div className="detail-row">
              <span className="detail-label">Currency</span>
              <span className="detail-value">INR — Indian Rupee</span>
            </div>

            <div className="detail-row">
              <span className="detail-label">Bank Name</span>
              <span className="detail-value">apnabank Ltd.</span>
            </div>

            <div className="detail-row">
              <span className="detail-label">IFSC Code</span>
              <span className="detail-value mono">NEXA0001234</span>
            </div>

            <div className="detail-row">
              <span className="detail-label">Status</span>
              <span className="badge badge-success">● Verified & Active</span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card quick-actions-card">
            <h2 className="section-title">Quick Actions</h2>
            <div className="quick-actions-grid">
              {[
                { to: '/transactions', icon: '↓', label: 'Deposit',      color: '#10b981' },
                { to: '/transactions', icon: '↑', label: 'Withdraw',     color: '#ef4444' },
                { to: '/transfer',     icon: '↗', label: 'Transfer',     color: '#3b82f6' },
                { to: '/transactions', icon: '📋', label: 'History',     color: '#8b5cf6' },
              ].map(({ to, icon, label, color }) => (
                <a key={label} href={to} className="quick-action-btn" style={{ '--qa-color': color }}>
                  <span className="qa-icon">{icon}</span>
                  <span className="qa-label">{label}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
