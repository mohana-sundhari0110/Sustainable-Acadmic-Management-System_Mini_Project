import React from 'react';
import { Download, ExternalLink, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const SubmissionsTable = ({ submissions, totalMarks, onGrade }) => {
    if (submissions.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '1.5rem', border: '1px dashed rgba(255,255,255,0.1)' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'white', marginBottom: '0.5rem' }}>No submissions yet</h3>
                <p style={{ color: '#94a3b8' }}>Students haven't submitted this assignment yet.</p>
            </div>
        );
    }

    return (
        <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 0.75rem' }}>
                <thead>
                    <tr style={{ color: '#94a3b8', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontWeight: 'bold' }}>Student</th>
                        <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontWeight: 'bold' }}>Submission Date</th>
                        <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontWeight: 'bold' }}>Status</th>
                        <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontWeight: 'bold' }}>File / Response</th>
                        <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontWeight: 'bold' }}>Marks</th>
                        <th style={{ padding: '0.75rem 1.5rem', textAlign: 'right', fontWeight: 'bold' }}>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {submissions.map((sub) => (
                        <tr key={sub.id} style={{ background: 'rgba(255,255,255,0.03)', transition: 'background 0.2s ease' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}>
                            <td style={{ padding: '1rem 1.5rem', borderTopLeftRadius: '1rem', borderBottomLeftRadius: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), #2dd4bf)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'white' }}>
                                        {sub.student?.name?.charAt(0)}
                                    </div>
                                    <div>
                                        <p style={{ fontWeight: 'bold', color: 'white', fontSize: '0.9rem' }}>{sub.student?.name}</p>
                                        <p style={{ fontSize: '0.75rem', color: '#64748b' }}>{sub.student?.email}</p>
                                    </div>
                                </div>
                            </td>
                            <td style={{ padding: '1rem 1.5rem', color: '#cbd5e1', fontSize: '0.85rem' }}>
                                {new Date(sub.createdAt).toLocaleDateString()}
                                <p style={{ fontSize: '0.7rem', color: '#64748b' }}>{new Date(sub.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                            </td>
                            <td style={{ padding: '1rem 1.5rem' }}>
                                <span style={{
                                    padding: '0.25rem 0.6rem',
                                    borderRadius: '0.5rem',
                                    fontSize: '0.7rem',
                                    fontWeight: 'bold',
                                    background: sub.status === 'GRADED' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                                    color: sub.status === 'GRADED' ? '#22c55e' : '#3b82f6',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.35rem',
                                    width: 'fit-content'
                                }}>
                                    {sub.status === 'GRADED' ? <CheckCircle size={14} /> : <Clock size={14} />}
                                    {sub.status}
                                </span>
                            </td>
                            <td style={{ padding: '1rem 1.5rem' }}>
                                {sub.fileUrl ? (
                                    <a href={sub.fileUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', textDecoration: 'none', fontSize: '0.85rem', fontWeight: '600' }}>
                                        <Download size={16} /> View File
                                    </a>
                                ) : (
                                    <span style={{ color: '#64748b', fontSize: '0.85rem', fontStyle: 'italic' }}>Quiz Attempt</span>
                                )}
                            </td>
                            <td style={{ padding: '1rem 1.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <input
                                        type="number"
                                        defaultValue={sub.score}
                                        onBlur={(e) => onGrade(sub.id, e.target.value)}
                                        style={{ width: '60px', padding: '0.4rem', borderRadius: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', textAlign: 'center', fontWeight: 'bold' }}
                                    />
                                    <span style={{ color: '#64748b', fontSize: '0.85rem' }}>/ {totalMarks}</span>
                                </div>
                            </td>
                            <td style={{ padding: '1rem 1.5rem', borderTopRightRadius: '1rem', borderBottomRightRadius: '1rem', textAlign: 'right' }}>
                                <button
                                    onClick={() => onGrade(sub.id, sub.score)} // Just to trigger a re-save/update status
                                    style={{ background: 'transparent', color: 'var(--primary)', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }}
                                >
                                    Update
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default SubmissionsTable;
