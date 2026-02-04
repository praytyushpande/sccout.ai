import React from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const handleGetStarted = () => {
        if (location.pathname !== '/') {
            navigate('/');
            // Allow time for navigation before scrolling
            setTimeout(() => {
                const inputSection = document.getElementById('search-input-section');
                if (inputSection) {
                    inputSection.scrollIntoView({ behavior: 'smooth' });
                }
            }, 100);
        } else {
            const inputSection = document.getElementById('search-input-section');
            if (inputSection) {
                inputSection.scrollIntoView({ behavior: 'smooth' });
            }
        }
    };

    return (
        <motion.nav
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                padding: '1.5rem 2rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                zIndex: 50
            }}
        >
            {/* Logo */}
            <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{
                        width: '12px',
                        height: '12px',
                        background: '#6366f1',
                        borderRadius: '50%',
                        boxShadow: '0 0 20px #6366f1'
                    }} />
                    <span style={{ fontSize: '1.5rem', fontWeight: '700', letterSpacing: '-1px' }}>
                        ScoutAI
                    </span>
                </div>
            </Link>

            {/* Nav Links - Glass Pill */}
            <div className="glass-panel" style={{
                borderRadius: '50px',
                padding: '0.5rem 0.75rem',
                display: 'flex',
                gap: '2rem'
            }}>
                <Link to="/" style={{
                    color: location.pathname === '/' ? '#fff' : '#a1a1aa',
                    textDecoration: 'none',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    transition: 'color 0.2s',
                    padding: '0.5rem 1rem'
                }}>
                    Platform
                </Link>
                <Link to="/how-it-works" style={{
                    color: location.pathname === '/how-it-works' ? '#fff' : '#a1a1aa',
                    textDecoration: 'none',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    transition: 'color 0.2s',
                    padding: '0.5rem 1rem'
                }}>
                    How it Works
                </Link>
                <Link to="/contact" style={{
                    color: location.pathname === '/contact' ? '#fff' : '#a1a1aa',
                    textDecoration: 'none',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    transition: 'color 0.2s',
                    padding: '0.5rem 1rem'
                }}>
                    Contact
                </Link>
            </div>

            {/* CTA */}
            <button
                className="glass-panel"
                onClick={handleGetStarted}
                style={{
                    borderRadius: '50px',
                    padding: '0.75rem 1.5rem',
                    color: 'white',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                }}
                onMouseOver={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                    e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseOut={(e) => {
                    e.currentTarget.style.background = 'var(--glass-bg)';
                    e.currentTarget.style.transform = 'scale(1)';
                }}
            >
                Get Started
            </button>
        </motion.nav>
    );
};

export default Navbar;
