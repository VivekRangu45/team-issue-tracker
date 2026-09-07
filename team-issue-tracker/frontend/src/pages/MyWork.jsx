import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import IssueCard from '../components/IssueCard';

const MyWork = () => {
    const [issues, setIssues] = useState([]);
    const [filter, setFilter] = useState('WORKING');

    const fetchIssues = async () => {
        try {
            const res = await api.get('/issues/assigned');
            setIssues(res.data.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchIssues();
    }, []);

    const handleResolve = async (id) => {
        if (!window.confirm('Are you sure you want to mark this issue as resolved?')) return;
        try {
            await api.patch(`/issues/${id}/resolve`);
            fetchIssues();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to resolve issue');
        }
    };

    const filteredIssues = issues.filter(i => i.status === filter);

    return (
        <div style={{ marginTop: '2rem' }}>
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">My Assigned Work</h1>
                <select className="form-control" style={{ width: '200px' }} value={filter} onChange={e => setFilter(e.target.value)}>
                    <option value="WORKING">Currently Working</option>
                    <option value="RESOLVED">Resolved</option>
                </select>
            </div>

            {filteredIssues.length === 0 ? (
                <div className="card text-center text-muted">No issues in this state.</div>
            ) : (
                filteredIssues.map(issue => (
                    <IssueCard 
                        key={issue.id} 
                        issue={issue} 
                        actionButton={
                            filter === 'WORKING' ? (
                                <button onClick={() => handleResolve(issue.id)} className="btn text-sm" style={{ backgroundColor: '#10b981' }}>Mark as Resolved</button>
                            ) : null
                        } 
                    />
                ))
            )}
        </div>
    );
};

export default MyWork;
