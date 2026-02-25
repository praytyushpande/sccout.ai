import React from 'react';

/**
 * Renders a markdown-formatted analysis report with proper dark UI styling.
 * Parses headings, lists, bold, URLs — no external deps needed.
 */
const AnalysisReport = ({ report }) => {
    if (!report) return null;

    const renderMarkdown = (text) => {
        const lines = text.split('\n');
        const elements = [];
        let i = 0;

        while (i < lines.length) {
            const line = lines[i];
            const trimmed = line.trim();

            // Skip empty lines
            if (!trimmed) {
                i++;
                continue;
            }

            // H1: # heading
            if (trimmed.startsWith('# ') && !trimmed.startsWith('## ')) {
                elements.push(
                    <h2 key={i} style={{
                        fontSize: '1.5rem', fontWeight: '700', color: '#f0f0f0',
                        marginTop: '1.5rem', marginBottom: '0.75rem',
                        background: 'linear-gradient(to right, #fff, #a0a0a0)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                    }}>
                        {trimmed.replace(/^#\s+/, '')}
                    </h2>
                );
                i++;
                continue;
            }

            // H2: ## heading
            if (trimmed.startsWith('## ')) {
                elements.push(
                    <h3 key={i} style={{
                        fontSize: '1.15rem', fontWeight: '600', color: '#c4b5fd',
                        marginTop: '1.25rem', marginBottom: '0.5rem'
                    }}>
                        {trimmed.replace(/^##\s+/, '')}
                    </h3>
                );
                i++;
                continue;
            }

            // Numbered list: 1. Item
            if (/^\d+\.\s/.test(trimmed)) {
                const listItems = [];
                while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) {
                    const item = lines[i].trim();
                    // Check if next line is a URL indented under this item
                    let url = null;
                    if (i + 1 < lines.length && lines[i + 1].trim().startsWith('URL:')) {
                        url = lines[i + 1].trim().replace('URL:', '').trim();
                        i++;
                    }
                    listItems.push({ text: item, url });
                    i++;
                }

                elements.push(
                    <div key={`list-${i}`} style={{ marginBottom: '0.75rem' }}>
                        {listItems.map((item, idx) => {
                            // Parse "Name – Title – match" format
                            const text = item.text.replace(/^\d+\.\s+/, '');
                            const matchParts = text.match(/^(.+?)\s*[–-]\s*(\d+)%?\s*match$/i);

                            return (
                                <div key={idx} style={{
                                    padding: '0.75rem 1rem',
                                    marginBottom: '0.5rem',
                                    background: 'rgba(255,255,255,0.03)',
                                    borderRadius: '10px',
                                    borderLeft: '3px solid #6366f1'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                                        <div style={{ flex: 1 }}>
                                            <span style={{ color: '#6366f1', fontWeight: '700', marginRight: '0.5rem' }}>
                                                {idx + 1}.
                                            </span>
                                            <span style={{ color: '#f0f0f0', fontWeight: '500' }}>
                                                {renderInlineMarkdown(matchParts ? matchParts[1] : text)}
                                            </span>
                                        </div>
                                        {matchParts && (
                                            <span style={{
                                                background: 'rgba(99, 102, 241, 0.15)',
                                                color: '#818cf8',
                                                padding: '0.15rem 0.6rem',
                                                borderRadius: '20px',
                                                fontSize: '0.8rem',
                                                fontWeight: '600',
                                                whiteSpace: 'nowrap'
                                            }}>
                                                {matchParts[2]}% match
                                            </span>
                                        )}
                                    </div>
                                    {item.url && (
                                        <a href={item.url} target="_blank" rel="noopener noreferrer"
                                            style={{ color: '#818cf8', fontSize: '0.8rem', textDecoration: 'none', display: 'block', marginTop: '0.25rem' }}>
                                            {item.url}
                                        </a>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                );
                continue;
            }

            // Regular paragraph
            elements.push(
                <p key={i} style={{ color: '#d4d4d8', marginBottom: '0.5rem', lineHeight: '1.6' }}>
                    {renderInlineMarkdown(trimmed)}
                </p>
            );
            i++;
        }

        return elements;
    };

    // Handle **bold**, *italic*, and URLs
    const renderInlineMarkdown = (text) => {
        if (!text) return text;
        const parts = [];
        let remaining = text;
        let keyIdx = 0;

        while (remaining.length > 0) {
            // Bold
            const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
            if (boldMatch && boldMatch.index === 0) {
                parts.push(<strong key={keyIdx++} style={{ color: '#f0f0f0' }}>{boldMatch[1]}</strong>);
                remaining = remaining.slice(boldMatch[0].length);
                continue;
            }

            // URL
            const urlMatch = remaining.match(/(https?:\/\/[^\s]+)/);
            if (urlMatch && urlMatch.index === 0) {
                parts.push(
                    <a key={keyIdx++} href={urlMatch[1]} target="_blank" rel="noopener noreferrer"
                        style={{ color: '#818cf8', textDecoration: 'none' }}>
                        {urlMatch[1].length > 50 ? urlMatch[1].slice(0, 50) + '…' : urlMatch[1]}
                    </a>
                );
                remaining = remaining.slice(urlMatch[0].length);
                continue;
            }

            // Find next special token
            const nextBold = remaining.indexOf('**');
            const nextUrl = remaining.search(/https?:\/\//);
            let nextSpecial = remaining.length;
            if (nextBold > 0) nextSpecial = Math.min(nextSpecial, nextBold);
            if (nextUrl > 0) nextSpecial = Math.min(nextSpecial, nextUrl);

            parts.push(remaining.slice(0, nextSpecial));
            remaining = remaining.slice(nextSpecial);
        }

        return parts;
    };

    return (
        <div className="glass-panel" style={{
            padding: '2rem',
            borderRadius: '16px',
            marginTop: '2rem'
        }}>
            <h3 style={{
                fontSize: '1.5rem', fontWeight: '700', color: '#f0f0f0',
                marginTop: 0, marginBottom: '1.5rem',
                display: 'flex', alignItems: 'center', gap: '0.5rem'
            }}>
                <span style={{ fontSize: '1.2rem' }}>📋</span> Full Analysis Report
            </h3>
            <div>{renderMarkdown(report)}</div>
        </div>
    );
};

export default AnalysisReport;
