import React, { useState } from 'react';
import api from '../api/axios';
import { Send, Upload, Info, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const InnovationSubmit = () => {
    const navigate = useNavigate();
    const [idea, setIdea] = useState({
        title: '',
        problem: '',
        solution: '',
        impact: '',
        budget: '',
    });
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/innovations', {
                ...idea,
                budget: parseFloat(idea.budget)
            });
            setSubmitted(true);
        } catch (err) {
            alert('Failed to submit idea');
        }
    };

    if (submitted) {
        return (
            <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="glass" style={{ padding: '3rem', borderRadius: '2rem', maxWidth: '500px', margin: '0 auto' }}>
                    <div style={{ background: 'var(--primary)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}>
                        <Send color="white" size={40} />
                    </div>
                    <h2>Idea Submitted!</h2>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '1rem', marginBottom: '2rem' }}>Our sustainability board will review your proposal. You'll be notified of any status updates or feedback.</p>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button onClick={() => navigate('/student/innovation')} style={{ flex: 1, background: 'transparent', border: '1px solid var(--border-dark)' }}>My Innovations</button>
                        <button onClick={() => setSubmitted(false)} className="primary" style={{ flex: 1 }}>Submit Another</button>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <header style={{ marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <button
                    onClick={() => navigate('/student/innovation')}
                    style={{ background: 'rgba(255,255,255,0.05)', padding: '0.75rem', borderRadius: '0.75rem', border: 'none' }}
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>Innovation Challenge 🌱</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>Pitch your sustainable ideas and get funding for your campus projects.</p>
                </div>
            </header>

            <div className="glass" style={{ padding: '2.5rem', borderRadius: '2rem' }}>
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Project Title</label>
                        <input
                            placeholder="e.g. Smart Compost Sensors"
                            value={idea.title}
                            onChange={e => setIdea({ ...idea, title: e.target.value })}
                            required
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Problem Statement</label>
                            <textarea
                                rows="4"
                                placeholder="What sustainability issue are you solving?"
                                value={idea.problem}
                                onChange={e => setIdea({ ...idea, problem: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Proposed Solution</label>
                            <textarea
                                rows="4"
                                placeholder="How does your idea fix it?"
                                value={idea.solution}
                                onChange={e => setIdea({ ...idea, solution: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Expected Impact</label>
                        <input
                            placeholder="e.g. Reduce cafeteria waste by 20%"
                            value={idea.impact}
                            onChange={e => setIdea({ ...idea, impact: e.target.value })}
                            required
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Estimated Budget ($)</label>
                            <input
                                type="number"
                                placeholder="500"
                                value={idea.budget}
                                onChange={e => setIdea({ ...idea, budget: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Project Category</label>
                            <select
                                value={idea.category || ''}
                                onChange={e => setIdea({ ...idea, category: e.target.value })}
                                required
                            >
                                <option value="">Select Category</option>
                                <option value="Renewable Energy">Renewable Energy</option>
                                <option value="Waste Management">Waste Management</option>
                                <option value="Water Conservation">Water Conservation</option>
                                <option value="Smart Agriculture">Smart Agriculture</option>
                                <option value="Carbon Reduction">Carbon Reduction</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '1rem', borderRadius: '1rem', display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                        <Info color="#3b82f6" size={24} />
                        <p style={{ fontSize: '0.875rem', color: '#93c5fd' }}>Tips: Be specific about your budget and how you will measure success. High impact ideas are prioritized.</p>
                    </div>

                    <button type="submit" className="primary" style={{ width: '100%', padding: '1rem' }}>Submit Proposal</button>
                </form>
            </div>
        </div>
    );
};

export default InnovationSubmit;
