import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, UserPlus, Search, Edit3, Trash2, Loader2, AlertCircle, XCircle, CheckCircle2 } from 'lucide-react';
import StudentFormModal from '../components/StudentFormModal';

const Toast = ({ message, type }) => (
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
            boxShadow: '0 10px 15px -12px rgba(0, 0, 0, 0.5)',
            zIndex: 2000
        }}
    >
        {type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
        {message}
    </motion.div>
);

const AdminStudents = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [toast, setToast] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const res = await api.get('/admin/students');
            setStudents(res.data);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.error || 'Could not connect to the database. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddEdit = async (formData) => {
        try {
            if (selectedStudent) {
                const res = await api.put(`/admin/students/${selectedStudent.id}`, formData);
                setStudents(prev => prev.map(s => s.id === selectedStudent.id ? res.data : s));
                setToast({ message: 'Student updated successfully', type: 'success' });
            } else {
                const res = await api.post('/admin/students', formData);
                setStudents(prev => [res.data, ...prev]);
                setToast({ message: 'Student created successfully', type: 'success' });
            }
            setTimeout(() => setToast(null), 3000);
        } catch (err) {
            throw err; // Form modal handles error display
        }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/admin/students/${id}`);
            setStudents(prev => prev.filter(s => s.id !== id));
            setToast({ message: 'Student deleted successfully', type: 'success' });
            setShowDeleteConfirm(null);
            setTimeout(() => setToast(null), 3000);
        } catch (err) {
            setToast({ message: 'Failed to delete student', type: 'error' });
            setTimeout(() => setToast(null), 3000);
        }
    };

    const filteredStudents = students.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.registerNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>Student Management</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>Manage and monitor registered students in the system.</p>
                </div>
                <button
                    onClick={() => { setSelectedStudent(null); setIsModalOpen(true); }}
                    className="primary"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}
                >
                    <UserPlus size={20} />
                    Add Student
                </button>
            </header>

            <div className="glass" style={{ padding: '1.5rem', borderRadius: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ position: 'relative' }}>
                    <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} size={18} />
                    <input
                        type="text"
                        placeholder="Search by name, email or register number..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ paddingLeft: '3rem', width: '100%' }}
                    />
                </div>
            </div>

            {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5rem' }}>
                    <Loader2 className="animate-spin" size={40} color="var(--primary)" />
                    <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Loading student database...</p>
                </div>
            ) : error ? (
                <div style={{ textAlign: 'center', padding: '4rem', opacity: 0.7 }}>
                    <AlertCircle size={48} color="#ef4444" style={{ margin: '0 auto 1.5rem' }} />
                    <p>{error}</p>
                    <button onClick={fetchStudents} style={{ marginTop: '1rem', background: 'transparent', color: 'var(--primary)', border: '1px solid var(--primary)' }}>Retry</button>
                </div>
            ) : filteredStudents.length === 0 ? (
                <div className="glass" style={{ textAlign: 'center', padding: '5rem', borderRadius: '2rem', opacity: 0.7 }}>
                    <Users size={48} style={{ margin: '0 auto 1.5rem', color: 'var(--text-secondary)' }} />
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No Students Found</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>Register a student or adjust your search filter.</p>
                </div>
            ) : (
                <div className="glass" style={{ borderRadius: '1.5rem', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border-dark)' }}>
                                <th style={{ textAlign: 'left', padding: '1.25rem 1.5rem', fontSize: '0.875rem' }}>Name & Email</th>
                                <th style={{ textAlign: 'left', padding: '1.25rem 1.5rem', fontSize: '0.875rem' }}>Register No</th>
                                <th style={{ textAlign: 'left', padding: '1.25rem 1.5rem', fontSize: '0.875rem' }}>Dept & Year</th>
                                <th style={{ textAlign: 'right', padding: '1.25rem 1.5rem', fontSize: '0.875rem' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStudents.map((student) => (
                                <tr key={student.id} style={{ borderBottom: '1px solid var(--border-dark)', transition: 'background 0.2s' }}>
                                    <td style={{ padding: '1.25rem 1.5rem' }}>
                                        <div style={{ fontWeight: '600' }}>{student.name}</div>
                                        <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{student.email}</div>
                                    </td>
                                    <td style={{ padding: '1.25rem 1.5rem' }}>
                                        <span style={{ fontSize: '0.875rem', background: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa', padding: '0.25rem 0.6rem', borderRadius: '0.5rem' }}>
                                            {student.registerNumber || 'N/A'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1.25rem 1.5rem' }}>
                                        <div style={{ fontSize: '0.875rem' }}>{student.department || 'N/A'}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{student.year ? `${student.year} Year` : 'N/A'}</div>
                                    </td>
                                    <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                            <button
                                                onClick={() => { setSelectedStudent(student); setIsModalOpen(true); }}
                                                className="glass"
                                                style={{ padding: '0.6rem', borderRadius: '0.75rem', color: 'var(--primary)' }}
                                            >
                                                <Edit3 size={18} />
                                            </button>
                                            <button
                                                onClick={() => setShowDeleteConfirm(student)}
                                                className="glass"
                                                style={{ padding: '0.6rem', borderRadius: '0.75rem', color: '#ef4444' }}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <StudentFormModal
                isOpen={isModalOpen}
                student={selectedStudent}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleAddEdit}
            />

            <AnimatePresence>
                {showDeleteConfirm && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="glass" style={{ padding: '2.5rem', borderRadius: '2rem', maxWidth: '400px', textAlign: 'center' }}>
                            <XCircle size={48} color="#ef4444" style={{ margin: '0 auto 1.5rem' }} />
                            <h3>Confirm Deletion</h3>
                            <p style={{ color: 'var(--text-secondary)', margin: '1rem 0 2rem' }}>
                                Are you sure you want to delete <strong>{showDeleteConfirm.name}</strong>? This action cannot be undone.
                            </p>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button onClick={() => setShowDeleteConfirm(null)} style={{ flex: 1, background: 'rgba(255,255,255,0.05)', padding: '0.75rem', borderRadius: '0.75rem' }}>Cancel</button>
                                <button onClick={() => handleDelete(showDeleteConfirm.id)} style={{ flex: 1, background: '#ef4444', color: 'white', padding: '0.75rem', borderRadius: '0.75rem', fontWeight: 'bold' }}>Delete</button>
                            </div>
                        </motion.div>
                    </div>
                )}
                {toast && <Toast {...toast} />}
            </AnimatePresence>
        </div>
    );
};

export default AdminStudents;
