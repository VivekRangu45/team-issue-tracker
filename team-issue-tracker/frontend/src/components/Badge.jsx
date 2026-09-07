import React from 'react';

const Badge = ({ text, type }) => {
    let colorStyle = { backgroundColor: '#e5e7eb', color: '#374151' }; // default

    if (type === 'status') {
        if (text === 'ACTIVE') colorStyle = { backgroundColor: '#dbeafe', color: '#1e40af' };
        if (text === 'WORKING') colorStyle = { backgroundColor: '#fef3c7', color: '#92400e' };
        if (text === 'RESOLVED') colorStyle = { backgroundColor: '#d1fae5', color: '#065f46' };
    } else if (type === 'priority') {
        if (text === 'LOW') colorStyle = { backgroundColor: '#f3f4f6', color: '#4b5563' };
        if (text === 'MEDIUM') colorStyle = { backgroundColor: '#fef3c7', color: '#b45309' };
        if (text === 'HIGH') colorStyle = { backgroundColor: '#fee2e2', color: '#b91c1c' };
        if (text === 'CRITICAL') colorStyle = { backgroundColor: '#7f1d1d', color: '#fca5a5' };
    } else if (type === 'category') {
        colorStyle = { backgroundColor: '#ede9fe', color: '#5b21b6' };
    }

    return (
        <span className="badge" style={colorStyle}>
            {text}
        </span>
    );
};

export default Badge;
