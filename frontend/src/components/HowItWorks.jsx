import React from 'react';
import { motion } from 'framer-motion';
import { Bot, Search, FileText, CheckCircle } from 'lucide-react';

const HowItWorks = () => {
    const steps = [
        {
            icon: <FileText size={40} color="#6366f1" />,
            title: "1. Define the Role",
            desc: "Simply describe the job you're hiring for in plain English. No complex filters or boolean strings needed."
        },
        {
            icon: <Search size={40} color="#a855f7" />,
            title: "2. Deep Search",
            desc: "ScoutAI scans thousands of public profiles, portfolios, and code repositories in real-time."
        },
        {
            icon: <Bot size={40} color="#ec4899" />,
            title: "3. AI Analysis",
            desc: "Our Gemini-powered engine evaluates each candidate against your specific requirements, assigning a match score."
        },
        {
            icon: <CheckCircle size={40} color="#22c55e" />,
            title: "4. Verification",
            desc: "Get a shortlisted list of candidates with a detailed 'Why this match?' explanation and direct profile links."
        }
    ];

    return (
        <div style={{ paddingTop: '8rem', paddingBottom: '6rem' }}>
            <div className="container">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    style={{ textAlign: 'center', marginBottom: '6rem' }}
                >
                    <h1 style={{
                        fontSize: '3rem',
                        fontWeight: '700',
                        marginBottom: '1.5rem',
                        background: 'linear-gradient(to right, #fff, #a0a0a0)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        How ScoutAI Works
                    </h1>
                    <p style={{ fontSize: '1.25rem', color: '#a1a1aa', maxWidth: '700px', margin: '0 auto' }}>
                        We replace manual screening with intelligent, automated analysis.
                    </p>
                </motion.div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem', position: 'relative' }}>
                    {/* Connecting Line (Desktop) */}
                    <div style={{
                        position: 'absolute',
                        left: '50%',
                        top: '0',
                        bottom: '0',
                        width: '2px',
                        background: 'linear-gradient(to bottom, #6366f1, #a855f7, #ec4899)',
                        transform: 'translateX(-50%)',
                        zIndex: -1,
                        opacity: 0.3,
                        display: 'none', // Hidden on mobile, could enable on desktop media query
                    }} className="desktop-line"></div>

                    {steps.map((step, idx) => (
                        <motion.div
                            key={idx}
                            className="how-step"
                            initial={{ opacity: 0, x: idx % 2 === 0 ? -50 : 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.6, delay: idx * 0.1 }}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '3rem',
                                flexDirection: idx % 2 === 0 ? 'row' : 'row-reverse',
                                justifyContent: 'center'
                            }}
                        >
                            <div className="glass-panel" style={{
                                padding: '2rem',
                                borderRadius: '20px',
                                width: '100%',
                                maxWidth: '500px',
                                position: 'relative'
                            }}>
                                <div style={{
                                    marginBottom: '1rem',
                                    background: 'rgba(255,255,255,0.05)',
                                    width: 'fit-content',
                                    padding: '1rem',
                                    borderRadius: '12px'
                                }}>
                                    {step.icon}
                                </div>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.75rem', color: '#f0f0f0' }}>{step.title}</h3>
                                <p style={{ fontSize: '1rem', color: '#a1a1aa', lineHeight: '1.6' }}>{step.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HowItWorks;
