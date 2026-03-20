import React, { useState, useEffect } from 'react';
import { Zap, AlertTriangle, BarChart3, TrendingDown, ClipboardList, Trash2 } from 'lucide-react';
import api from '../api/axios';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const AdminEnergyMonitor = () => {
    const [stats, setStats] = useState({
        totalConsumption: 0,
        trend: 0,
        facilityStats: [],
        dailyStats: [],
        recentRecords: []
    });
    const [classrooms, setClassrooms] = useState([]);
    const [recordForm, setRecordForm] = useState({ classroomId: '', labName: '', consumption: '' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
        fetchClassrooms();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await api.get('/energy/dashboard-stats');
            setStats(res.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching energy stats');
        }
    };

    const fetchClassrooms = async () => {
        try {
            const res = await api.get('/resources/classrooms');
            setClassrooms(res.data);
        } catch (error) {
            console.error('Error fetching classrooms');
        }
    };

    const handleRecordSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/energy/record', recordForm);
            setRecordForm({ classroomId: '', labName: '', consumption: '' });
            fetchStats();
            alert('Energy usage recorded successfully');
        } catch (error) {
            alert('Error recording energy usage');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this record?')) {
            try {
                await api.delete(`/energy/${id}`);
                fetchStats();
            } catch (error) {
                alert('Error deleting energy record');
            }
        }
    };

    if (loading) return <div className="glass" style={{ padding: '2rem', borderRadius: '1rem' }}>Loading health stats...</div>;

    const highConsumptionThreshold = 100; // kWh

    return (
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            {/* Header Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="glass" style={{ padding: '1.5rem', borderRadius: '1rem', borderLeft: '4px solid var(--primary)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Smart Total (7 Days)</p>
                        <Zap size={20} color="var(--primary)" />
                    </div>
                    <h2 style={{ fontSize: '2rem', margin: '0.5rem 0' }}>{stats.totalConsumption.toFixed(2)} <span style={{ fontSize: '1rem' }}>kWh</span></h2>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Calculated from schedules & bookings</p>
                </div>

                <div className="glass" style={{ padding: '1.5rem', borderRadius: '1rem', borderLeft: '4px solid #f59e0b' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Most Consuming</p>
                        <BarChart3 size={20} color="#f59e0b" />
                    </div>
                    <h2 style={{ fontSize: '1.5rem', margin: '0.5rem 0' }}>{stats.facilityStats[0]?.name || 'N/A'}</h2>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{stats.facilityStats[0]?.consumption.toFixed(1)} kWh total</p>
                </div>

                <div className="glass" style={{ padding: '1.5rem', borderRadius: '1rem', borderLeft: '4px solid var(--error)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>High Usage Alerts</p>
                        <AlertTriangle size={20} color="var(--error)" />
                    </div>
                    <h2 style={{ fontSize: '2rem', margin: '0.5rem 0' }}>{stats.facilityStats.filter(f => f.consumption > highConsumptionThreshold).length}</h2>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Facilities exceeding optimal limit</p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
                <div>
                    {/* Consumption by Facility with Status Badges */}
                    <div className="glass" style={{ padding: '1.5rem', borderRadius: '1rem', marginBottom: '2rem' }}>
                        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <TrendingDown size={20} color="var(--primary)" /> Consumption by Facility
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            {stats.facilityStats.map((f, i) => (
                                <div key={i}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <span style={{ fontWeight: '600' }}>{f.name}</span>
                                            <span style={{
                                                fontSize: '0.7rem',
                                                padding: '0.15rem 0.5rem',
                                                borderRadius: '1rem',
                                                background: f.consumption > highConsumptionThreshold ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                                color: f.consumption > highConsumptionThreshold ? 'var(--error)' : 'var(--primary)',
                                                border: `1px solid ${f.consumption > highConsumptionThreshold ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)'}`
                                            }}>
                                                {f.consumption > highConsumptionThreshold ? 'High Usage' : 'Optimal'}
                                            </span>
                                        </div>
                                        <span style={{ fontWeight: '600', color: 'var(--text-secondary)' }}>{f.consumption.toFixed(1)} kWh</span>
                                    </div>
                                    <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                                        <div style={{
                                            width: `${Math.min((f.consumption / Math.max(...stats.facilityStats.map(x => x.consumption))) * 100, 100)}%`,
                                            height: '100%',
                                            background: f.consumption > highConsumptionThreshold ? 'var(--error)' : 'var(--primary)',
                                            transition: 'width 1s ease-in-out'
                                        }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Real Data Trend Chart */}
                    <div className="glass" style={{ padding: '1.5rem', borderRadius: '1rem', marginBottom: '2rem' }}>
                        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <TrendingDown size={20} color="var(--primary)" /> 7-Day Consumption Trend
                        </h3>
                        <div style={{ height: '300px', width: '100%' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stats.dailyStats}>
                                    <defs>
                                        <linearGradient id="colorCons" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                                    <XAxis
                                        dataKey="date"
                                        stroke="var(--text-secondary)"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        stroke="var(--text-secondary)"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => `${value}kWh`}
                                    />
                                    <Tooltip
                                        contentStyle={{ background: '#1e293b', border: '1px solid var(--border-dark)', borderRadius: '0.5rem' }}
                                        labelStyle={{ color: 'var(--primary)', marginBottom: '0.25rem' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="consumption"
                                        stroke="var(--primary)"
                                        fillOpacity={1}
                                        fill="url(#colorCons)"
                                        strokeWidth={3}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Suggestions */}
                    <div className="glass" style={{ padding: '1.5rem', borderRadius: '1rem' }}>
                        <h3 style={{ marginBottom: '1.5rem' }}>Sustainability Suggestions</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {stats.facilityStats.length > 0 && stats.facilityStats[0].consumption > 20 ? (
                                <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '0.75rem', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                                    <p style={{ fontWeight: '600', color: 'var(--primary)' }}>Optimize {stats.facilityStats[0].name}</p>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                        This area accounts for {((stats.facilityStats[0].consumption / stats.totalConsumption) * 100).toFixed(0)}% of recent usage.
                                        Check for high-draw equipment left on overnight.
                                    </p>
                                </div>
                            ) : (
                                <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '0.75rem', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                                    <p style={{ fontWeight: '600', color: 'var(--primary)' }}>Maintain Current Efficiency</p>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                        Energy consumption is stable. Keep promoting "lights off" policies during empty hours.
                                    </p>
                                </div>
                            )}
                            <div style={{ padding: '1rem', background: 'rgba(59, 130, 246, 0.05)', borderRadius: '0.75rem', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                                <p style={{ fontWeight: '600', color: '#3b82f6' }}>General Energy Policy</p>
                                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                    Current records show {stats.facilityStats.length} monitored areas.
                                    Ensuring all {stats.facilityStats.filter(f => f.consumption > highConsumptionThreshold).length > 0 ? 'alert' : 'monitored'} labs have automated sensors could save 12% monthly.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div>
                    {/* Record Data Form */}
                    <div className="glass" style={{ padding: '1.5rem', borderRadius: '1rem', marginBottom: '2rem' }}>
                        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <ClipboardList size={20} color="var(--primary)" /> Record Usage
                        </h3>
                        <form onSubmit={handleRecordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Classroom (Optional)</label>
                                <select
                                    value={recordForm.classroomId}
                                    onChange={e => setRecordForm({ ...recordForm, classroomId: e.target.value })}
                                >
                                    <option value="">Select Classroom</option>
                                    {classrooms.map(r => <option key={r.id} value={r.id}>Room {r.roomNumber}</option>)}
                                </select>
                            </div>
                            <div style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>- OR -</div>
                            <div>
                                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Lab/Area Name</label>
                                <input
                                    placeholder="e.g. Advanced Robotics Lab"
                                    value={recordForm.labName}
                                    onChange={e => setRecordForm({ ...recordForm, labName: e.target.value })}
                                    disabled={recordForm.classroomId !== ''}
                                />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Energy Consumption (kWh)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={recordForm.consumption}
                                    onChange={e => setRecordForm({ ...recordForm, consumption: e.target.value })}
                                    required
                                />
                            </div>
                            <button type="submit" className="primary" style={{ width: '100%', marginTop: '0.5rem' }}>Submit Record</button>
                        </form>
                    </div>

                    {/* Recent Records */}
                    <div className="glass" style={{ padding: '1.5rem', borderRadius: '1rem' }}>
                        <h3 style={{ marginBottom: '1.5rem' }}>Recent Records</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {stats.recentRecords.map((r, i) => (
                                <div key={i} style={{ paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-dark)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <p style={{ fontSize: '0.875rem', fontWeight: '600' }}>{r.classroom ? `Room ${r.classroom.roomNumber}` : r.labName}</p>
                                            {r.isAutomated && (
                                                <span style={{
                                                    fontSize: '0.65rem',
                                                    background: 'rgba(59, 130, 246, 0.1)',
                                                    color: '#3b82f6',
                                                    padding: '0.1rem 0.4rem',
                                                    borderRadius: '4px',
                                                    border: '1px solid rgba(59, 130, 246, 0.2)'
                                                }}>Smart</span>
                                            )}
                                        </div>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{new Date(r.date).toLocaleDateString()}</p>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <p style={{ fontWeight: '700', color: 'var(--primary)' }}>{r.consumption} kWh</p>
                                        {!r.isAutomated && (
                                            <button
                                                onClick={() => handleDelete(r.id)}
                                                style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    color: 'var(--error)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    padding: '0.25rem'
                                                }}
                                                title="Delete Record"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminEnergyMonitor;
