import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { ArrowLeft, Search, Filter, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import SubmissionsTable from '../components/SubmissionsTable';

const AdminSubmissions = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [assignment, setAssignment] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

    useEffect(() => {
        fetchSubmissions();
    }, [id]);

    const fetchSubmissions = async () => {
        setLoading(true);
        try {
            const assignmentRes = await api.get(`/assignments/${id}`);
            const submissionsRes = await api.get(`/assignments/${id}/submissions`);
            setAssignment(assignmentRes.data);
            setSubmissions(submissionsRes.data);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch submissions:', err);
            setError('Failed to load submissions. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleGrade = async (submissionId, score) => {
        try {
            await api.patch(`/assignments/submissions/${submissionId}/grade`, {
                score: parseInt(score),
                feedback: 'Graded via management console'
            });
            // Update local state
            setSubmissions(submissions.map(s =>
                s.id === submissionId ? { ...s, score: parseInt(score), status: 'GRADED' } : s
            ));
            // Show success toast here if needed
        } catch (err) {
            alert('Failed to update marks');
        }
    };

    const filteredSubmissions = submissions.filter(sub => {
        const matchesSearch = sub.student?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            sub.student?.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || sub.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    if (loading) {
        return (
            <div style={{ padding: '4rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                <Loader2 size={48} className="animate-spin" color="var(--primary)" />
                <p style={{ marginTop: '1rem', color: '#94a3b8' }}>Loading submissions...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ padding: '4rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                <AlertCircle size={48} color="#ef4444" />
                <h3 style={{ marginTop: '1rem', color: 'white', fontSize: '1.25rem' }}>{error}</h3>
                <button onClick={fetchSubmissions} className="primary" style={{ marginTop: '1.5rem', padding: '0.75rem 1.5rem', borderRadius: '0.75rem' }}>Retry</button>
            </div>
        );
    }

    return (
        <div style={{ padding: '2rem' }}>
            <button
                onClick={() => navigate('/admin/assignments')}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', color: '#94a3b8', border: 'none', cursor: 'pointer', marginBottom: '1.5rem', fontWeight: '600' }}
            >
                <ArrowLeft size={20} /> Back to Assignments
            </button>

            <div style={{ marginBottom: '2.5rem' }}>
                <h2 style={{ fontSize: '2.25rem', fontWeight: 'bold', marginBottom: '0.5rem', background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    {assignment?.title}
                </h2>
                <p style={{ color: '#94a3b8', fontSize: '1rem' }}>Manage and grade student submissions</p>
            </div>

            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem',
                marginBottom: '2rem',
                padding: '1.5rem',
                background: 'rgba(255,255,255,0.02)',
                borderRadius: '1.25rem',
                border: '1px solid rgba(255,255,255,0.05)'
            }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ position: 'relative', flex: 1, minWidth: '300px' }}>
                        <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} size={18} />
                        <input
                            type="text"
                            placeholder="Search by student name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 3rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                        />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Filter size={18} color="#64748b" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            style={{ padding: '0.75rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                        >
                            <option value="ALL">All Status</option>
                            <option value="SUBMITTED">Submitted</option>
                            <option value="GRADED">Graded</option>
                        </select>
                    </div>
                </div>
            </div>

            <SubmissionsTable
                submissions={filteredSubmissions}
                totalMarks={assignment?.totalMarks}
                onGrade={handleGrade}
            />
        </div>
    );
};

export default AdminSubmissions;
