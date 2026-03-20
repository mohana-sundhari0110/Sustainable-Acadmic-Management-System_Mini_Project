import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Plus, Search, Filter, Loader2, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import AssignmentCard from '../components/AssignmentCard';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';

const AdminAssignments = () => {
    const navigate = useNavigate();
    const [assignments, setAssignments] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, assignment: null });
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('ALL');
    const [sortBy, setSortBy] = useState('newest');
    const [toast, setToast] = useState(null);

    const [newAssignment, setNewAssignment] = useState({
        title: '',
        courseId: '',
        deadline: '',
        type: 'upload',
        description: '',
        totalMarks: 0,
        timeLimit: '',
        questions: []
    });

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await Promise.all([fetchAssignments(), fetchCourses()]);
            setLoading(false);
        };
        loadData();
    }, []);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchAssignments = async () => {
        try {
            const coursesRes = await api.get('/admin/courses');
            const allAssignments = [];
            for (const course of coursesRes.data) {
                const res = await api.get(`/assignments/course/${course.id}`);
                // Fetch submission count for each assignment
                const assignmentsWithDetails = await Promise.all(res.data.map(async a => {
                    const subRes = await api.get(`/assignments/${a.id}/submissions`);
                    return { ...a, courseTitle: course.title, submissionCount: subRes.data.length };
                }));
                allAssignments.push(...assignmentsWithDetails);
            }
            setAssignments(allAssignments);
        } catch (err) {
            console.error('Failed to fetch assignments');
            showToast('Failed to load assignments', 'error');
        }
    };

    const fetchCourses = async () => {
        try {
            const res = await api.get('/admin/courses');
            setCourses(res.data);
        } catch (err) {
            console.error('Failed to fetch courses');
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...newAssignment,
                courseId: parseInt(newAssignment.courseId),
                totalMarks: parseInt(newAssignment.totalMarks),
                timeLimit: newAssignment.timeLimit ? parseInt(newAssignment.timeLimit) : null
            };
            await api.post('/assignments', payload);
            setShowModal(false);
            setNewAssignment({
                title: '',
                courseId: '',
                deadline: '',
                type: 'upload',
                description: '',
                totalMarks: 0,
                timeLimit: '',
                questions: []
            });
            fetchAssignments();
            showToast('Assignment published successfully!');
        } catch (err) {
            showToast('Failed to create assignment', 'error');
        }
    };

    const handleDelete = async () => {
        if (!deleteModal.assignment) return;
        try {
            await api.delete(`/assignments/${deleteModal.assignment.id}`);
            setAssignments(assignments.filter(a => a.id !== deleteModal.assignment.id));
            setDeleteModal({ isOpen: false, assignment: null });
            showToast('Assignment deleted successfully');
        } catch (err) {
            showToast('Failed to delete assignment', 'error');
        }
    };

    const filteredAssignments = assignments
        .filter(a => {
            const matchesSearch = a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                a.courseTitle.toLowerCase().includes(searchTerm.toLowerCase());
            const isExpired = new Date(a.deadline) < new Date();
            const matchesFilter = filterType === 'ALL' ||
                (filterType === 'ACTIVE' && !isExpired) ||
                (filterType === 'EXPIRED' && isExpired);
            return matchesSearch && matchesFilter;
        })
        .sort((a, b) => {
            if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
            if (sortBy === 'deadline') return new Date(a.deadline) - new Date(b.deadline);
            return 0;
        });

    return (
        <div style={{ padding: '1rem 2rem' }}>
            {/* Header section with search and filter */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
                <div>
                    <h2 style={{ fontSize: '2.25rem', fontWeight: 'bold', marginBottom: '0.5rem', background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Assignment Management
                    </h2>
                    <p style={{ color: '#94a3b8' }}>Create and manage academic assessments and quizzes.</p>
                </div>
                <button onClick={() => setShowModal(true)} className="primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.8rem 1.75rem', borderRadius: '1rem', fontWeight: 'bold', boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3)' }}>
                    <Plus size={20} /> Create Assignment
                </button>
            </div>

            {/* Toolbar */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem', background: 'rgba(255,255,255,0.02)', padding: '1.25rem', borderRadius: '1.25rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '300px' }}>
                    <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} size={18} />
                    <input
                        type="text"
                        placeholder="Search by title or course name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 3rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                    />
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Filter size={18} color="#64748b" />
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            style={{ padding: '0.75rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                        >
                            <option value="ALL">All Status</option>
                            <option value="ACTIVE">Active</option>
                            <option value="EXPIRED">Expired</option>
                        </select>
                    </div>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        style={{ padding: '0.75rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                    >
                        <option value="newest">Newest First</option>
                        <option value="deadline">Upcoming Deadline</option>
                    </select>
                </div>
            </div>

            {/* Content states */}
            {loading ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '2rem' }}>
                    {[1, 2, 3].map(i => (
                        <div key={i} className="glass" style={{ height: '300px', borderRadius: '1.25rem', animate: 'pulse 2s infinite' }} />
                    ))}
                </div>
            ) : filteredAssignments.length > 0 ? (
                <motion.div
                    layout
                    style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '2rem' }}
                >
                    <AnimatePresence>
                        {filteredAssignments.map((assignment) => (
                            <AssignmentCard
                                key={assignment.id}
                                assignment={assignment}
                                onSubmissions={(id) => navigate(`/admin/assignments/${id}/submissions`)}
                                onDelete={(a) => setDeleteModal({ isOpen: true, assignment: a })}
                            />
                        ))}
                    </AnimatePresence>
                </motion.div>
            ) : (
                <div style={{ textAlign: 'center', padding: '6rem 2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '2rem', border: '2px dashed rgba(255,255,255,0.05)' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>📋</div>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white', marginBottom: '0.5rem' }}>No assignments found</h3>
                    <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>{searchTerm ? "Try adjusting your search or filters" : "Get started by creating your first academic assessment."}</p>
                    {searchTerm && (
                        <button onClick={() => { setSearchTerm(''); setFilterType('ALL'); }} style={{ background: 'transparent', color: 'var(--primary)', border: 'none', cursor: 'pointer', fontWeight: '600' }}>
                            Clear all filters
                        </button>
                    )}
                </div>
            )}

            {/* Modals */}
            <DeleteConfirmationModal
                isOpen={deleteModal.isOpen}
                title={deleteModal.assignment?.title}
                onClose={() => setDeleteModal({ isOpen: false, assignment: null })}
                onConfirm={handleDelete}
            />

            {/* Toast Notification */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, x: '-50%' }}
                        animate={{ opacity: 1, y: 0, x: '-50%' }}
                        exit={{ opacity: 0, y: 20, x: '-50%' }}
                        style={{
                            position: 'fixed',
                            bottom: '2rem',
                            left: '50%',
                            background: toast.type === 'error' ? '#7f1d1d' : '#064e3b',
                            color: toast.type === 'error' ? '#fca5a5' : '#6ee7b7',
                            padding: '1rem 2rem',
                            borderRadius: '1rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            zIndex: 3000,
                            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
                            border: `1px solid ${toast.type === 'error' ? '#ef4444' : '#10b981'}`
                        }}
                    >
                        {toast.type === 'error' ? <XCircle size={20} /> : <CheckCircle2 size={20} />}
                        <span style={{ fontWeight: '600' }}>{toast.message}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Assignment Creation Modal - Simplified for brevity but kept functional */}
            {showModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass" style={{ width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', padding: '2.5rem', borderRadius: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <h3 style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>Create New Assessment</h3>
                            <button onClick={() => setShowModal(false)} style={{ background: 'transparent', color: '#94a3b8', border: 'none' }}><AlertCircle /></button>
                        </div>
                        <form onSubmit={handleCreate}>
                            {/* Form fields same as before but using the state */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Type</label>
                                    <select style={{ width: '100%', padding: '0.8rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }} value={newAssignment.type} onChange={e => setNewAssignment({ ...newAssignment, type: e.target.value })}>
                                        <option value="upload">File Upload</option>
                                        <option value="quiz">Interactive Quiz</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Course</label>
                                    <select style={{ width: '100%', padding: '0.8rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }} value={newAssignment.courseId} onChange={e => setNewAssignment({ ...newAssignment, courseId: e.target.value })} required>
                                        <option value="">Select course...</option>
                                        {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Title</label>
                                <input style={{ width: '100%', padding: '0.8rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }} value={newAssignment.title} onChange={e => setNewAssignment({ ...newAssignment, title: e.target.value })} required />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Total Marks</label>
                                    <input type="number" style={{ width: '100%', padding: '0.8rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }} value={newAssignment.totalMarks} onChange={e => setNewAssignment({ ...newAssignment, totalMarks: e.target.value })} required />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Deadline</label>
                                    <input type="date" style={{ width: '100%', padding: '0.8rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }} value={newAssignment.deadline} onChange={e => setNewAssignment({ ...newAssignment, deadline: e.target.value })} required />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: '1rem', borderRadius: '1rem', background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white' }}>Cancel</button>
                                <button type="submit" className="primary" style={{ flex: 2, padding: '1rem', borderRadius: '1rem', fontWeight: 'bold' }}>Publish</button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default AdminAssignments;
