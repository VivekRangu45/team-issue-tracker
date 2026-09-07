import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const res = await api.post('/auth/login', { email, password });
            if (res.data.success) {
                login(res.data.data.token, res.data.data.user);
                navigate('/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '4rem auto' }} className="card">
            <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>
            {error && <div className="badge mb-4" style={{ backgroundColor: '#fee2e2', color: '#b91c1c', display: 'block', padding: '0.5rem' }}>{error}</div>}
            
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label className="form-label">Email</label>
                    <input type="email" required className="form-control" value={email} onChange={e => setEmail(e.target.value)} />
                </div>
                <div className="form-group">
                    <label className="form-label">Password</label>
                    <input type="password" required className="form-control" value={password} onChange={e => setPassword(e.target.value)} />
                </div>
                <button type="submit" className="btn" style={{ width: '100%' }}>Login</button>
            </form>
            
            <div className="mt-4 text-center text-sm">
                Don't have an account? <Link to="/register">Create Account</Link>
            </div>
            
            <div className="mt-4 text-center text-sm text-muted">
                <p>Demo User: user@example.com / User@123</p>
                <p>Demo Tech: tech@example.com / Tech@123</p>
            </div>
        </div>
    );
};

export default Login;
