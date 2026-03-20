import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, DollarSign, ChevronDown, ChevronUp, MessageSquare, Clock, CheckCircle, XCircle } from 'lucide-react';

const InnovationCard = ({ idea, isAdmin, onReview }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const getStatusConfig = (status) => {
        switch (status) {
            case 'Completed':
                return { color: '#10b981', icon: <CheckCircle size={14} />, label: 'COMPLETED' };
            case 'Approved':
                return { color: '#3b82f6', icon: <CheckCircle size={14} />, label: 'APPROVED' };
            case 'Rejected':
                return { color: '#ef4444', icon: <XCircle size={14} />, label: 'REJECTED' };
            case 'Pending':
            default:
                return { color: '#f59e0b', icon: <Clock size={14} />, label: 'PENDING' };
        }
    };

    const config = getStatusConfig(idea.status);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            className="glass"
            style={{
                padding: '1.5rem',
                borderRadius: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                transition: 'all 0.3s ease',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.05)'
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{
                    fontSize: '0.7rem',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '1rem',
                    background: `${config.color}20`,
                    color: config.color,
                    fontWeight: '800',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    letterSpacing: '0.05em'
                }}>
                    {config.icon}
                    {config.label}
                </span>
                <span style={{
                    fontSize: '0.75rem',
                    padding: '0.25rem 0.6rem',
                    borderRadius: '0.6rem',
                    background: 'rgba(59, 130, 246, 0.1)',
                    color: '#60a5fa',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    fontWeight: '600'
                }}>
                    <DollarSign size={14} />
                    {idea.budget}
                </span>
            </div>

            <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '700', marginBottom: '0.5rem' }}>{idea.title}</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                    {idea.problem.length > 100 && !isExpanded ? `${idea.problem.substring(0, 100)}...` : idea.problem}
                </p>
            </div>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        style={{ overflow: 'hidden' }}
                    >
                        <div style={{ paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '1rem' }}>
                                <p style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '0.25rem', textTransform: 'uppercase' }}>Solution</p>
                                <p style={{ fontSize: '0.875rem' }}>{idea.solution}</p>
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '1rem' }}>
                                <p style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '0.25rem', textTransform: 'uppercase' }}>Expected Impact</p>
                                <p style={{ fontSize: '0.875rem' }}>{idea.impact}</p>
                            </div>

                            {idea.adminFeedback && (
                                <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: config.color }}>
                                        <MessageSquare size={16} />
                                        <p style={{ fontSize: '0.875rem', fontWeight: 'bold' }}>Admin Feedback</p>
                                    </div>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontStyle: 'italic', background: 'rgba(255,255,255,0.01)', padding: '1rem', borderRadius: '0.75rem' }}>
                                        "{idea.adminFeedback}"
                                    </p>
                                    {idea.reviewedAt && (
                                        <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', marginTop: '0.5rem', textAlign: 'right' }}>
                                            Reviewed on: {new Date(idea.reviewedAt).toLocaleDateString()}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        padding: '0.6rem',
                        borderRadius: '0.75rem',
                        background: 'rgba(255,255,255,0.05)',
                        fontSize: '0.875rem',
                        color: 'var(--text-secondary)'
                    }}
                >
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    {isExpanded ? 'Show Less' : 'Details & Feedback'}
                </button>

                {isAdmin && (
                    <button
                        onClick={() => onReview(idea)}
                        disabled={idea.status === 'Completed'}
                        className="primary"
                        style={{
                            flex: 1,
                            padding: '0.6rem',
                            borderRadius: '0.75rem',
                            fontSize: '0.875rem',
                            opacity: idea.status === 'Completed' ? 0.5 : 1,
                            cursor: idea.status === 'Completed' ? 'not-allowed' : 'pointer'
                        }}
                    >
                        Review & Feedback
                    </button>
                )}
            </div>
        </motion.div>
    );
};

export default InnovationCard;
