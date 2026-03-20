import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Boxes, CheckCircle2, History } from 'lucide-react';
import api from '../api/axios';

const StudentLabBooking = () => {
    const [equipment, setEquipment] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [bookingForm, setBookingForm] = useState({ startTime: '', endTime: '' });

    const fetchData = async () => {
        try {
            const [equipRes, bookingsRes] = await Promise.all([
                api.get('/resources/equipment'),
                api.get('/resources/equipment/bookings')
            ]);
            setEquipment(equipRes.data);
            setBookings(bookingsRes.data);
        } catch (error) {
            console.error('Error fetching data');
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleBooking = async (e) => {
        e.preventDefault();
        try {
            await api.post('/resources/equipment/book', {
                equipmentId: selectedItem.id,
                ...bookingForm
            });
            setSelectedItem(null);
            setBookingForm({ startTime: '', endTime: '' });
            fetchData();
            alert('Booking request submitted successfully!');
        } catch (error) {
            alert('Booking failed: ' + (error.response?.data?.error || 'Unknown error'));
        }
    };

    return (
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
                <div>
                    <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Boxes size={22} color="var(--primary)" /> Available Lab Equipment
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                        {equipment.map(item => (
                            <div key={item.id} className="glass" style={{
                                padding: '1.5rem', borderRadius: '1rem',
                                border: selectedItem?.id === item.id ? '2px solid var(--primary)' : '1px solid var(--border-dark)',
                                transition: 'transform 0.2s', cursor: 'pointer'
                            }} onClick={() => setSelectedItem(item)}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                    <h4 style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{item.name}</h4>
                                    <div style={{
                                        padding: '0.25rem 0.5rem', borderRadius: '1rem', fontSize: '0.7rem',
                                        background: item.status === 'Available' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                        color: item.status === 'Available' ? 'var(--primary)' : 'var(--error)'
                                    }}>
                                        {item.status}
                                    </div>
                                </div>
                                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>{item.description || 'No description provided.'}</p>
                                <p style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: '600' }}>#{item.category}</p>
                            </div>
                        ))}
                    </div>

                    <h3 style={{ marginTop: '3rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <History size={22} color="var(--primary)" /> My Booking History
                    </h3>
                    <div className="glass" style={{ borderRadius: '1rem', overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead style={{ background: 'rgba(255,255,255,0.05)' }}>
                                <tr>
                                    <th style={{ textAlign: 'left', padding: '1rem' }}>Equipment</th>
                                    <th style={{ textAlign: 'left', padding: '1rem' }}>Time Slot</th>
                                    <th style={{ textAlign: 'left', padding: '1rem' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bookings.map(b => (
                                    <tr key={b.id} style={{ borderTop: '1px solid var(--border-dark)' }}>
                                        <td style={{ padding: '1rem' }}>{b.equipment?.name}</td>
                                        <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                                            {new Date(b.startTime).toLocaleDateString()} <br />
                                            <span style={{ color: 'var(--text-secondary)' }}>
                                                {new Date(b.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(b.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{
                                                fontSize: '0.75rem', fontWeight: 'bold', padding: '0.25rem 0.5rem', borderRadius: '0.5rem',
                                                background: b.status === 'APPROVED' ? 'rgba(16, 185, 129, 0.1)' : b.status === 'PENDING' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                                color: b.status === 'APPROVED' ? 'var(--primary)' : b.status === 'PENDING' ? '#f59e0b' : 'var(--error)'
                                            }}>
                                                {b.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {bookings.length === 0 && <tr><td colSpan="3" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No bookings yet.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div>
                    <div className="glass" style={{ padding: '2rem', borderRadius: '1.5rem', position: 'sticky', top: '2rem' }}>
                        {selectedItem ? (
                            <>
                                <h3 style={{ marginBottom: '0.5rem' }}>Book {selectedItem.name}</h3>
                                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Selected Resource: {selectedItem.category}</p>

                                <form onSubmit={handleBooking} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    <div>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                            <Calendar size={16} /> From
                                        </label>
                                        <input
                                            type="datetime-local"
                                            required
                                            value={bookingForm.startTime}
                                            onChange={e => setBookingForm({ ...bookingForm, startTime: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                            <Clock size={16} /> To
                                        </label>
                                        <input
                                            type="datetime-local"
                                            required
                                            value={bookingForm.endTime}
                                            onChange={e => setBookingForm({ ...bookingForm, endTime: e.target.value })}
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="primary"
                                        style={{ width: '100%', padding: '1rem', fontSize: '1rem' }}
                                        disabled={selectedItem.status !== 'Available'}
                                    >
                                        {selectedItem.status === 'Available' ? 'Confirm Reservation' : 'Currently Unavailable'}
                                    </button>
                                    <button type="button" onClick={() => setSelectedItem(null)} style={{ background: 'transparent', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                                        Cancel
                                    </button>
                                </form>
                            </>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '2rem' }}>
                                <Boxes size={48} color="var(--border-dark)" style={{ marginBottom: '1rem' }} />
                                <h4 style={{ color: 'var(--text-secondary)' }}>Select an item to book</h4>
                                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Browse the inventory on the left and choose a resource to see availability.</p>
                            </div>
                        )}

                        <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '1rem', border: '1px dashed var(--primary)' }}>
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <CheckCircle2 size={24} color="var(--primary)" />
                                <div>
                                    <p style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--primary)' }}>Sustainability Tip</p>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Turn off all equipment and lab systems after use to help us reach our net-zero campus goal!</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentLabBooking;
