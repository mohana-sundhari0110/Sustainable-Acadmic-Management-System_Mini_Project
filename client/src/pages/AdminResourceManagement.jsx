import React, { useState, useEffect } from 'react';
import { Plus, Boxes, Calendar, ArrowRight, CheckCircle, XCircle } from 'lucide-react';
import api from '../api/axios';

const AdminResourceManagement = () => {
    const [activeTab, setActiveTab] = useState('classrooms');
    const [classrooms, setClassrooms] = useState([]);
    const [equipment, setEquipment] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [schedules, setSchedules] = useState([]);

    // Form states
    const [roomForm, setRoomForm] = useState({ roomNumber: '', capacity: '', building: '' });
    const [equipmentForm, setEquipmentForm] = useState({ name: '', category: '', description: '' });
    const [bookingForm, setBookingForm] = useState({ startTime: '', endTime: '' });
    const [selectedItem, setSelectedItem] = useState(null);
    const [scheduleForm, setScheduleForm] = useState({
        courseName: '',
        studentsCount: '',
        dayOfWeek: 'Monday',
        startTime: '',
        endTime: '',
        classroomId: ''
    });

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        try {
            const roomsRes = await api.get('/resources/classrooms').catch(() => ({ data: [] }));
            const equipRes = await api.get('/resources/equipment').catch(() => ({ data: [] }));
            const bookingsRes = await api.get('/resources/equipment/bookings').catch(() => ({ data: [] }));
            const schedulesRes = await api.get('/resources/schedules').catch(() => ({ data: [] }));

            setClassrooms(roomsRes.data);
            setEquipment(equipRes.data);
            setBookings(bookingsRes.data);
            setSchedules(schedulesRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const handleAddRoom = async (e) => {
        e.preventDefault();
        try {
            await api.post('/resources/classrooms', roomForm);
            setRoomForm({ roomNumber: '', capacity: '', building: '' });
            fetchData();
            alert('Room added successfully!');
        } catch (error) {
            alert('Error adding room: ' + (error.response?.data?.error || error.message || 'Unknown error'));
        }
    };

    const handleAddEquipment = async (e) => {
        e.preventDefault();
        try {
            await api.post('/resources/equipment', equipmentForm);
            setEquipmentForm({ name: '', category: '', description: '' });
            fetchData();
            alert('Equipment added successfully!');
        } catch (error) {
            alert('Error adding equipment: ' + (error.response?.data?.error || error.message || 'Unknown error'));
        }
    };

    const handleAddSchedule = async (e) => {
        e.preventDefault();
        try {
            await api.post('/resources/schedules', scheduleForm);
            setScheduleForm({ courseName: '', studentsCount: '', dayOfWeek: 'Monday', startTime: '', endTime: '', classroomId: '' });
            fetchData();
        } catch (error) {
            alert('Error creating schedule: ' + (error.response?.data?.error || 'Unknown error'));
        }
    };

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
            alert('Booking created successfully!');
        } catch (error) {
            alert('Booking failed: ' + (error.response?.data?.error || error.message || 'Unknown error'));
        }
    };

    const handleUpdateBooking = async (id, status) => {
        try {
            await api.patch(`/resources/equipment/bookings/${id}`, { status });
            fetchData();
        } catch (error) {
            alert('Error updating booking: ' + (error.response?.data?.error || error.message || 'Unknown error'));
        }
    };

    return (
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                {['classrooms', 'schedules', 'equipment', 'bookings'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className="glass"
                        style={{
                            padding: '0.75rem 1.5rem',
                            borderRadius: '0.75rem',
                            textTransform: 'capitalize',
                            color: activeTab === tab ? 'var(--primary)' : 'var(--text-secondary)',
                            borderBottom: activeTab === tab ? '2px solid var(--primary)' : '1px solid var(--border-dark)',
                            fontWeight: activeTab === tab ? '600' : '400'
                        }}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {activeTab === 'classrooms' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2rem' }}>
                    <div className="glass" style={{ padding: '1.5rem', borderRadius: '1rem' }}>
                        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Plus size={20} color="var(--primary)" /> Add Classroom
                        </h3>
                        <form onSubmit={handleAddRoom} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <input
                                placeholder="Room Number (e.g. 101)"
                                value={roomForm.roomNumber}
                                onChange={e => setRoomForm({ ...roomForm, roomNumber: e.target.value })}
                                required
                            />
                            <input
                                type="number"
                                placeholder="Capacity"
                                value={roomForm.capacity}
                                onChange={e => setRoomForm({ ...roomForm, capacity: e.target.value })}
                                required
                            />
                            <input
                                placeholder="Building"
                                value={roomForm.building}
                                onChange={e => setRoomForm({ ...roomForm, building: e.target.value })}
                                required
                            />
                            <button type="submit" className="primary" style={{ width: '100%' }}>Add Room</button>
                        </form>
                    </div>

                    <div className="glass" style={{ padding: '1.5rem', borderRadius: '1rem' }}>
                        <h3 style={{ marginBottom: '1.5rem' }}>Classroom List</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {classrooms.map(room => (
                                <div key={room.id} style={{
                                    display: 'flex', alignItems: 'center',
                                    padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '0.75rem',
                                    justifyContent: 'space-between'
                                }}>
                                    <div>
                                        <p style={{ fontWeight: '600' }}>Room {room.roomNumber}</p>
                                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{room.building} | Cap: {room.capacity}</p>
                                    </div>
                                    <div style={{
                                        padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.75rem',
                                        background: room.availability ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                        color: room.availability ? 'var(--primary)' : 'var(--error)'
                                    }}>
                                        {room.availability ? 'Available' : 'Restricted'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'schedules' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2rem' }}>
                    <div className="glass" style={{ padding: '1.5rem', borderRadius: '1rem' }}>
                        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Calendar size={20} color="var(--primary)" /> Smart Schedule
                        </h3>
                        <form onSubmit={handleAddSchedule} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <input
                                placeholder="Course Name"
                                value={scheduleForm.courseName}
                                onChange={e => setScheduleForm({ ...scheduleForm, courseName: e.target.value })}
                                required
                            />
                            <input
                                type="number"
                                placeholder="Est. Students Count"
                                value={scheduleForm.studentsCount}
                                onChange={e => setScheduleForm({ ...scheduleForm, studentsCount: e.target.value })}
                                required
                            />
                            <select
                                value={scheduleForm.dayOfWeek}
                                onChange={e => setScheduleForm({ ...scheduleForm, dayOfWeek: e.target.value })}
                            >
                                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(d => (
                                    <option key={d} value={d}>{d}</option>
                                ))}
                            </select>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Start Time</label>
                                    <input
                                        type="datetime-local"
                                        value={scheduleForm.startTime}
                                        onChange={e => setScheduleForm({ ...scheduleForm, startTime: e.target.value })}
                                        required
                                    />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>End Time</label>
                                    <input
                                        type="datetime-local"
                                        value={scheduleForm.endTime}
                                        onChange={e => setScheduleForm({ ...scheduleForm, endTime: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <select
                                value={scheduleForm.classroomId}
                                onChange={e => setScheduleForm({ ...scheduleForm, classroomId: e.target.value })}
                            >
                                <option value="">Auto-Allocate Suitable Room</option>
                                {classrooms.map(r => (
                                    <option key={r.id} value={r.id}>Room {r.roomNumber} (Cap: {r.capacity})</option>
                                ))}
                            </select>
                            <button type="submit" className="primary" style={{ width: '100%' }}>Create Schedule</button>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
                                * System will automatically pick the smallest room that fits.
                            </p>
                        </form>
                    </div>

                    <div className="glass" style={{ padding: '1.5rem', borderRadius: '1rem' }}>
                        <h3 style={{ marginBottom: '1.5rem' }}>Active Schedules</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {schedules.map(s => (
                                <div key={s.id} style={{
                                    padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '0.75rem',
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                }}>
                                    <div>
                                        <p style={{ fontWeight: '600' }}>{s.courseName}</p>
                                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                            {s.dayOfWeek} | {new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(s.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
                                            <ArrowRight size={16} /> Room {s.classroom?.roomNumber}
                                        </div>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Students: {s.studentsCount}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'equipment' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2rem' }}>
                    <div className="glass" style={{ padding: '1.5rem', borderRadius: '1rem' }}>
                        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Boxes size={20} color="var(--primary)" /> Add Lab Equipment
                        </h3>
                        <form onSubmit={handleAddEquipment} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <input
                                placeholder="Equipment Name"
                                value={equipmentForm.name}
                                onChange={e => setEquipmentForm({ ...equipmentForm, name: e.target.value })}
                                required
                            />
                            <select
                                value={equipmentForm.category}
                                onChange={e => setEquipmentForm({ ...equipmentForm, category: e.target.value })}
                                required
                            >
                                <option value="">Select Category</option>
                                <option value="3D Printer">3D Printer</option>
                                <option value="Robotics Kit">Robotics Kit</option>
                                <option value="Computer Lab">Computer Lab System</option>
                                <option value="Electronics">Electronics Toolkit</option>
                            </select>
                            <textarea
                                placeholder="Description (Optional)"
                                value={equipmentForm.description}
                                onChange={e => setEquipmentForm({ ...equipmentForm, description: e.target.value })}
                                rows={3}
                            />
                            <button type="submit" className="primary" style={{ width: '100%' }}>Register Equipment</button>
                        </form>
                    </div>

                    <div className="glass" style={{ padding: '1.5rem', borderRadius: '1rem' }}>
                        <h3 style={{ marginBottom: '1.5rem' }}>Equipment Registry</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
                            {equipment.map(item => (
                                <div key={item.id} style={{
                                    padding: '1.25rem', background: 'rgba(255,255,255,0.05)', borderRadius: '1rem',
                                    border: selectedItem?.id === item.id ? '2px solid var(--primary)' : '1px solid var(--border-dark)',
                                    transition: 'all 0.3s ease'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                                        <p style={{ fontWeight: '600', fontSize: '1.1rem' }}>{item.name}</p>
                                        <div style={{
                                            padding: '0.2rem 0.5rem', borderRadius: '0.5rem', fontSize: '0.7rem',
                                            background: item.status === 'Available' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                            color: item.status === 'Available' ? 'var(--primary)' : 'var(--error)'
                                        }}>
                                            {item.status}
                                        </div>
                                    </div>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--primary)', marginBottom: '1rem' }}>{item.category}</p>

                                    {selectedItem?.id === item.id ? (
                                        <form onSubmit={handleBooking} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                            <input
                                                type="datetime-local"
                                                required
                                                style={{ fontSize: '0.75rem', padding: '0.5rem' }}
                                                value={bookingForm.startTime}
                                                onChange={e => setBookingForm({ ...bookingForm, startTime: e.target.value })}
                                            />
                                            <input
                                                type="datetime-local"
                                                required
                                                style={{ fontSize: '0.75rem', padding: '0.5rem' }}
                                                value={bookingForm.endTime}
                                                onChange={e => setBookingForm({ ...bookingForm, endTime: e.target.value })}
                                            />
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button type="submit" className="primary" style={{ flex: 1, fontSize: '0.75rem', padding: '0.5rem' }}>Confirm</button>
                                                <button type="button" onClick={() => setSelectedItem(null)} style={{ flex: 1, fontSize: '0.75rem', padding: '0.5rem', background: 'rgba(255,255,255,0.1)' }}>Cancel</button>
                                            </div>
                                        </form>
                                    ) : (
                                        <button
                                            onClick={() => setSelectedItem(item)}
                                            style={{ width: '100%', padding: '0.5rem', borderRadius: '0.5rem', fontSize: '0.875rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--primary)' }}
                                            disabled={item.status !== 'Available'}
                                        >
                                            {item.status === 'Available' ? 'Book Now' : 'Currently Unavailable'}
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'bookings' && (
                <div className="glass" style={{ padding: '1.5rem', borderRadius: '1rem' }}>
                    <h3 style={{ marginBottom: '1.5rem' }}>Equipment Booking Requests</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {bookings.length === 0 ? <p style={{ color: 'var(--text-secondary)' }}>No booking requests found.</p> :
                            bookings.map(booking => (
                                <div key={booking.id} style={{
                                    padding: '1.25rem', background: 'rgba(255,255,255,0.05)', borderRadius: '1rem',
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                }}>
                                    <div>
                                        <p style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{booking.equipment?.name}</p>
                                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Requested by: {booking.student?.name} ({booking.student?.email})</p>
                                        <p style={{ fontSize: '0.875rem', color: 'var(--primary)' }}>
                                            Slot: {new Date(booking.startTime).toLocaleString()} - {new Date(booking.endTime).toLocaleTimeString()}
                                        </p>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        {booking.status === 'PENDING' ? (
                                            <>
                                                <button
                                                    onClick={() => handleUpdateBooking(booking.id, 'APPROVED')}
                                                    style={{ background: 'var(--primary)', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                                                >
                                                    <CheckCircle size={16} /> Approve
                                                </button>
                                                <button
                                                    onClick={() => handleUpdateBooking(booking.id, 'REJECTED')}
                                                    style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', padding: '0.5rem 1rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                                                >
                                                    <XCircle size={16} /> Reject
                                                </button>
                                            </>
                                        ) : (
                                            <div style={{
                                                padding: '0.5rem 1rem', borderRadius: '0.5rem', fontSize: '0.875rem', fontWeight: '600',
                                                background: booking.status === 'APPROVED' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                                color: booking.status === 'APPROVED' ? 'var(--primary)' : 'var(--error)'
                                            }}>
                                                {booking.status}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminResourceManagement;
