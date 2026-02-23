import React, { useState, useRef } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Search, Loader2 } from 'lucide-react';
import Hero from './Hero';
import CandidateCard from './CandidateCard';
import AnalysisReport from './AnalysisReport';

function Home() {
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  const mainSectionRef = useRef(null);

  const scrollToSearch = () => {
    // Scroll to the input section
    const el = document.getElementById('search-input-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    else mainSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSearch = async () => {
    if (!jobDescription.trim()) return;

    setLoading(true);
    setError('');
    setData(null);

    try {
      const response = await axios.post('/api/analyze', {
        description: jobDescription
      });
      setData(response.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch analysis. Ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Hero onScrollToSearch={scrollToSearch} />

      {/* Main Application Section */}
      <div
        id="search-input-section"
        ref={mainSectionRef}
        style={{
          minHeight: '100vh',
          paddingTop: '8rem', // Offset for Navbar
          position: 'relative',
          zIndex: 10
        }}>
        <div className="container">

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            {/* Input Section */}
            <div className="glass-panel" style={{
              maxWidth: '900px',
              margin: '0 auto 4rem auto',
              padding: '2rem',
              borderRadius: '24px'
            }}>
              <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', fontWeight: '600', fontSize: '1.5rem' }}>
                Describe your ideal candidate
              </h2>

              <div style={{ position: 'relative' }}>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="e.g. Senior product designer with fintech experience, strong Figma skills..."
                  style={{
                    width: '100%',
                    minHeight: '180px',
                    padding: '1.5rem',
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    border: '1px solid #333',
                    borderRadius: '16px',
                    color: '#f0f0f0',
                    fontSize: '1.1rem',
                    resize: 'vertical',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    fontFamily: 'var(--font-primary)'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#6366f1'}
                  onBlur={(e) => e.target.style.borderColor = '#333'}
                />
              </div>

              <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                <button
                  className="btn-primary"
                  onClick={handleSearch}
                  disabled={loading || !jobDescription.trim()}
                  style={{
                    fontSize: '1.1rem',
                    padding: '1rem 4rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    borderRadius: '50px'
                  }}
                >
                  {loading ? (
                    <>
                      <Loader2 className="loading-spinner" /> ANALYZING...
                    </>
                  ) : (
                    <>
                      <Search size={20} /> START SCOUTING
                    </>
                  )}
                </button>
              </div>

              {error && (
                <div style={{ marginTop: '1.5rem', color: '#f87171', textAlign: 'center', background: 'rgba(248,113,113,0.1)', padding: '0.5rem', borderRadius: '8px' }}>
                  {error}
                </div>
              )}
            </div>
          </motion.div>

          {/* Results Section */}
          {data && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 style={{ fontSize: '2rem', marginBottom: '2rem', fontWeight: '700', paddingBottom: '1rem' }}>
                <span style={{ color: '#6366f1' }}>{data.candidates.length}</span> Candidates Found
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
                {data.candidates.map((candidate, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <CandidateCard candidate={candidate} rank={idx + 1} />
                  </motion.div>
                ))}
              </div>

              <div style={{ marginBottom: '6rem' }}>
                <AnalysisReport report={data.analysis_report} />
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
}

export default Home;
