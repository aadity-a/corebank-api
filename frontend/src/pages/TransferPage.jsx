import { useState } from 'react';
import { transfer } from '../api';
import './TransferPage.css';

function fmt(v) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(v);
}

export default function TransferPage() {
  const accountNum = localStorage.getItem('accountNumber') || '';
  const [form, setForm] = useState({
    accountNumber: accountNum,
    targetAccountNumber: '',
    amount: '',
    description: '',
  });
  const [step, setStep]         = useState(1); // 1=form, 2=confirm, 3=done
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [result, setResult]     = useState('');

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleReview = e => {
    e.preventDefault();
    setError('');
    if (!form.targetAccountNumber.trim()) { setError('Enter a target account number.'); return; }
    if (!form.amount || Number(form.amount) <= 0) { setError('Enter a valid amount.'); return; }
    if (form.targetAccountNumber === accountNum) { setError('Cannot transfer to your own account.'); return; }
    setStep(2);
  };

  const handleConfirm = async () => {
    setLoading(true); setError('');
    try {
      const res = await transfer({ ...form, amount: parseFloat(form.amount) });
      setResult(res.data);
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || 'Transfer failed. Please try again.');
      setStep(1);
    } finally { setLoading(false); }
  };

  const handleReset = () => {
    setForm({ accountNumber: accountNum, targetAccountNumber: '', amount: '', description: '' });
    setStep(1); setError(''); setResult('');
  };

  if (!accountNum) return (
    <div className="transfer-page animate-fadeInUp">
      <div className="alert alert-info">⚠ Please create an account first from the Account page.</div>
    </div>
  );

  return (
    <div className="transfer-page animate-fadeInUp">
      <div className="page-header">
        <h1 className="page-title">Fund Transfer</h1>
        <p className="page-subtitle">Send money securely to any apnabank account.</p>
      </div>

      {/* Step Indicator */}
      <div className="steps-bar">
        {['Details', 'Confirm', 'Done'].map((label, i) => (
          <div key={label} className={`step ${step > i ? 'step--done' : ''} ${step === i + 1 ? 'step--active' : ''}`}>
            <div className="step-circle">
              {step > i + 1 ? '✓' : i + 1}
            </div>
            <span className="step-label">{label}</span>
            {i < 2 && <div className={`step-line ${step > i + 1 ? 'line--done' : ''}`} />}
          </div>
        ))}
      </div>

      {error && <div className="alert alert-error">⚠ {error}</div>}

      {/* Step 1 — Form */}
      {step === 1 && (
        <div className="card transfer-card animate-fadeIn">
          <div className="transfer-card-icon">↗</div>
          <h2 className="transfer-card-title">Transfer Details</h2>

          <form onSubmit={handleReview} id="transfer-form" style={{ marginTop: '24px' }}>
            <div className="form-group">
              <label className="form-label">From Account</label>
              <input className="form-control" value={accountNum} readOnly style={{ opacity: 0.6 }} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="targetAccountNumber">To Account Number</label>
              <input id="targetAccountNumber" name="targetAccountNumber" type="text"
                className="form-control" placeholder="Enter recipient's account number"
                value={form.targetAccountNumber} onChange={handleChange} required autoFocus />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="transfer-amount">Amount (₹)</label>
              <input id="transfer-amount" name="amount" type="number" min="1" step="0.01"
                className="form-control" placeholder="0.00"
                value={form.amount} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="transfer-desc">Note (optional)</label>
              <input id="transfer-desc" name="description" type="text" className="form-control"
                placeholder="e.g. Rent payment" value={form.description} onChange={handleChange} />
            </div>
            <button type="submit" className="btn btn-primary btn-block btn-lg" id="btn-review-transfer">
              Review Transfer →
            </button>
          </form>
        </div>
      )}

      {/* Step 2 — Confirm */}
      {step === 2 && (
        <div className="card transfer-card animate-fadeIn">
          <div className="transfer-card-icon confirm-icon">?</div>
          <h2 className="transfer-card-title">Confirm Transfer</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '28px', textAlign: 'center' }}>
            Please review the details before confirming.
          </p>
          <div className="confirm-rows">
            {[
              ['From',        accountNum,                   true],
              ['To',          form.targetAccountNumber,     true],
              ['Amount',      fmt(form.amount),             false],
              ['Note',        form.description || '—',      false],
            ].map(([label, value, mono]) => (
              <div key={label} className="confirm-row">
                <span className="confirm-label">{label}</span>
                <span className={`confirm-value ${mono ? 'mono' : ''}`}>{value}</span>
              </div>
            ))}
          </div>
          <div className="confirm-amount-box">
            <span>You will send</span>
            <span className="confirm-big-amount">{fmt(form.amount)}</span>
          </div>
          <div className="confirm-actions">
            <button className="btn btn-secondary" onClick={() => setStep(1)} id="btn-edit-transfer">← Edit</button>
            <button className="btn btn-primary btn-lg" onClick={handleConfirm}
              disabled={loading} id="btn-confirm-transfer">
              {loading ? <><span className="spinner" /> Processing…</> : '✓ Confirm Transfer'}
            </button>
          </div>
        </div>
      )}

      {/* Step 3 — Done */}
      {step === 3 && (
        <div className="card transfer-card animate-fadeIn success-card">
          <div className="success-icon-wrap">✓</div>
          <h2 className="transfer-card-title">Transfer Successful!</h2>
          <p className="success-msg">{result}</p>
          <div className="success-detail">
            <span>Amount sent: <strong>{fmt(form.amount)}</strong></span>
            <span>To: <strong className="mono">{form.targetAccountNumber}</strong></span>
          </div>
          <button className="btn btn-primary btn-lg" onClick={handleReset} id="btn-new-transfer">
            + New Transfer
          </button>
        </div>
      )}
    </div>
  );
}
