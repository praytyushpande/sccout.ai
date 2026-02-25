import React from 'react';
import { ExternalLink, CheckCircle } from 'lucide-react';

const CandidateCard = ({ candidate, rank }) => {
    // Fallback image using UI Avatars if real image is missing
    const imageUrl = candidate.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(candidate.title)}&background=random&color=fff&size=128`;

    return (
        <div className="candidate-card" style={{
            background: '#0f0f0f',
            padding: '1.5rem',
            borderRadius: '12px',
            marginBottom: '1.5rem',
            border: '1px solid #1a1a1a',
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.3s ease',
            display: 'flex',
            gap: '1.5rem'
        }}>
            {/* Rank Badge */}
            <div style={{
                position: 'absolute',
                top: '0',
                left: '0',
                background: '#6366f1',
                color: 'white',
                width: '32px',
                height: '32px',
                borderBottomRightRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '700',
                fontSize: '0.9rem',
                zIndex: '10'
            }}>
                {rank}
            </div>

            {/* Candidate Image */}
            <div style={{ flexShrink: 0 }}>
                <img
                    src={imageUrl}
                    alt={candidate.title}
                    style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '2px solid #333'
                    }}
                    onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(candidate.title)}&background=random&color=fff&size=128`;
                    }}
                />
            </div>

            <div style={{ flex: 1 }}>
                <h3 style={{
                    fontSize: '1.25rem',
                    fontWeight: '600',
                    marginBottom: '0.5rem',
                    color: '#f0f0f0',
                    marginTop: '0'
                }}>
                    {candidate.title}
                </h3>

                {/* Skills */}
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                    {candidate.skills && candidate.skills.split(',').slice(0, 3).map((skill, idx) => (
                        <span key={idx} style={{
                            background: '#1a1a1a',
                            color: '#a0a0a0',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '20px',
                            fontSize: '0.8rem',
                            fontWeight: '500'
                        }}>
                            {skill.trim()}
                        </span>
                    ))}
                </div>

                {/* AI Reason */}
                {candidate.reason && (
                    <div style={{
                        marginBottom: '1rem',
                        fontSize: '0.9rem',
                        color: '#d4d4d8',
                        background: '#18181b',
                        padding: '0.75rem',
                        borderRadius: '8px',
                        borderLeft: '3px solid #6366f1'
                    }}>
                        <strong>AI Analysis:</strong> {candidate.reason}
                    </div>
                )}

                {/* Confidence & Match */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', fontSize: '0.9rem', color: '#c0c0c0' }}>
                    <span style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        color: candidate.confidence === 'Strong Match' ? '#818cf8' :
                            candidate.confidence === 'Good Match' ? '#fbbf24' : '#a1a1aa'
                    }}>
                        <CheckCircle size={14} />
                        {candidate.confidence}
                    </span>
                    <span>{candidate.match_percentage}% Match</span>
                </div>

                <a
                    href={candidate.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 1rem',
                        backgroundColor: '#6366f1',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '6px',
                        fontSize: '0.85rem',
                        fontWeight: '500',
                        transition: 'background 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#4f46e5'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#6366f1'}
                >
                    View Profile <ExternalLink size={14} />
                </a>
            </div>
        </div>
    );
};

export default CandidateCard;
