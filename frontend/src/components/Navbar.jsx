import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleGetStarted = () => {
        setMobileMenuOpen(false);
        if (location.pathname !== '/') {
            navigate('/');
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

    const handleNavClick = () => {
        setMobileMenuOpen(false);
    };

    const navLinks = [
        { path: '/', label: 'Platform' },
        { path: '/how-it-works', label: 'How it Works' },
        { path: '/contact', label: 'Contact' }
    ];

    return (
        <>
            <motion.nav
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="navbar"
            >
                {/* Logo */}
                <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }} onClick={handleNavClick}>
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

                {/* Desktop Nav Links - Glass Pill */}
                <div className="glass-panel nav-links-desktop">
                    {navLinks.map(link => (
                        <Link
                            key={link.path}
                            to={link.path}
                            style={{
                                color: location.pathname === link.path ? '#fff' : '#a1a1aa',
                                textDecoration: 'none',
                                fontSize: '0.9rem',
                                fontWeight: '500',
                                transition: 'color 0.2s',
                                padding: '0.5rem 1rem'
                            }}
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>

                {/* Desktop CTA */}
                <button
                    className="glass-panel nav-cta-desktop"
                    onClick={handleGetStarted}
                >
                    Get Started
                </button>

                {/* Mobile Hamburger Button */}
                <button
                    className="nav-hamburger"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    aria-label="Toggle menu"
                >
                    {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </motion.nav>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        className="mobile-menu-overlay"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="mobile-menu-links">
                            {navLinks.map(link => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    onClick={handleNavClick}
                                    className="mobile-menu-link"
                                    style={{
                                        color: location.pathname === link.path ? '#fff' : '#a1a1aa',
                                    }}
                                >
                                    {link.label}
                                </Link>
                            ))}
                            <button
                                className="btn-primary mobile-menu-cta"
                                onClick={handleGetStarted}
                            >
                                Get Started
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Navbar;
