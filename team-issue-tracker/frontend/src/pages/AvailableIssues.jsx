import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import IssueCard from '../components/IssueCard';

const AvailableIssues = () => {
    const [issues, setIssues] = useState([]);
    const [catFilter, setCatFilter] = useState('ALL');
    const [priFilter, setPriFilter] = useState('ALL');
    const navigate = useNavigate();

    const fetchIssues = async () => {
        try {
            const res = await api.get('/issues/available');
            setIssues(res.data.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchIssues();
    }, []);

    const handleTakeIssue = async (id) => {
        try {
            await api.post(`/issues/${id}/take`);
            navigate('/my-work');
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to take issue. It might have been taken by someone else.');
            fetchIssues(); // Refresh list on conflict
        }
    };

    const filteredIssues = issues.filter(i => {
        if (catFilter !== 'ALL' && i.category !== catFilter) return false;
        if (priFilter !== 'ALL' && i.priority !== priFilter) return false;
        return true;
    });

    return (
        <div style={{ marginTop: '2rem' }}>
            <h1 className="text-2xl font-bold mb-4">Available Issues</h1>
            
            <div className="flex gap-4 mb-4">
                <select className="form-control" style={{ width: '200px' }} value={catFilter} onChange={e => setCatFilter(e.target.value)}>
                    <option value="ALL">All Categories</option>
                    <option value="BUG">Bug</option>
                    <option value="FEATURE">Feature</option>
                    <option value="SECURITY">Security</option>
                    <option value="DOCUMENTATION">Documentation</option>
                    <option value="PERFORMANCE">Performance</option>
                    <option value="UI">UI</option>
                    <option value="OTHER">Other</option>
                </select>
                <select className="form-control" style={{ width: '200px' }} value={priFilter} onChange={e => setPriFilter(e.target.value)}>
                    <option value="ALL">All Priorities</option>
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                </select>
            </div>

            {filteredIssues.length === 0 ? (
                <div className="card text-center text-muted">No available issues match your filters.</div>
            ) : (
                filteredIssues.map(issue => (
                    <IssueCard 
                        key={issue.id} 
                        issue={issue} 
                        actionButton={
                            <button onClick={() => handleTakeIssue(issue.id)} className="btn btn-outline text-sm">Take Issue</button>
                        } 
                    />
                ))
            )}
        </div>
    );
};

export default AvailableIssues;
