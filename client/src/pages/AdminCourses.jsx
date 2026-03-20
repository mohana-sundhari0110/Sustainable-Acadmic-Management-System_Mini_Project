import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Plus, Edit2, Trash2, BookOpen, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminCourses = () => {
    const [courses, setCourses] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingCourse, setEditingCourse] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        code: '',
        instructor: '',
        duration: '',
        description: '',
        category: 'General',
        status: 'Active'
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const res = await api.get('/admin/courses');
            setCourses(res.data);
        } catch (err) {
            console.error('Failed to fetch courses');
        }
    };

    const handleEdit = (course) => {
        setEditingCourse(course);
        setFormData({
            title: course.title,
            code: course.code,
            instructor: course.instructor,
            duration: course.duration,
            description: course.description,
            category: course.category || 'General',
            status: course.status || 'Active'
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic Validation
        if (!formData.title || !formData.code || !formData.instructor || !formData.duration) {
            alert('Please fill in all required fields');
            return;
        }

        const durationInt = parseInt(formData.duration);
        if (isNaN(durationInt) || durationInt <= 0) {
            alert('Duration must be a positive number of weeks');
            return;
        }

        setLoading(true);
        try {
            const payload = { ...formData, duration: durationInt };

            if (editingCourse) {
                const res = await api.put(`/admin/courses/${editingCourse.id}`, payload);
                setCourses(courses.map(c => c.id === editingCourse.id ? res.data : c));
            } else {
                const res = await api.post('/admin/courses', payload);
                setCourses([...courses, res.data]);
            }
            setShowModal(false);
            setEditingCourse(null);
            setFormData({ title: '', code: '', instructor: '', duration: '', description: '', category: 'General', status: 'Active' });
        } catch (err) {
            const errorMessage = err.response?.data?.error || (editingCourse ? 'Failed to update course' : 'Failed to create course');
            alert(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this course?')) {
            try {
                await api.delete(`/admin/courses/${id}`);
                setCourses(courses.filter(c => c.id !== id));
            } catch (err) {
                alert('Failed to delete course');
            }
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>Course Management</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Organize and manage sustainability curriculum</p>
                </div>
                <button
                    onClick={() => {
                        setEditingCourse(null);
                        setFormData({ title: '', code: '', instructor: '', duration: '', description: '', category: 'General', status: 'Active' });
                        setShowModal(true);
                    }}
                    className="primary"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem' }}
                >
                    <Plus size={18} /> Add New Course
                </button>
            </div>

            <div className="glass" style={{ borderRadius: '1.5rem', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-dark)' }}>
                        <tr>
                            <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.875rem' }}>COURSE INFO</th>
                            <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.875rem' }}>INSTRUCTOR</th>
                            <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.875rem' }}>DURATION</th>
                            <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.875rem' }}>STATUS</th>
                            <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.875rem', textAlign: 'right' }}>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {courses.length > 0 ? courses.map((course) => (
                            <tr key={course.id} style={{ borderBottom: '1px solid var(--border-dark)', transition: 'background 0.2s' }} className="table-row-hover">
                                <td style={{ padding: '1.25rem 1.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{ background: 'rgba(16, 185, 129, 0.1)', width: '40px', height: '40px', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                                            <BookOpen size={20} />
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{course.title}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{course.code} • {course.category}</div>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ padding: '1.25rem 1.5rem', color: 'var(--text-secondary)' }}>{course.instructor}</td>
                                <td style={{ padding: '1.25rem 1.5rem', color: 'var(--text-secondary)' }}>{course.duration} Weeks</td>
                                <td style={{ padding: '1.25rem 1.5rem' }}>
                                    <span style={{
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '2rem',
                                        fontSize: '0.75rem',
                                        fontWeight: 500,
                                        background: course.status === 'Active' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.05)',
                                        color: course.status === 'Active' ? '#10b981' : '#64748b'
                                    }}>
                                        {course.status}
                                    </span>
                                </td>
                                <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                        <button onClick={() => handleEdit(course)} style={{ background: 'rgba(51, 65, 85, 0.3)', padding: '0.5rem', borderRadius: '0.5rem', color: 'var(--text-primary)' }} className="card-hover"><Edit2 size={16} /></button>
                                        <button onClick={() => handleDelete(course.id)} style={{ background: 'rgba(239, 68, 68, 0.05)', padding: '0.5rem', borderRadius: '0.5rem', color: '#ef4444' }} className="card-hover"><Trash2 size={16} /></button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="5" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                    <BookOpen size={48} style={{ margin: '0 auto 1rem', opacity: 0.2 }} />
                                    <p>No courses available. Click Add New Course to create one.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1.5rem' }}>
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass" style={{ width: '100%', maxWidth: '600px', padding: '2.5rem', borderRadius: '2rem' }}>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '2rem' }}>{editingCourse ? 'Edit Course' : 'Create New Course'}</h3>
                        <form onSubmit={handleSubmit}>
                            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Course Title *</label>
                                    <input value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required placeholder="e.g. Sustainable Development" />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Course Code *</label>
                                    <input value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value })} required placeholder="SDB101" />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Instructor Name *</label>
                                    <input value={formData.instructor} onChange={e => setFormData({ ...formData, instructor: e.target.value })} required placeholder="Dr. Green" />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Duration (Weeks) *</label>
                                    <input type="number" value={formData.duration} onChange={e => setFormData({ ...formData, duration: e.target.value })} required placeholder="12" />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Category</label>
                                    <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-dark)', color: 'white' }}>
                                        <option value="General">General</option>
                                        <option value="Renewable Energy">Renewable Energy</option>
                                        <option value="Waste Management">Waste Management</option>
                                        <option value="Sustainable Cities">Sustainable Cities</option>
                                        <option value="Climate Action">Climate Action</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Status</label>
                                    <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-dark)', color: 'white' }}>
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ marginBottom: '2rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Description</label>
                                <textarea rows="3" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Brief overview of the course curriculum" />
                            </div>

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, background: 'transparent' }}>Cancel</button>
                                <button type="submit" className="primary" style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }} disabled={loading}>
                                    {loading && <Loader2 size={18} className="animate-spin" />}
                                    {editingCourse ? 'Save Changes' : 'Create Course'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default AdminCourses;
