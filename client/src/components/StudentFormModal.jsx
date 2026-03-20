import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserPlus, Save, Loader2 } from 'lucide-react';

const StudentFormModal = ({ isOpen, onClose, onSubmit, student = null }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        registerNumber: '',
        department: '',
        year: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (student) {
            setFormData({
                name: student.name || '',
                email: student.email || '',
                registerNumber: student.registerNumber || '',
                department: student.department || '',
                year: student.year || '',
                password: '' // Don't pre-fill password
            });
        } else {
            setFormData({
                name: '',
                email: '',
                registerNumber: '',
                department: '',
                year: '',
                password: ''
            });
        }
        setErrors({});
    }, [student, isOpen]);

    if (!isOpen) return null;

    const validate = () => {
        const newErrors = {};
        if (!formData.name) newErrors.name = 'Name is required';
        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }
        if (!student) {
            if (!formData.registerNumber) newErrors.registerNumber = 'Register number is required';
            if (!formData.password) {
                newErrors.password = 'Password is required';
            } else if (formData.password.length < 6) {
                newErrors.password = 'Password must be at least 6 characters';
            }
        }
        if (!formData.department) newErrors.department = 'Department is required';
        if (!formData.year) newErrors.year = 'Year is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        try {
            await onSubmit(formData);
            onClose();
        } catch (err) {
            setErrors({ submit: err.response?.data?.error || 'Failed to save student' });
        } finally {
            setLoading(false);
        }
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
                        maxWidth: '500px',
                        padding: '2rem',
                        borderRadius: '1.5rem',
                        position: 'relative'
                    }}
                >
                    <button
                        onClick={onClose}
                        style={{
                            position: 'absolute',
                            top: '1rem',
                            right: '1rem',
                            background: 'transparent',
                            color: 'var(--text-secondary)'
                        }}
                    >
                        <X size={20} />
                    </button>

                    <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>
                        {student ? 'Edit Student Details' : 'Register New Student'}
                    </h2>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <label style={{ fontSize: '0.875rem', marginBottom: '0.4rem', display: 'block' }}>Full Name *</label>
                            <input
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Enter student name"
                                style={{ borderColor: errors.name ? 'var(--error)' : '' }}
                            />
                            {errors.name && <p style={{ color: 'var(--error)', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.name}</p>}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={{ fontSize: '0.875rem', marginBottom: '0.4rem', display: 'block' }}>Email ID *</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="email@sams.edu"
                                    disabled={!!student}
                                    style={{ borderColor: errors.email ? 'var(--error)' : '', opacity: student ? 0.6 : 1 }}
                                />
                                {errors.email && <p style={{ color: 'var(--error)', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.email}</p>}
                            </div>
                            <div>
                                <label style={{ fontSize: '0.875rem', marginBottom: '0.4rem', display: 'block' }}>Register No *</label>
                                <input
                                    value={formData.registerNumber}
                                    onChange={e => setFormData({ ...formData, registerNumber: e.target.value })}
                                    placeholder="e.g. 21CS101"
                                    disabled={!!student}
                                    style={{ borderColor: errors.registerNumber ? 'var(--error)' : '', opacity: student ? 0.6 : 1 }}
                                />
                                {errors.registerNumber && <p style={{ color: 'var(--error)', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.registerNumber}</p>}
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={{ fontSize: '0.875rem', marginBottom: '0.4rem', display: 'block', color: errors.department ? 'var(--error)' : 'inherit' }}>Department *</label>
                                <select
                                    value={formData.department}
                                    onChange={e => setFormData({ ...formData, department: e.target.value })}
                                    style={{ borderColor: errors.department ? 'var(--error)' : '' }}
                                >
                                    <option value="">Select Dept</option>
                                    <option value="Computer Science">Computer Science</option>
                                    <option value="Information Technology">Information Technology</option>
                                    <option value="Electronics">Electronics</option>
                                    <option value="Mechanical">Mechanical</option>
                                    <option value="Civil">Civil</option>
                                </select>
                                {errors.department && <p style={{ color: 'var(--error)', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.department}</p>}
                            </div>
                            <div>
                                <label style={{ fontSize: '0.875rem', marginBottom: '0.4rem', display: 'block', color: errors.year ? 'var(--error)' : 'inherit' }}>Academic Year *</label>
                                <select
                                    value={formData.year}
                                    onChange={e => setFormData({ ...formData, year: e.target.value })}
                                    style={{ borderColor: errors.year ? 'var(--error)' : '' }}
                                >
                                    <option value="">Select Year</option>
                                    <option value="1">1st Year</option>
                                    <option value="2">2nd Year</option>
                                    <option value="3">3rd Year</option>
                                    <option value="4">4th Year</option>
                                </select>
                                {errors.year && <p style={{ color: 'var(--error)', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.year}</p>}
                            </div>
                        </div>

                        {!student && (
                            <div>
                                <label style={{ fontSize: '0.875rem', marginBottom: '0.4rem', display: 'block' }}>Temporary Password *</label>
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    placeholder="At least 6 characters"
                                    style={{ borderColor: errors.password ? 'var(--error)' : '' }}
                                />
                                {errors.password && <p style={{ color: 'var(--error)', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.password}</p>}
                            </div>
                        )}

                        {errors.submit && <p style={{ color: 'var(--error)', fontSize: '0.875rem', textAlign: 'center' }}>{errors.submit}</p>}

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                            <button type="button" onClick={onClose} style={{ flex: 1, background: 'rgba(255,255,255,0.05)', padding: '0.75rem', borderRadius: '0.75rem' }}>Cancel</button>
                            <button type="submit" disabled={loading} className="primary" style={{ flex: 2, padding: '0.75rem', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                {loading ? <Loader2 size={18} className="animate-spin" /> : student ? <Save size={18} /> : <UserPlus size={18} />}
                                {student ? 'Update Student' : 'Create Student'}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default StudentFormModal;
