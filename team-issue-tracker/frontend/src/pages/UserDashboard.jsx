import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import IssueCard from '../components/IssueCard';

const UserDashboard = () => {
    const [stats, setStats] = useState({ total: 0, ACTIVE: 0, WORKING: 0, RESOLVED: 0 });
    const [recentIssues, setRecentIssues] = useState([]);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const [statsRes, issuesRes] = await Promise.all([
                    api.get('/issues/stats'),
                    api.get('/issues/my')
                ]);
                setStats(statsRes.data.data);
                setRecentIssues(issuesRes.data.data.slice(0, 5)); // Just show recent 5
            } catch (err) {
                console.error(err);
            }
        };
        fetchDashboard();
    }, []);

    return (
        <div style={{ marginTop: '2rem' }}>
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">User Dashboard</h1>
                <Link to="/report-issue" className="btn">+ Report an Issue</Link>
            </div>

            <div className="flex gap-4 mb-4">
                <div className="card text-center" style={{ flex: 1 }}>
                    <div className="text-muted text-sm uppercase">Total Reported</div>
                    <div className="text-2xl font-bold">{stats.total}</div>
                </div>
                <div className="card text-center" style={{ flex: 1 }}>
                    <div className="text-muted text-sm uppercase">Active</div>
                    <div className="text-2xl font-bold text-info">{stats.ACTIVE}</div>
                </div>
                <div className="card text-center" style={{ flex: 1 }}>
                    <div className="text-muted text-sm uppercase">Working</div>
                    <div className="text-2xl font-bold text-warning">{stats.WORKING}</div>
                </div>
                <div className="card text-center" style={{ flex: 1 }}>
                    <div className="text-muted text-sm uppercase">Resolved</div>
                    <div className="text-2xl font-bold text-success">{stats.RESOLVED}</div>
                </div>
            </div>

            <h2 className="text-xl font-bold mb-4">My Recent Issues</h2>
            {recentIssues.length === 0 ? (
                <div className="card text-center text-muted">No issues reported yet.</div>
            ) : (
                recentIssues.map(issue => <IssueCard key={issue.id} issue={issue} />)
            )}
        </div>
    );
};

export default UserDashboard;
