import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

// Attach JWT token to every request
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

// Auto logout on 401
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ── Auth ──────────────────────────────────────────────
export const register = (data) => api.post('/auth/register', data);
export const login    = (data) => api.post('/auth/login', data);

// ── Accounts ──────────────────────────────────────────
export const createAccount = ()            => api.post('/accounts/create');
export const getMyAccount  = ()            => api.get('/accounts/my-account');
export const getBalance    = (accountNum)  => api.get(`/accounts/balance/${accountNum}`);

// ── Transactions ──────────────────────────────────────
export const deposit  = (data) => api.post('/transactions/deposit', data);
export const withdraw = (data) => api.post('/transactions/withdraw', data);
export const transfer = (data) => api.post('/transactions/transfer', data);
export const getHistory = (accountNum) => api.get(`/transactions/history/${accountNum}`);

export default api;
