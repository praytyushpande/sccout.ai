import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Linkedin, Twitter } from 'lucide-react';
import founderImg from '../assets/founder.jpg';

const Contact = () => {
    return (
        <div style={{ paddingTop: '8rem', paddingBottom: '6rem' }}>
            <div className="container">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="contact-grid" style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                        gap: '4rem',
                        alignItems: 'start'
                    }}>
                        {/* Founder Section */}
                        <div className="glass-panel" style={{ padding: '2.5rem', borderRadius: '24px', textAlign: 'center' }}>
                            <div style={{
                                width: '200px',
                                height: '200px',
                                margin: '0 auto 2rem auto',
                                borderRadius: '50%',
                                overflow: 'hidden',
                                border: '4px solid #6366f1',
                                boxShadow: '0 0 30px rgba(99,102,241,0.3)'
                            }}>
                                <img src={founderImg} alt="Pratyush Pandey" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>

                            <h2 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' }}>Pratyush Pandey</h2>
                            <p style={{ color: '#6366f1', fontWeight: '600', marginBottom: '1.5rem' }}>Founder & Lead Engineer</p>

                            <p style={{ color: '#a1a1aa', lineHeight: '1.6', marginBottom: '2rem' }}>
                                "I built ScoutAI at 17 because I watched talented builders get ignored for not having the right college tag. Skills should speak louder than credentials — this is my attempt to fix that."
                            </p>

                            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                                <a href="mailto:sintul300496@gmail.com" className="glass-panel" style={{ padding: '0.75rem', borderRadius: '12px', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Mail size={20} />
                                </a>
                                <a href="https://www.linkedin.com/in/pratyush-pandey-09b35b219/" target="_blank" rel="noopener noreferrer" className="glass-panel" style={{ padding: '0.75rem', borderRadius: '12px', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Linkedin size={20} />
                                </a>
                                <a href="https://x.com/P_Pratyush7" target="_blank" rel="noopener noreferrer" className="glass-panel" style={{ padding: '0.75rem', borderRadius: '12px', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Twitter size={20} />
                                </a>
                            </div>
                        </div>

                        {/* Use Cases / Contact Form Placeholder */}
                        <div>
                            <h2 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '2rem' }}>Get in Touch</h2>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '16px' }}>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem', color: '#f0f0f0' }}>Use Case: Rapid Scaling</h3>
                                    <p style={{ color: '#a1a1aa' }}>Ideally suited for startups needing to hire the first 5 founding engineers within weeks.</p>
                                </div>

                                <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '16px' }}>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem', color: '#f0f0f0' }}>Use Case: Niche Roles</h3>
                                    <p style={{ color: '#a1a1aa' }}>Perfect for finding specialized talent like AI Researchers, Rust Developers, or Cryptographers.</p>
                                </div>

                                <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '16px' }}>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem', color: '#f0f0f0' }}>Use Case: Team Vetting</h3>
                                    <p style={{ color: '#a1a1aa' }}>Validate the technical skills of your current pipeline with our unbiased AI verification.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Contact;
