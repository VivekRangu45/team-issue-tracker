import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import Badge from '../components/Badge';
import { AuthContext } from '../context/AuthContext';
import { format } from 'date-fns';

const IssueDetails = () => {
    const { id } = useParams();
    const { user } = useContext(AuthContext);
    const [issue, setIssue] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [error, setError] = useState('');

    const fetchData = async () => {
        try {
            const [issueRes, commentsRes] = await Promise.all([
                api.get(`/issues/${id}`),
                api.get(`/issues/${id}/comments`)
            ]);
            setIssue(issueRes.data.data);
            setComments(commentsRes.data.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load issue');
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        
        try {
            await api.post(`/issues/${id}/comments`, { comment: newComment });
            setNewComment('');
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to add comment');
        }
    };

    if (error) return <div className="card mt-4 text-center text-danger">{error}</div>;
    if (!issue) return <div className="mt-4 text-center">Loading...</div>;

    const canComment = (user.role === 'USER' && issue.reported_by === user.id) || 
                       (user.role === 'TECH_MEMBER' && issue.assigned_to === user.id);

    return (
        <div style={{ marginTop: '2rem' }}>
            <div className="card mb-4">
                <div className="flex justify-between items-start mb-4">
                    <h1 className="text-2xl font-bold">{issue.title}</h1>
                    <div className="flex gap-2">
                        <Badge type="category" text={issue.category} />
                        <Badge type="priority" text={issue.priority} />
                        <Badge type="status" text={issue.status} />
                    </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded mb-4" style={{ backgroundColor: '#f9fafb', padding: '1rem', borderRadius: '4px' }}>
                    <p style={{ whiteSpace: 'pre-wrap' }}>{issue.description}</p>
                </div>
                
                <div className="flex gap-4 text-sm text-muted">
                    <div><strong>Reported by:</strong> {issue.reporter_name}</div>
                    <div><strong>Assigned to:</strong> {issue.assignee_name || 'Unassigned'}</div>
                    <div><strong>Created:</strong> {format(new Date(issue.created_at), 'PPP p')}</div>
                </div>
            </div>

            <h2 className="text-xl font-bold mb-4">Comments</h2>
            
            <div className="mb-4">
                {comments.length === 0 ? (
                    <p className="text-muted text-sm">No comments yet.</p>
                ) : (
                    comments.map(c => (
                        <div key={c.id} className="card" style={{ marginBottom: '1rem', padding: '1rem' }}>
                            <div className="flex justify-between items-center mb-2 text-sm text-muted">
                                <div>
                                    <span className="font-bold text-main">{c.user_name}</span> ({c.user_role})
                                </div>
                                <div>{format(new Date(c.created_at), 'MMM d, yyyy h:mm a')}</div>
                            </div>
                            <p style={{ whiteSpace: 'pre-wrap' }}>{c.comment}</p>
                        </div>
                    ))
                )}
            </div>

            {canComment ? (
                <div className="card">
                    <h3 className="font-bold mb-2">Add Comment</h3>
                    <form onSubmit={handleCommentSubmit}>
                        <textarea 
                            className="form-control mb-2" 
                            rows="3" 
                            value={newComment} 
                            onChange={e => setNewComment(e.target.value)}
                            placeholder="Write a comment..."
                            required
                        ></textarea>
                        <button type="submit" className="btn">Add Comment</button>
                    </form>
                </div>
            ) : (
                <div className="text-sm text-muted text-center mt-4">
                    {user.role === 'TECH_MEMBER' 
                        ? 'You must take this issue before you can comment on it.' 
                        : 'You can only comment on issues you reported.'}
                </div>
            )}
        </div>
    );
};

export default IssueDetails;
