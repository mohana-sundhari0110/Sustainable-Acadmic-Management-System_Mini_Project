import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, Clock } from 'lucide-react';
import api from '../api/axios';

const StudentClassSchedules = () => {
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSchedules = async () => {
            try {
                const res = await api.get('/resources/schedules');
                setSchedules(res.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching schedules');
                setLoading(false);
            }
        };
        fetchSchedules();
    }, []);

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    if (loading) return <div className="glass" style={{ padding: '2rem', borderRadius: '1rem' }}>Loading schedules...</div>;

    return (
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Classroom Schedules</h2>
                <p style={{ color: 'var(--text-secondary)' }}>View your class timings and assigned sustainable classrooms.</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {days.map(day => {
                    const daySchedules = schedules.filter(s => s.dayOfWeek === day);
                    if (daySchedules.length === 0) return null;

                    return (
                        <div key={day}>
                            <h3 style={{
                                fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem',
                                display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)'
                            }}>
                                <Calendar size={18} /> {day}
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                                {daySchedules.map(schedule => (
                                    <div key={schedule.id} className="glass" style={{ padding: '1.25rem', borderRadius: '1rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                            <h4 style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{schedule.courseName}</h4>
                                            <div style={{ fontSize: '0.875rem', color: 'var(--primary)', fontWeight: '600' }}>
                                                {new Date(schedule.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                                <MapPin size={16} />
                                                <span>Room {schedule.classroom?.roomNumber} | {schedule.classroom?.building}</span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                                <Users size={16} />
                                                <span>Capacity Used: {schedule.studentsCount} / {schedule.classroom?.capacity}</span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                                <Clock size={16} />
                                                <span>Ends: {new Date(schedule.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                        </div>

                                        <div style={{
                                            marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-dark)',
                                            fontSize: '0.75rem', color: 'var(--primary)', fontStyle: 'italic'
                                        }}>
                                            * Optimized for energy efficiency based on room capacity.
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}

                {schedules.length === 0 && (
                    <div className="glass" style={{ padding: '3rem', borderRadius: '1rem', textAlign: 'center' }}>
                        <p style={{ color: 'var(--text-secondary)' }}>No class schedules available at the moment.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentClassSchedules;
