import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, Loader2, AlertCircle, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import InnovationCard from '../components/InnovationCard';

const MyInnovations = () => {
    const [ideas, setIdeas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchMyIdeas();
    }, []);

    const fetchMyIdeas = async () => {
        try {
            setLoading(true);
            const res = await api.get('/innovations');
            setIdeas(res.data);
        } catch (err) {
            setError('Failed to fetch your innovations');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ paddingBottom: '4rem' }}>
            <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>My Innovations</h2>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Track the status of your sustainable project proposals.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button onClick={fetchMyIdeas} className="glass" style={{ padding: '0.75rem 1rem', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Loader2 size={18} className={loading ? 'animate-spin' : ''} />
                        Refresh
                    </button>
                    <button
                        onClick={() => navigate('/student/innovation/submit')}
                        className="primary"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.75rem 1.25rem',
                            borderRadius: '1rem'
                        }}
                    >
                        <Plus size={20} />
                        New Proposal
                    </button>
                </div>
            </header>

            {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem' }}>
                    <Loader2 className="animate-spin" size={40} color="var(--primary)" />
                    <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Loading your ideas...</p>
                </div>
            ) : error ? (
                <div className="glass" style={{ textAlign: 'center', padding: '4rem 2rem', borderRadius: '1.5rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                    <div style={{ background: 'rgba(239, 68, 68, 0.1)', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                        <AlertCircle size={32} color="#ef4444" />
                    </div>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{error}</h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Check your connection or the server status.</p>
                    <button onClick={fetchMyIdeas} className="primary" style={{ padding: '0.75rem 2.5rem' }}>
                        Retry Loading
                    </button>
                </div>
            ) :
                ideas.length === 0 ? (
                    <div className="glass" style={{ textAlign: 'center', padding: '5rem 2rem', borderRadius: '2rem', border: '2px dashed rgba(255,255,255,0.05)' }}>
                        <div style={{
                            background: 'rgba(16, 185, 129, 0.1)',
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 2rem'
                        }}>
                            <Lightbulb size={40} color="var(--primary)" />
                        </div>
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>No Innovations Yet</h3>
                        <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto 2.5rem' }}>
                            Have a great idea for campus sustainability? Submit your first proposal today and make an impact!
                        </p>
                        <button
                            onClick={() => navigate('/student/innovation/submit')}
                            className="primary"
                            style={{ padding: '0.875rem 2rem' }}
                        >
                            Submit Idea
                        </button>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
                        {ideas.map((idea) => (
                            <InnovationCard
                                key={idea.id}
                                idea={idea}
                                isAdmin={false}
                            />
                        ))}
                    </div>
                )}
        </div>
    );
};

export default MyInnovations;
