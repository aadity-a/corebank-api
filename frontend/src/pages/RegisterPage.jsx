import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../api';
import './AuthPage.css';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'CUSTOMER' });
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    try {
      await register(form);
      setSuccess('Account created! Redirecting to login…');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-glow auth-glow-1" />
      <div className="auth-glow auth-glow-2" />

      <div className="auth-card animate-fadeInUp">
        <div className="auth-header">
          <div className="auth-logo">
            <div className="logo-icon">N</div>
            <span className="logo-text">apnabank</span>
          </div>
          <h1 className="auth-title">Create an account</h1>
          <p className="auth-subtitle">Join apnabank — it's free and takes 30 seconds</p>
        </div>

        <form onSubmit={handleSubmit} id="register-form">
          {error   && <div className="alert alert-error"   role="alert">⚠ {error}</div>}
          {success && <div className="alert alert-success" role="status">✓ {success}</div>}

          <div className="form-group">
            <label className="form-label" htmlFor="reg-name">Full Name</label>
            <input id="reg-name" name="name" type="text" className="form-control"
              placeholder="John Doe" value={form.name} onChange={handleChange} required autoFocus />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-email">Email address</label>
            <input id="reg-email" name="email" type="email" className="form-control"
              placeholder="john@example.com" value={form.email} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-password">Password</label>
            <input id="reg-password" name="password" type="password" className="form-control"
              placeholder="Min. 6 characters" value={form.password} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-role">Account Type</label>
            <select id="reg-role" name="role" className="form-control" value={form.role} onChange={handleChange}>
              <option value="CUSTOMER">Customer</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          <button id="btn-register" type="submit"
            className="btn btn-primary btn-block btn-lg" disabled={loading}>
            {loading ? <><span className="spinner" /> Creating…</> : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account?{' '}
          <Link to="/login" className="auth-link">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
