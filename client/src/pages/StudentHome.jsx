import React, { useState, useEffect } from 'react';
import { Book, Calendar, Clock, Award, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../api/axios';
import { Link } from 'react-router-dom';

const StudentHome = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const res = await api.get('/admin/students/dashboard-info');
                setData(res.data);
                setLoading(false);
            } catch (error) {
                console.error('Failed to fetch dashboard data');
                setLoading(false);
            }
        };
        fetchDashboard();
    }, []);

    if (loading) return <div className="glass" style={{ padding: '2rem', borderRadius: '1.5rem' }}>Loading your student profile...</div>;
    if (!data || !data.student) return <div className="glass" style={{ padding: '2rem', borderRadius: '1.5rem' }}>Failed to load dashboard. Please ensure you are logged in correctly.</div>;

    const { student, enrollments, upcomingAssignments, schedules, bookings } = data;

    return (
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            {/* Top Section: Quick Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                <motion.div whileHover={{ y: -5 }} className="glass" style={{ padding: '1.5rem', borderRadius: '1.5rem', borderLeft: '4px solid var(--primary)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '0.75rem', borderRadius: '1rem' }}>
                            <Award color="var(--primary)" size={24} />
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 'bold' }}>Academic Achievement</span>
                    </div>
                    <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Average Score</h3>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '0.5rem 0' }}>{student.averageScore}</h2>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Based on your graded submissions and assessments.</p>
                </motion.div>

                <motion.div whileHover={{ y: -5 }} className="glass" style={{ padding: '1.5rem', borderRadius: '1.5rem', borderLeft: '4px solid #3b82f6' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '0.75rem', borderRadius: '1rem' }}>
                            <Book color="#3b82f6" size={24} />
                        </div>
                    </div>
                    <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Courses Enrolled</h3>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '0.5rem 0' }}>{enrollments.length}</h2>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Across {new Set(enrollments.map(e => e.course.category)).size} categories</p>
                </motion.div>

                <motion.div whileHover={{ y: -5 }} className="glass" style={{ padding: '1.5rem', borderRadius: '1.5rem', borderLeft: '4px solid #f59e0b' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '0.75rem', borderRadius: '1rem' }}>
                            <AlertCircle color="#f59e0b" size={24} />
                        </div>
                    </div>
                    <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Pending Deadlines</h3>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '0.5rem 0' }}>{upcomingAssignments.length}</h2>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Next deadline in {upcomingAssignments.length > 0 ? Math.ceil((new Date(upcomingAssignments[0].deadline) - new Date()) / (1000 * 60 * 60 * 24)) : 0} days</p>
                </motion.div>
            </div>

            {/* Main Content Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {/* Today's Schedule Section */}
                    <div className="glass" style={{ padding: '2rem', borderRadius: '2rem' }}>
                        <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <Calendar size={24} color="#3b82f6" /> Today's Schedule
                        </h2>
                        {schedules.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {schedules.map((s, i) => (
                                    <div key={i} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '1rem',
                                        padding: '1rem',
                                        background: 'rgba(255,255,255,0.03)',
                                        borderRadius: '1rem',
                                        border: '1px solid var(--border-dark)'
                                    }}>
                                        <div style={{
                                            background: 'rgba(59, 130, 246, 0.1)',
                                            padding: '0.75rem',
                                            borderRadius: '0.75rem',
                                            textAlign: 'center',
                                            minWidth: '70px'
                                        }}>
                                            <div style={{ fontSize: '0.7rem', color: '#3b82f6', fontWeight: 'bold' }}>START</div>
                                            <div style={{ fontWeight: 'bold' }}>{new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}</div>
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <h4 style={{ margin: 0 }}>{s.courseName}</h4>
                                            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Room {s.classroom.roomNumber} | {s.dayOfWeek}</p>
                                        </div>
                                        <Clock size={18} color="var(--text-secondary)" />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '1rem' }}>No classes scheduled for today.</p>
                        )}
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {/* Upcoming Assignments Sidebar */}
                    <div className="glass" style={{ padding: '2rem', borderRadius: '2rem' }}>
                        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Clock size={20} color="#f59e0b" /> Deadlines
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            {upcomingAssignments.length > 0 ? upcomingAssignments.map((a, i) => (
                                <div key={i} style={{ borderBottom: '1px solid var(--border-dark)', paddingBottom: '1rem' }}>
                                    <p style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                                        {new Date(a.deadline).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                    </p>
                                    <p style={{ fontWeight: '600', marginBottom: '0.25rem', fontSize: '0.9rem' }}>{a.title}</p>
                                    <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{a.course.title}</p>
                                </div>
                            )) : (
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>All caught up! No upcoming deadlines.</p>
                            )}
                        </div>
                        <Link to="/student/assignments" style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            marginTop: '1.5rem',
                            color: 'var(--primary)',
                            fontSize: '0.875rem',
                            textDecoration: 'none',
                            fontWeight: '600'
                        }}>
                            View All <ArrowRight size={14} />
                        </Link>
                    </div>

                    {/* Booking Status Card */}
                    <div className="glass" style={{ padding: '2rem', borderRadius: '2rem', background: 'linear-gradient(135deg, var(--primary) 0%, #065f46 100%)', color: 'white' }}>
                        <h3 style={{ marginBottom: '1rem', color: 'white' }}>Lab Bookings</h3>
                        {bookings.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div style={{ background: 'rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '1rem' }}>
                                    <p style={{ margin: 0, fontSize: '0.75rem', opacity: 0.8 }}>Latest Booking:</p>
                                    <p style={{ margin: '0.25rem 0', fontWeight: 'bold' }}>{bookings[0].equipment.name}</p>
                                    <div style={{
                                        display: 'inline-block',
                                        marginTop: '0.5rem',
                                        fontSize: '0.65rem',
                                        padding: '0.2rem 0.6rem',
                                        borderRadius: '1rem',
                                        background: bookings[0].status === 'APPROVED' ? 'var(--primary)' : 'rgba(255,255,255,0.2)',
                                        border: '1px solid rgba(255,255,255,0.3)'
                                    }}>
                                        {bookings[0].status}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <p style={{ opacity: 0.8, fontSize: '0.875rem' }}>Need special lab equipment? Book your slot now to start your next innovative project.</p>
                        )}
                        <Link to="/student/lab-booking" style={{
                            background: 'white',
                            color: 'var(--primary)',
                            width: '100%',
                            padding: '1rem',
                            borderRadius: '1rem',
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            marginTop: '1.5rem',
                            textDecoration: 'none'
                        }}>
                            Go to Lab <ArrowRight size={18} />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentHome;
