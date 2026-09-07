import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import IssueCard from '../components/IssueCard';

const TechDashboard = () => {
    const [stats, setStats] = useState({ available: 0, WORKING: 0, RESOLVED: 0 });
    const [myWork, setMyWork] = useState([]);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const [statsRes, workRes] = await Promise.all([
                    api.get('/issues/stats'),
                    api.get('/issues/assigned')
                ]);
                setStats(statsRes.data.data);
                // Filter to show active work (WORKING)
                setMyWork(workRes.data.data.filter(i => i.status === 'WORKING').slice(0, 5));
            } catch (err) {
                console.error(err);
            }
        };
        fetchDashboard();
    }, []);

    return (
        <div style={{ marginTop: '2rem' }}>
            <h1 className="text-2xl font-bold mb-4">Tech Member Dashboard</h1>

            <div className="flex gap-4 mb-4">
                <div className="card text-center" style={{ flex: 1 }}>
                    <div className="text-muted text-sm uppercase">Available Issues</div>
                    <div className="text-2xl font-bold text-info">{stats.available}</div>
                </div>
                <div className="card text-center" style={{ flex: 1 }}>
                    <div className="text-muted text-sm uppercase">My Active Work</div>
                    <div className="text-2xl font-bold text-warning">{stats.WORKING}</div>
                </div>
                <div className="card text-center" style={{ flex: 1 }}>
                    <div className="text-muted text-sm uppercase">Resolved</div>
                    <div className="text-2xl font-bold text-success">{stats.RESOLVED}</div>
                </div>
            </div>

            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">My Active Work</h2>
                <Link to="/available-issues" className="btn btn-outline">Find More Issues</Link>
            </div>
            
            {myWork.length === 0 ? (
                <div className="card text-center text-muted">You are not currently working on any issues.</div>
            ) : (
                myWork.map(issue => <IssueCard key={issue.id} issue={issue} />)
            )}
        </div>
    );
};

export default TechDashboard;
