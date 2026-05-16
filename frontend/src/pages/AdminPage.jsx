import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import api from '../api';
import './AdminPage.css';

export default function AdminPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('users');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Protect route
  if (user?.role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await api.get(`/admin/${activeTab}`);
        setData(response.data);
      } catch (err) {
        setError(err.response?.data?.message || `Failed to fetch ${activeTab}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab]);

  return (
    <div className="admin-page animate-fadeInUp container">
      <div className="admin-header">
        <h1 className="admin-title">Admin Dashboard</h1>
        <p className="admin-subtitle">Manage users, accounts, and transactions across the platform.</p>
      </div>

      <div className="admin-tabs">
        <button 
          className={`admin-tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Users
        </button>
        <button 
          className={`admin-tab-btn ${activeTab === 'accounts' ? 'active' : ''}`}
          onClick={() => setActiveTab('accounts')}
        >
          Accounts
        </button>
        <button 
          className={`admin-tab-btn ${activeTab === 'transactions' ? 'active' : ''}`}
          onClick={() => setActiveTab('transactions')}
        >
          Transactions
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="admin-content">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <span className="spinner spinner-lg"></span>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  {activeTab === 'users' && (
                    <>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Account Number</th>
                      <th>Balance</th>
                    </>
                  )}
                  {activeTab === 'accounts' && (
                    <>
                      <th>ID</th>
                      <th>Account Number</th>
                      <th>Balance</th>
                      <th>User ID</th>
                    </>
                  )}
                  {activeTab === 'transactions' && (
                    <>
                      <th>ID</th>
                      <th>Type</th>
                      <th>Amount</th>
                      <th>Date</th>
                      <th>Account ID</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {data.map((item) => (
                  <tr key={item.id}>
                    {activeTab === 'users' && (
                      <>
                        <td>{item.id}</td>
                        <td>{item.name}</td>
                        <td>{item.email}</td>
                        <td>
                          <span className={`badge ${item.role === 'ADMIN' ? 'badge-purple' : 'badge-blue'}`}>
                            {item.role}
                          </span>
                        </td>
                        <td className="mono">{item.accountNumber}</td>
                        <td>{item.balance !== null ? `$${Number(item.balance).toFixed(2)}` : 'N/A'}</td>
                      </>
                    )}
                    {activeTab === 'accounts' && (
                      <>
                        <td>{item.id}</td>
                        <td className="mono">{item.accountNumber}</td>
                        <td>${item.balance !== undefined ? Number(item.balance).toFixed(2) : '0.00'}</td>
                        <td>{item.user?.id || 'N/A'}</td>
                      </>
                    )}
                    {activeTab === 'transactions' && (
                      <>
                        <td>{item.id}</td>
                        <td>
                          <span className={`badge ${
                            item.transactionType === 'DEPOSIT' ? 'badge-green' : 
                            item.transactionType === 'WITHDRAWAL' ? 'badge-yellow' : 'badge-blue'
                          }`}>
                            {item.transactionType}
                          </span>
                        </td>
                        <td>${item.amount !== undefined ? Number(item.amount).toFixed(2) : '0.00'}</td>
                        <td>{new Date(item.transactionDate).toLocaleString()}</td>
                        <td>{item.account?.id || 'N/A'}</td>
                      </>
                    )}
                  </tr>
                ))}
                {data.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '24px' }}>
                      No {activeTab} found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
