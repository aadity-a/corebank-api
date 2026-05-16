import { useState, useEffect, useCallback } from 'react';
import { deposit, withdraw, getHistory } from '../api';
import './TransactionsPage.css';

function fmt(amount) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(amount);
}

function fmtDate(dateStr) {
  return new Date(dateStr).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
}

const TX_TYPE_META = {
  DEPOSIT:    { label: 'Deposit',    badgeClass: 'badge-success', sign: '+', amtClass: 'amount-green' },
  WITHDRAW:   { label: 'Withdrawal', badgeClass: 'badge-danger',  sign: '-', amtClass: 'amount-red' },
  TRANSFER:   { label: 'Transfer',   badgeClass: 'badge-blue',    sign: '-', amtClass: 'amount-red' },
};

export default function TransactionsPage() {
  const accountNum = localStorage.getItem('accountNumber') || '';
  const [tab, setTab]         = useState('history'); // 'history' | 'deposit' | 'withdraw'
  const [history, setHistory] = useState([]);
  const [filter, setFilter]   = useState('ALL');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg]         = useState({ type: '', text: '' });
  const [form, setForm]       = useState({ accountNumber: accountNum, amount: '', description: '' });

  const loadHistory = useCallback(async () => {
    if (!accountNum) return;
    setLoading(true);
    try {
      const res = await getHistory(accountNum);
      setHistory(res.data);
    } catch { setMsg({ type: 'error', text: 'Failed to load transactions.' }); }
    finally { setLoading(false); }
  }, [accountNum]);

  useEffect(() => { loadHistory(); }, [loadHistory]);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setMsg({ type: '', text: '' });
    if (!form.amount || Number(form.amount) <= 0) {
      setMsg({ type: 'error', text: 'Enter a valid amount.' }); return;
    }
    setSubmitting(true);
    try {
      const payload = { ...form, amount: parseFloat(form.amount) };
      const res = tab === 'deposit' ? await deposit(payload) : await withdraw(payload);
      setMsg({ type: 'success', text: res.data });
      setForm(f => ({ ...f, amount: '', description: '' }));
      await loadHistory();
      setTimeout(() => setTab('history'), 1200);
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Transaction failed.' });
    } finally { setSubmitting(false); }
  };

  const filtered = filter === 'ALL' ? history : history.filter(t => t.transactionType === filter);

  if (!accountNum) return (
    <div className="tx-page animate-fadeInUp">
      <div className="alert alert-info">⚠ Please create an account first from the Account page.</div>
    </div>
  );

  return (
    <div className="tx-page animate-fadeInUp">
      <div className="page-header">
        <h1 className="page-title">Transactions</h1>
        <p className="page-subtitle">Deposit, withdraw, and view your full transaction history.</p>
      </div>

      {/* Tabs */}
      <div className="tx-tabs">
        {[['history','📋 History'], ['deposit','↓ Deposit'], ['withdraw','↑ Withdraw']].map(([key, label]) => (
          <button key={key} id={`tab-${key}`}
            className={`tx-tab ${tab === key ? 'tx-tab--active' : ''}`}
            onClick={() => { setTab(key); setMsg({ type: '', text: '' }); }}>
            {label}
          </button>
        ))}
      </div>

      {/* Alert */}
      {msg.text && (
        <div className={`alert alert-${msg.type === 'success' ? 'success' : 'error'}`}>
          {msg.type === 'success' ? '✓' : '⚠'} {msg.text}
        </div>
      )}

      {/* History Tab */}
      {tab === 'history' && (
        <div className="card animate-fadeIn">
          <div className="history-header">
            <h2 className="section-title" style={{ margin: 0 }}>Transaction History</h2>
            <div className="filter-row">
              {['ALL','DEPOSIT','WITHDRAW','TRANSFER'].map(f => (
                <button key={f} id={`filter-${f}`}
                  className={`filter-btn ${filter === f ? 'filter-btn--active' : ''}`}
                  onClick={() => setFilter(f)}>
                  {f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase() + 's'}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="loading-center"><span className="spinner spinner-lg" /></div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <p>No transactions found.</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Description</th>
                    <th>Target Account</th>
                    <th>Date & Time</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((tx, i) => {
                    const meta = TX_TYPE_META[tx.transactionType] || TX_TYPE_META.TRANSFER;
                    return (
                      <tr key={tx.id}>
                        <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{i + 1}</td>
                        <td><span className={`badge ${meta.badgeClass}`}>{meta.label}</span></td>
                        <td className={`tx-amount-cell ${meta.amtClass}`}>
                          {meta.sign}{fmt(tx.amount)}
                        </td>
                        <td style={{ color: 'var(--text-secondary)' }}>{tx.description || '—'}</td>
                        <td style={{ fontFamily: 'monospace', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                          {tx.targetAccountNumber || '—'}
                        </td>
                        <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                          {fmtDate(tx.transactionDate)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Deposit / Withdraw Form */}
      {(tab === 'deposit' || tab === 'withdraw') && (
        <div className="card tx-form-card animate-fadeIn">
          <div className={`tx-form-icon ${tab === 'deposit' ? 'icon-green' : 'icon-red'}`}>
            {tab === 'deposit' ? '↓' : '↑'}
          </div>
          <h2 className="tx-form-title">
            {tab === 'deposit' ? 'Deposit Funds' : 'Withdraw Funds'}
          </h2>
          <p className="tx-form-desc">
            {tab === 'deposit'
              ? 'Add money to your account instantly.'
              : 'Withdraw funds from your account.'}
          </p>

          <form onSubmit={handleSubmit} style={{ marginTop: '28px' }} id={`form-${tab}`}>
            <div className="form-group">
              <label className="form-label">Account Number</label>
              <input className="form-control" value={accountNum} readOnly style={{ opacity: 0.6 }} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="tx-amount">Amount (₹)</label>
              <input id="tx-amount" name="amount" type="number" min="1" step="0.01"
                className="form-control" placeholder="Enter amount" value={form.amount} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="tx-desc">Description (optional)</label>
              <input id="tx-desc" name="description" type="text" className="form-control"
                placeholder="e.g. Salary credit" value={form.description} onChange={handleChange} />
            </div>
            <button type="submit" id={`btn-submit-${tab}`}
              className={`btn btn-block btn-lg ${tab === 'deposit' ? 'btn-success-custom' : 'btn-danger-custom'}`}
              disabled={submitting}>
              {submitting
                ? <><span className="spinner" /> Processing…</>
                : tab === 'deposit' ? '↓ Confirm Deposit' : '↑ Confirm Withdrawal'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
