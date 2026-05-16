import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../api';
import { useAuth } from '../context/AuthContext';
import './AuthPage.css';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await login(form);
      // Backend returns { token, name, email, role }
      const { token, ...userData } = res.data;
      signIn(token, userData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.');
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
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">Sign in to your account to continue</p>
        </div>

        <form onSubmit={handleSubmit} id="login-form">
          {error && <div className="alert alert-error" role="alert">⚠ {error}</div>}

          <div className="form-group">
            <label className="form-label" htmlFor="email">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              className="form-control"
              placeholder="john@example.com"
              value={form.email}
              onChange={handleChange}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              className="form-control"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <button
            id="btn-login"
            type="submit"
            className="btn btn-primary btn-block btn-lg"
            disabled={loading}
          >
            {loading ? <><span className="spinner" /> Signing in…</> : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account?{' '}
          <Link to="/register" className="auth-link">Create one free</Link>
        </div>
      </div>
    </div>
  );
}
