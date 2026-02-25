import React from 'react';
import { motion } from 'framer-motion';


const Hero = ({ onScrollToSearch }) => {
    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
            textAlign: 'center',
            padding: '0 1rem'
        }}>
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1, ease: 'easeOut' }}
            >
                <h1 style={{
                    fontSize: 'clamp(3rem, 8vw, 6rem)',
                    fontWeight: '800',
                    lineHeight: '1.1',
                    letterSpacing: '-2px',
                    background: 'linear-gradient(to right, #fff 20%, #a1a1aa 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    marginBottom: '2rem'
                }}>
                    Hire for what they've built, <br /> not where they studied
                </h1>

                <p style={{
                    fontSize: '1.25rem',
                    color: '#a1a1aa',
                    maxWidth: '600px',
                    margin: '0 auto 4rem auto',
                    lineHeight: '1.6'
                }}>
                    Stop hiring from PDFs. ScoutAI finds builders, makers, and self-taught talent that traditional recruiting completely misses.
                </p>

                <motion.button
                    className="btn-primary"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onScrollToSearch}
                    style={{
                        padding: '1.25rem 3rem',
                        fontSize: '1.1rem',
                        borderRadius: '50px'
                    }}
                >
                    Start Scouting
                </motion.button>
            </motion.div>
        </div>
    );
};

export default Hero;
