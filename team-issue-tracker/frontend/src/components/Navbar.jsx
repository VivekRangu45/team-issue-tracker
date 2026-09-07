import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogOut, User, Activity } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!user) return null;

    return (
        <nav style={{ background: '#1f2937', color: 'white', padding: '1rem 0' }}>
            <div className="container flex items-center justify-between" style={{ margin: '0 auto' }}>
                <div className="flex items-center gap-4">
                    <Link to="/dashboard" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Activity size={24} />
                        Team Issue Tracker
                    </Link>
                    
                    <div className="flex gap-4" style={{ marginLeft: '2rem' }}>
                        <Link to="/dashboard" style={{ color: '#d1d5db', textDecoration: 'none' }}>Dashboard</Link>
                        
                        {user.role === 'USER' && (
                            <>
                                <Link to="/my-issues" style={{ color: '#d1d5db', textDecoration: 'none' }}>My Issues</Link>
                                <Link to="/report-issue" style={{ color: '#d1d5db', textDecoration: 'none' }}>Report Issue</Link>
                            </>
                        )}

                        {user.role === 'TECH_MEMBER' && (
                            <>
                                <Link to="/available-issues" style={{ color: '#d1d5db', textDecoration: 'none' }}>Available Issues</Link>
                                <Link to="/my-work" style={{ color: '#d1d5db', textDecoration: 'none' }}>My Work</Link>
                            </>
                        )}
                        <Link to="/dev-tools" style={{ color: '#d1d5db', textDecoration: 'none' }}>Dev Tools</Link>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <Link to="/profile" className="flex items-center gap-2" style={{ color: '#d1d5db', textDecoration: 'none' }}>
                        <User size={18} />
                        {user.name} ({user.role})
                    </Link>
                    <button onClick={handleLogout} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderColor: '#4b5563', color: '#d1d5db' }}>
                        <LogOut size={16} /> Logout
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
