import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const DevTools = () => {
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const simulate = async (endpoint) => {
        setLoading(true);
        setResult(null);
        try {
            const res = await api.get(`/test/${endpoint}`);
            setResult({ status: res.status, data: res.data, endpoint });
        } catch (err) {
            setResult({
                status: err.response?.status || 500,
                data: err.response?.data || err.message,
                endpoint
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCreateIssue = () => {
        if (!result) return;

        const statusLabel = result.status === 500
            ? '500 Internal Server Error'
            : `${result.status} Error`;
        const title = `API returned ${statusLabel}`;
        const description = `GET /api/test/${result.endpoint} returned HTTP ${result.status}.`;

        navigate('/report-issue', { state: { title, description } });
    };

    return (
        <div style={{ maxWidth: '800px', margin: '2rem auto' }}>
            <h1 className="text-2xl font-bold mb-4 text-danger">Developer Tools / Error Simulator</h1>
            <p className="mb-4 text-muted">This page is for demonstration purposes only. It simulates real-world software errors to demonstrate how issues originate.</p>
            
            <div className="card mb-4">
                <h2 className="font-bold mb-4">Simulate Errors</h2>
                <div className="flex gap-4 flex-wrap">
                    <button onClick={() => simulate('error-500')} disabled={loading} className="btn btn-danger">Simulate 500 API Error</button>
                    <button onClick={() => simulate('db-error')} disabled={loading} className="btn btn-danger">Simulate Database Error</button>
                    <button onClick={() => simulate('slow')} disabled={loading} className="btn btn-warning">Simulate Slow API</button>
                    <button onClick={() => simulate('invalid-data')} disabled={loading} className="btn btn-outline">Simulate Invalid Data</button>
                </div>
            </div>

            {loading && <div className="mt-4">Simulating...</div>}

            {result && (
                <div className="card mt-4 bg-gray-50">
                    <h3 className="font-bold mb-2">Simulation Result: HTTP {result.status}</h3>
                    <pre style={{ background: '#1f2937', color: '#10b981', padding: '1rem', borderRadius: '4px', overflowX: 'auto' }}>
                        {JSON.stringify(result.data, null, 2)}
                    </pre>
                    
                    <div className="mt-4 border-t pt-4">
                        <button onClick={handleCreateIssue} className="btn">Create Issue From Error</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DevTools;
