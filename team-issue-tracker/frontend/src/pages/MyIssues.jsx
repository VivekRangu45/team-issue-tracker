import React, { useEffect, useState } from 'react';
import api from '../services/api';
import IssueCard from '../components/IssueCard';

const MyIssues = () => {
    const [issues, setIssues] = useState([]);
    const [filter, setFilter] = useState('ALL');

    useEffect(() => {
        const fetchIssues = async () => {
            try {
                const res = await api.get('/issues/my');
                setIssues(res.data.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchIssues();
    }, []);

    const filteredIssues = filter === 'ALL' ? issues : issues.filter(i => i.status === filter);

    return (
        <div style={{ marginTop: '2rem' }}>
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">My Reported Issues</h1>
                <select className="form-control" style={{ width: '200px' }} value={filter} onChange={e => setFilter(e.target.value)}>
                    <option value="ALL">All Statuses</option>
                    <option value="ACTIVE">Active</option>
                    <option value="WORKING">Working</option>
                    <option value="RESOLVED">Resolved</option>
                </select>
            </div>

            {filteredIssues.length === 0 ? (
                <div className="card text-center text-muted">No issues found.</div>
            ) : (
                filteredIssues.map(issue => <IssueCard key={issue.id} issue={issue} />)
            )}
        </div>
    );
};

export default MyIssues;
