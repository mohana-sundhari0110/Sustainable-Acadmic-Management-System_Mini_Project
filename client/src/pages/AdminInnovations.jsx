import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, Search, Filter, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import InnovationCard from '../components/InnovationCard';
import ReviewModal from '../components/ReviewModal';

const Toast = ({ message, type, onClose }) => (
    <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            background: type === 'success' ? '#10b981' : '#ef4444',
            color: 'white',
            padding: '1rem 1.5rem',
            borderRadius: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            zIndex: 2000
        }}
    >
        {type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
        {message}
    </motion.div>
);

const AdminInnovations = () => {
    const [ideas, setIdeas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('All');
    const [selectedIdea, setSelectedIdea] = useState(null);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        fetchIdeas();
    }, []);

    const fetchIdeas = async () => {
        try {
            setLoading(true);
            const res = await api.get('/innovations');
            setIdeas(res.data);
            setError(null);
        } catch (err) {
            setError('Failed to fetch ideas');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleReviewSubmit = async (reviewData) => {
        try {
            const res = await api.put(`/innovations/${selectedIdea.id}`, reviewData);

            // Update local state instantly
            setIdeas(prev => prev.map(idea => idea.id === selectedIdea.id ? res.data : idea));

            setToast({ message: 'Review submitted successfully!', type: 'success' });
            setSelectedIdea(null);
            setTimeout(() => setToast(null), 3000);
        } catch (err) {
            setToast({ message: 'Error submitting review', type: 'error' });
            setTimeout(() => setToast(null), 3000);
        }
    };

    const filteredIdeas = ideas.filter(idea => {
        const matchesSearch = idea.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            idea.problem.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filter === 'All' || idea.status === filter;
        return matchesSearch && matchesFilter;
    });

    return (
        <div style={{ paddingBottom: '4rem' }}>
            <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Lightbulb color="var(--primary)" size={28} />
                        Innovation Proposals
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Review and provide feedback for sustainable student ideas.</p>
                </div>
                <button onClick={fetchIdeas} className="glass" style={{ padding: '0.75rem 1rem', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Loader2 size={18} className={loading ? 'animate-spin' : ''} />
                    Refresh
                </button>
            </header>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                    <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} size={18} />
                    <input
                        type="text"
                        placeholder="Search by title or problem..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ paddingLeft: '3rem', width: '100%' }}
                    />
                </div>
                <div style={{ position: 'relative', width: '200px' }}>
                    <Filter style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} size={18} />
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        style={{ paddingLeft: '3rem', width: '100%' }}
                    >
                        <option value="All">All Status</option>
                        <option value="Pending">Pending</option>
                        <option value="Approved">Approved</option>
                        <option value="Completed">Completed</option>
                        <option value="Rejected">Rejected</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem' }}>
                    <Loader2 className="animate-spin" size={40} color="var(--primary)" />
                    <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Loading proposals...</p>
                </div>
            ) : error ? (
                <div className="glass" style={{ textAlign: 'center', padding: '4rem 2rem', borderRadius: '1.5rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                    <div style={{ background: 'rgba(239, 68, 68, 0.1)', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                        <AlertCircle size={32} color="#ef4444" />
                    </div>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{error}</h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Check your connection or the server status.</p>
                    <button onClick={fetchIdeas} className="primary" style={{ padding: '0.75rem 2.5rem' }}>
                        Retry Search
                    </button>
                </div>
            ) :
                filteredIdeas.length === 0 ? (
                    <div className="glass" style={{ textAlign: 'center', padding: '4rem', borderRadius: '1.5rem', opacity: 0.7 }}>
                        <Lightbulb size={48} style={{ margin: '0 auto 1.5rem', color: 'var(--text-secondary)' }} />
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No Proposals Found</h3>
                        <p style={{ color: 'var(--text-secondary)' }}>Try adjusting your search or filters.</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
                        {filteredIdeas.map((idea) => (
                            <InnovationCard
                                key={idea.id}
                                idea={idea}
                                isAdmin={true}
                                onReview={() => setSelectedIdea(idea)}
                            />
                        ))}
                    </div>
                )}

            <ReviewModal
                isOpen={!!selectedIdea}
                idea={selectedIdea}
                onClose={() => setSelectedIdea(null)}
                onSubmit={handleReviewSubmit}
            />

            <AnimatePresence>
                {toast && <Toast {...toast} onClose={() => setToast(null)} />}
            </AnimatePresence>
        </div>
    );
};

export default AdminInnovations;
