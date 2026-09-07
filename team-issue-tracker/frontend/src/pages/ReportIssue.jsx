import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';

const ReportIssue = () => {
    const location = useLocation();
    const [title, setTitle] = useState(location.state?.title || '');
    const [description, setDescription] = useState(location.state?.description || '');
    const [category, setCategory] = useState('');
    const [priority, setPriority] = useState('');
    
    const [suggestion, setSuggestion] = useState(null);
    const [loadingAI, setLoadingAI] = useState(false);
    const [error, setError] = useState('');
    
    const navigate = useNavigate();

    const handlePredict = async (e) => {
        e.preventDefault();
        if (!description) return setError('Please enter a description to get AI suggestions');
        
        setError('');
        setLoadingAI(true);
        try {
            const res = await api.post('/ml/predict', { description });
            if (res.data.success) {
                setSuggestion(res.data.data);
                // Pre-fill but let user edit
                setCategory(res.data.data.category);
                setPriority(res.data.data.priority);
            }
        } catch (err) {
            console.error(err);
            setError('Failed to get AI predictions.');
        } finally {
            setLoadingAI(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (!category || !priority) {
            return setError('Please provide Category and Priority (or use AI suggestions)');
        }

        try {
            await api.post('/issues', { title, description, category, priority });
            navigate('/my-issues');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit issue');
        }
    };

    return (
        <div style={{ maxWidth: '800px', margin: '2rem auto' }} className="card">
            <h1 className="text-2xl font-bold mb-4">Report an Issue</h1>
            
            {error && <div className="badge mb-4" style={{ backgroundColor: '#fee2e2', color: '#b91c1c', display: 'block', padding: '0.5rem' }}>{error}</div>}
            
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label className="form-label">Issue Title</label>
                    <input type="text" required className="form-control" value={title} onChange={e => setTitle(e.target.value)} placeholder="E.g., Login page crashes" />
                </div>
                
                <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea required className="form-control" rows="5" value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe the issue in detail..."></textarea>
                </div>

                <div className="mb-4">
                    <button type="button" onClick={handlePredict} disabled={loadingAI || !description} className="btn btn-outline">
                        {loadingAI ? 'Analyzing...' : 'Get AI Suggestions for Category & Priority'}
                    </button>
                </div>

                {suggestion && (
                    <div className="card mb-4" style={{ backgroundColor: '#f0f9ff', border: '1px solid #bae6fd' }}>
                        <h4 className="font-bold mb-2">AI Suggestions:</h4>
                        <p><strong>Category:</strong> {suggestion.category} <span className="text-muted text-sm">(Confidence: {suggestion.category_confidence})</span></p>
                        <p><strong>Priority:</strong> {suggestion.priority} <span className="text-muted text-sm">(Confidence: {suggestion.priority_confidence})</span></p>
                        <p className="text-sm mt-2 text-muted">You can edit these values below before submitting.</p>
                    </div>
                )}

                <div className="flex gap-4">
                    <div className="form-group" style={{ flex: 1 }}>
                        <label className="form-label">Category</label>
                        <select required className="form-control" value={category} onChange={e => setCategory(e.target.value)}>
                            <option value="" disabled>Select Category</option>
                            <option value="BUG">Bug</option>
                            <option value="FEATURE">Feature</option>
                            <option value="DOCUMENTATION">Documentation</option>
                            <option value="SECURITY">Security</option>
                            <option value="PERFORMANCE">Performance</option>
                            <option value="UI">UI</option>
                            <option value="OTHER">Other</option>
                        </select>
                    </div>
                    
                    <div className="form-group" style={{ flex: 1 }}>
                        <label className="form-label">Priority</label>
                        <select required className="form-control" value={priority} onChange={e => setPriority(e.target.value)}>
                            <option value="" disabled>Select Priority</option>
                            <option value="LOW">Low</option>
                            <option value="MEDIUM">Medium</option>
                            <option value="HIGH">High</option>
                            <option value="CRITICAL">Critical</option>
                        </select>
                    </div>
                </div>

                <button type="submit" className="btn mt-4">Submit Issue</button>
            </form>
        </div>
    );
};

export default ReportIssue;
