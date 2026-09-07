import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const Profile = () => {
    const { user, setUser } = useContext(AuthContext);
    const [name, setName] = useState(user?.name || '');
    const [message, setMessage] = useState('');
    const [stats, setStats] = useState({});

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/issues/stats');
                setStats(res.data.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchStats();
    }, []);

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const res = await api.put('/users/me', { name });
            setUser({ ...user, name: res.data.data.name });
            setMessage('Profile updated successfully');
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setMessage('Failed to update profile');
        }
    };

    return (
        <div style={{ maxWidth: '600px', margin: '2rem auto' }}>
            <h1 className="text-2xl font-bold mb-4">Profile</h1>
            
            <div className="card mb-4">
                <div className="flex items-center gap-4 mb-4">
                    <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#4f46e5', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 'bold' }}>
                        {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">{user.name}</h2>
                        <div className="text-muted">{user.email}</div>
                        <div className="badge mt-1" style={{ backgroundColor: '#e5e7eb', color: '#374151' }}>{user.role}</div>
                    </div>
                </div>
                
                {message && <div className="badge mb-4" style={{ display: 'block', padding: '0.5rem', backgroundColor: message.includes('success') ? '#d1fae5' : '#fee2e2', color: message.includes('success') ? '#065f46' : '#b91c1c' }}>{message}</div>}

                <form onSubmit={handleUpdate}>
                    <div className="form-group">
                        <label className="form-label">Edit Name</label>
                        <input type="text" className="form-control" value={name} onChange={e => setName(e.target.value)} required />
                    </div>
                    <button type="submit" className="btn btn-outline">Save Changes</button>
                </form>
            </div>

            <h2 className="text-xl font-bold mb-4">Statistics</h2>
            <div className="flex gap-4">
                {user.role === 'USER' ? (
                    <>
                        <div className="card text-center flex-1">
                            <div className="text-muted text-sm">Total Reported</div>
                            <div className="text-2xl font-bold">{stats.total || 0}</div>
                        </div>
                        <div className="card text-center flex-1">
                            <div className="text-muted text-sm">Resolved</div>
                            <div className="text-2xl font-bold text-success">{stats.RESOLVED || 0}</div>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="card text-center flex-1">
                            <div className="text-muted text-sm">Currently Working</div>
                            <div className="text-2xl font-bold text-warning">{stats.WORKING || 0}</div>
                        </div>
                        <div className="card text-center flex-1">
                            <div className="text-muted text-sm">Resolved</div>
                            <div className="text-2xl font-bold text-success">{stats.RESOLVED || 0}</div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Profile;
