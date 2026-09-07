import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

const Register = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'USER' });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (formData.password !== formData.confirmPassword) {
            return setError("Passwords don't match");
        }

        try {
            await api.post('/auth/register', {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                role: formData.role
            });
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '4rem auto' }} className="card">
            <h2 className="text-2xl font-bold mb-4 text-center">Create Account</h2>
            {error && <div className="badge mb-4" style={{ backgroundColor: '#fee2e2', color: '#b91c1c', display: 'block', padding: '0.5rem' }}>{error}</div>}
            
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label className="form-label">Name</label>
                    <input type="text" name="name" required className="form-control" onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label className="form-label">Email</label>
                    <input type="email" name="email" required className="form-control" onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label className="form-label">Password</label>
                    <input type="password" name="password" required className="form-control" onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label className="form-label">Confirm Password</label>
                    <input type="password" name="confirmPassword" required className="form-control" onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label className="form-label">Account Type</label>
                    <select name="role" className="form-control" onChange={handleChange} value={formData.role}>
                        <option value="USER">User (Report Issues)</option>
                        <option value="TECH_MEMBER">Tech Member (Fix Issues)</option>
                    </select>
                </div>
                <button type="submit" className="btn" style={{ width: '100%' }}>Create Account</button>
            </form>
            
            <div className="mt-4 text-center text-sm">
                Already have an account? <Link to="/login">Login</Link>
            </div>
        </div>
    );
};

export default Register;
