import React from 'react';

const AnalysisReport = ({ report }) => {
    if (!report) return null;

    return (
        <div style={{
            background: '#0f0f0f',
            padding: '1.5rem',
            borderRadius: '12px',
            border: '1px solid #1a1a1a',
            marginTop: '2rem',
            color: '#c0c0c0',
            lineHeight: '1.6',
            whiteSpace: 'pre-wrap',
            fontFamily: 'monospace',
            fontSize: '0.9rem'
        }}>
            <h3 style={{ color: '#f0f0f0', marginTop: 0, marginBottom: '1rem', fontFamily: 'var(--font-inter)' }}>Analysis Report</h3>
            {report}
        </div>
    );
};

export default AnalysisReport;
