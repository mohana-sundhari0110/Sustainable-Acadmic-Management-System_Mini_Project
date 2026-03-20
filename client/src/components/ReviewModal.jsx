import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, CheckCircle, XCircle, RotateCcw } from 'lucide-react';

const ReviewModal = ({ idea, isOpen, onClose, onSubmit }) => {
    const [status, setStatus] = React.useState(idea?.status || 'Pending');
    const [feedback, setFeedback] = React.useState(idea?.adminFeedback || '');
    const [funding, setFunding] = React.useState(idea?.fundingAmount || 0);

    React.useEffect(() => {
        if (idea) {
            setStatus(idea.status);
            setFeedback(idea.adminFeedback || '');
            setFunding(idea.fundingAmount || 0);
        }
    }, [idea]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ status, adminFeedback: feedback, fundingAmount: funding });
    };

    return (
        <AnimatePresence>
            <div style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.8)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: '1rem'
            }}>
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="glass"
                    style={{
                        width: '100%',
                        maxWidth: '600px',
                        padding: '2.5rem',
                        borderRadius: '2rem',
                        position: 'relative'
                    }}
                >
                    <button
                        onClick={onClose}
                        style={{
                            position: 'absolute',
                            top: '1.5rem',
                            right: '1.5rem',
                            background: 'rgba(255,255,255,0.05)',
                            border: 'none',
                            padding: '0.5rem',
                            borderRadius: '50%',
                            color: 'var(--text-secondary)'
                        }}
                    >
                        <X size={20} />
                    </button>

                    <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Review Innovation</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Provide feedback and update status for "{idea?.title}"</p>

                    <div style={{ marginBottom: '2rem', background: 'rgba(255,255,255,0.02)', padding: '1.25rem', borderRadius: '1rem' }}>
                        <p style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Student's Proposal</p>
                        <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}><strong>Problem:</strong> {idea?.problem}</p>
                        <p style={{ fontSize: '0.875rem' }}><strong>Solution:</strong> {idea?.solution}</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>Final Status</label>
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem' }}
                                >
                                    <option value="Pending">Pending</option>
                                    <option value="Approved">Approved</option>
                                    <option value="Rejected">Rejected</option>
                                    <option value="Completed">Completed (Reviewed)</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>Funding ($)</label>
                                <input
                                    type="number"
                                    value={funding}
                                    onChange={(e) => setFunding(e.target.value)}
                                    placeholder="0"
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem' }}
                                />
                            </div>
                        </div>

                        <div style={{ marginBottom: '2rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>Admin Feedback</label>
                            <textarea
                                rows="4"
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                placeholder="Write your review comments here..."
                                style={{ width: '100%', padding: '1rem', borderRadius: '1rem' }}
                                required
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button
                                type="button"
                                onClick={onClose}
                                style={{ flex: 1, background: 'rgba(255,255,255,0.05)', padding: '0.75rem', borderRadius: '0.75rem' }}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="primary"
                                style={{ flex: 2, padding: '0.75rem', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                            >
                                <Send size={18} />
                                Submit Review
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ReviewModal;
