import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, HelpCircle, Upload, Calendar, Users, Trash2, ChevronRight, Clock } from 'lucide-react';

const AssignmentCard = ({ assignment, onSubmissions, onDelete }) => {
    const isExpired = new Date(assignment.deadline) < new Date();
    const submissionCount = assignment._count?.submissions || 0; // Assuming we'll add count to API or calculate it
    const totalStudents = 30; // Placeholder until we have actual course enrollment count

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)' }}
            style={{
                background: 'rgba(30, 41, 59, 0.7)',
                backdropFilter: 'blur(12px)',
                borderRadius: '1.25rem',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '1.5rem',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s ease'
            }}
        >
            {/* Status Badge */}
            <div style={{ position: 'absolute', top: '1.25rem', right: '1.25rem' }}>
                <span style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: '2rem',
                    fontSize: '0.7rem',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    background: isExpired ? 'rgba(239, 68, 68, 0.15)' : 'rgba(34, 197, 94, 0.15)',
                    color: isExpired ? '#fca5a5' : '#86efac',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    border: `1px solid ${isExpired ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)'}`
                }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: isExpired ? '#ef4444' : '#22c55e' }} />
                    {isExpired ? 'Expired' : 'Active'}
                </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{
                    background: assignment.type === 'quiz' ? 'rgba(139, 92, 246, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                    padding: '0.75rem',
                    borderRadius: '1rem',
                    color: assignment.type === 'quiz' ? '#a78bfa' : '#60a5fa',
                    border: '1px solid rgba(255,255,255,0.05)'
                }}>
                    {assignment.type === 'quiz' ? <HelpCircle size={24} /> : <Upload size={24} />}
                </div>
                <div style={{ flex: 1, paddingRight: '5rem' }}>
                    <p style={{ fontSize: '0.75rem', fontWeight: '600', color: '#94a3b8', marginBottom: '0.25rem' }}>{assignment.courseTitle}</p>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 'bold', color: 'white', lineHeight: '1.3' }}>{assignment.title}</h3>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
                        <Calendar size={12} />
                        <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: 'bold' }}>Deadline</span>
                    </div>
                    <p style={{ fontSize: '0.85rem', fontWeight: '600', color: '#f1f5f9' }}>{new Date(assignment.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
                        <Users size={12} />
                        <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: 'bold' }}>Submissions</span>
                    </div>
                    <p style={{ fontSize: '0.85rem', fontWeight: '600', color: '#f1f5f9' }}>{assignment.submissionCount || 0} / --</p>
                </div>
            </div>

            {/* Progress Bar (Submissions) */}
            {assignment.type === 'upload' && (
                <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#94a3b8', marginBottom: '0.4rem' }}>
                        <span>Submission Rate</span>
                        <span>{Math.round(((assignment.submissionCount || 0) / 30) * 100)}%</span>
                    </div>
                    <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${((assignment.submissionCount || 0) / 30) * 100}%` }}
                            style={{ height: '100%', background: 'linear-gradient(90deg, #3b82f6, #2dd4bf)', borderRadius: '2px' }}
                        />
                    </div>
                </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: 'auto' }}>
                <button
                    onClick={() => onSubmissions(assignment.id)}
                    className="primary"
                    style={{
                        flex: 1,
                        padding: '0.65rem',
                        borderRadius: '0.75rem',
                        fontSize: '0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        fontWeight: '600'
                    }}
                >
                    View Submissions <ChevronRight size={16} />
                </button>
                <button
                    onClick={() => onDelete(assignment)}
                    style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        color: '#ef4444',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        padding: '0.65rem',
                        borderRadius: '0.75rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                    }}
                >
                    <Trash2 size={18} />
                </button>
            </div>
        </motion.div>
    );
};

export default AssignmentCard;
