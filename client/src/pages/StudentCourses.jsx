import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Book, CheckCircle, Clock, PlusCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const StudentCourses = () => {
    const [courses, setCourses] = useState([]);
    const [enrolledIds, setEnrolledIds] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const [coursesRes, dashboardRes] = await Promise.all([
                api.get('/admin/courses'),
                api.get('/admin/students/dashboard-info')
            ]);
            setCourses(coursesRes.data);
            setEnrolledIds(dashboardRes.data.enrollments.map(e => e.courseId));
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch data');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleEnroll = async (courseId) => {
        try {
            await api.post('/admin/students/enroll', { courseId });
            alert('Successfully enrolled in course!');
            fetchData(); // Refresh data
        } catch (err) {
            console.error('Enrollment error details:', err.response?.data || err.message);
            const errorMessage = err.response?.data?.error || err.response?.data?.details || 'Failed to enroll';
            alert(errorMessage);
        }
    };

    if (loading) return <div className="glass" style={{ padding: '2rem', borderRadius: '1.5rem' }}>Loading courses...</div>;

    return (
        <div>
            <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Explore Courses</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Join sustainability courses to earn Green Points and track your academic progress.</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
                {courses.map((course) => {
                    const isEnrolled = enrolledIds.includes(course.id);
                    return (
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            key={course.id}
                            className="glass"
                            style={{ borderRadius: '1.5rem', overflow: 'hidden', border: isEnrolled ? '1px solid var(--primary)' : '1px solid var(--border-dark)' }}
                        >
                            <div style={{
                                height: '140px',
                                background: isEnrolled ? 'linear-gradient(45deg, var(--primary), #065f46)' : 'linear-gradient(45deg, #1f2937, #111827)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Book size={48} color="white" style={{ opacity: isEnrolled ? 1 : 0.5 }} />
                            </div>

                            <div style={{ padding: '2rem' }}>
                                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                                    <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', borderRadius: '0.5rem', background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}>{course.category}</span>
                                    <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', borderRadius: '0.5rem', background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}>{course.duration} Weeks</span>
                                </div>
                                <h3 style={{ marginBottom: '1rem' }}>{course.title}</h3>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '2rem', minHeight: '3.6rem' }}>
                                    {course.description}
                                </p>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    {isEnrolled ? (
                                        <>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontSize: '0.875rem', fontWeight: 'bold' }}>
                                                <CheckCircle size={16} />
                                                <span>Enrolled</span>
                                            </div>
                                            <button className="primary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>Continue</button>
                                        </>
                                    ) : (
                                        <>
                                            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Not joined yet</div>
                                            <button
                                                onClick={() => handleEnroll(course.id)}
                                                className="primary"
                                                style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                            >
                                                <PlusCircle size={16} /> Enroll Now
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    );
                })}

                {courses.length === 0 && (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', opacity: 0.5 }}>
                        <Clock size={48} style={{ margin: '0 auto 1rem' }} />
                        <p>No courses available at the moment. Please check back later.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentCourses;
