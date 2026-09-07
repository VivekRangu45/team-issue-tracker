import React from 'react';
import { Link } from 'react-router-dom';
import Badge from './Badge';
import { format } from 'date-fns';

const IssueCard = ({ issue, actionButton }) => {
    return (
        <div className="card">
            <div className="flex justify-between items-center mb-2">
                <Link to={`/issues/${issue.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <h3 className="text-xl font-bold">{issue.title}</h3>
                </Link>
                <div className="flex gap-2">
                    <Badge type="category" text={issue.category} />
                    <Badge type="priority" text={issue.priority} />
                    <Badge type="status" text={issue.status} />
                </div>
            </div>
            
            <p className="text-muted mb-4" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {issue.description}
            </p>
            
            <div className="flex justify-between items-center text-sm text-muted">
                <div>
                    <div>Reported by: {issue.reporter_name || 'User'}</div>
                    {issue.assigned_to && <div>Assigned to: {issue.assignee_name || 'Tech'}</div>}
                </div>
                <div>
                    <div>{format(new Date(issue.created_at), 'MMM d, yyyy')}</div>
                    {actionButton && <div className="mt-2">{actionButton}</div>}
                </div>
            </div>
        </div>
    );
};

export default IssueCard;
