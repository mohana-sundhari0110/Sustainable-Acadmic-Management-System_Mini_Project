import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import {
    Users, BookOpen, Lightbulb, TrendingUp, Loader2,
    Droplets, Wind, Trash2, Zap, ArrowUpRight, Activity as ActivityIcon
} from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';
import { motion } from 'framer-motion';

const AdminHome = () => {
    const [stats, setStats] = useState(null);
    const [analytics, setAnalytics] = useState(null);
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterRange, setFilterRange] = useState('all');

    const fetchData = async (range) => {
        try {
            const [statsRes, analyticsRes, activityRes] = await Promise.all([
                api.get('/admin/dashboard/stats'),
                api.get(`/admin/dashboard/analytics?range=${range}`),
                api.get('/admin/dashboard/activity')
            ]);
            setStats(statsRes.data);
            setAnalytics(analyticsRes.data);
            setActivities(activityRes.data);
        } catch (err) {
            console.error('Failed to fetch dashboard data', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(filterRange);
    }, [filterRange]);

    const statCards = [
        { label: 'Total Students', value: stats?.students || '0', icon: <Users size={20} />, color: '#3b82f6', category: 'General' },
        { label: 'Sustainability Courses', value: stats?.courses || '0', icon: <BookOpen size={20} />, color: '#10b981', category: 'Academic' },
        { label: 'Innovation Ideas', value: stats?.innovations || '0', icon: <Lightbulb size={20} />, color: '#f59e0b', category: 'Innovation' },
        { label: 'Funded Projects', value: stats?.funded || '0', icon: <TrendingUp size={20} />, color: '#8b5cf6', category: 'Investment' },
    ];

    const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'];

    const getInsight = () => {
        if (!analytics?.categories || analytics.categories.length === 0) return "No data available yet.";
        const top = [...analytics.categories].sort((a, b) => b.value - a.value)[0];
        return `📊 Insight: ${top.name} is the most popular sustainability focus ${filterRange === 'all' ? 'overall' : filterRange === '30days' ? 'this month' : 'this week'}.`;
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
                <Loader2 size={48} className="animate-spin" color="var(--primary)" />
                <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Gathering sustainability insights...</p>
            </div>
        );
    }

    return (
        <div style={{ paddingBottom: '3rem' }}>
            {/* Header / Top Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                {statCards.map((stat, i) => (
                    <div key={i} className="glass card-hover" style={{ padding: '1.5rem', borderRadius: '1.25rem', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: stat.color }}></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                            <div style={{ background: `${stat.color}15`, padding: '0.75rem', borderRadius: '0.75rem', color: stat.color }}>
                                {stat.icon}
                            </div>
                            <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-secondary)' }}>{stat.category.toUpperCase()}</span>
                        </div>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>{stat.label}</p>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                            <h3 style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>{stat.value}</h3>
                            <span style={{ fontSize: '0.75rem', color: '#10b981', display: 'flex', alignItems: 'center' }}>
                                <ArrowUpRight size={12} /> Live
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Charts Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                {/* Weekly Trend */}
                <div className="glass" style={{ padding: '1.5rem', borderRadius: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.125rem' }}>Innovation Trend</h3>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', padding: '0.25rem 0.50rem', border: '1px solid var(--border-dark)', borderRadius: '0.5rem' }}>Weekly</div>
                    </div>
                    <div style={{ width: '100%', height: '300px' }}>
                        <ResponsiveContainer>
                            <LineChart data={analytics?.trend || []}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '1rem', color: 'white' }}
                                    itemStyle={{ color: 'var(--primary)' }}
                                />
                                <Line type="monotone" dataKey="count" stroke="var(--primary)" strokeWidth={3} dot={{ fill: 'var(--primary)', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* REDESIGNED Category Distribution */}
                <div className="glass" style={{ padding: '2rem', borderRadius: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                        <div>
                            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>Category Distribution</h3>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Track sustainability innovation focus areas</p>
                        </div>
                        <select
                            value={filterRange}
                            onChange={(e) => setFilterRange(e.target.value)}
                            style={{
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid var(--border-dark)',
                                borderRadius: '0.75rem',
                                padding: '0.5rem 1rem',
                                color: 'white',
                                fontSize: '0.875rem'
                            }}
                        >
                            <option value="all">All Time</option>
                            <option value="30days">Last 30 Days</option>
                            <option value="7days">Last 7 Days</option>
                        </select>
                    </div>

                    {analytics?.categories?.length === 1 ? (
                        <div style={{ textAlign: 'center', padding: '3rem', opacity: 0.8 }}>
                            <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '1rem', borderRadius: '1rem', display: 'inline-block', marginBottom: '1rem' }}>
                                <TrendingUp size={32} />
                            </div>
                            <h4>Only 1 category available</h4>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.5rem' }}>Encourage students to diversify sustainability ideas.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '2rem', alignItems: 'center' }}>
                            <div style={{ position: 'relative', height: '240px' }}>
                                <ResponsiveContainer>
                                    <PieChart>
                                        <Pie
                                            data={analytics?.categories || []}
                                            innerRadius={70}
                                            outerRadius={95}
                                            paddingAngle={8}
                                            dataKey="value"
                                            animationBegin={0}
                                            animationDuration={1500}
                                        >
                                            {(analytics?.categories || []).map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            content={({ active, payload }) => {
                                                if (active && payload && payload.length) {
                                                    return (
                                                        <div className="glass" style={{ padding: '0.75rem 1rem', borderRadius: '1rem', border: 'none' }}>
                                                            <p style={{ fontSize: '0.875rem', fontWeight: 'bold' }}>{payload[0].name}</p>
                                                            <p style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>{payload[0].value} Ideas ({payload[0].payload.percentage}%)</p>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div style={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    textAlign: 'center'
                                }}>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '-0.25rem' }}>Total Ideas</p>
                                    <h4 style={{ fontSize: '1.75rem', fontWeight: '800' }}>{analytics?.totalIdeas || 0}</h4>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gap: '1.25rem' }}>
                                {(analytics?.categories || []).map((c, i) => (
                                    <div key={i} style={{ width: '100%' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: COLORS[i % COLORS.length] }}></div>
                                                <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>{c.name}</span>
                                            </div>
                                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                                <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{c.value} ideas</span>
                                                <span style={{ fontSize: '0.8125rem', fontWeight: 'bold' }}>{c.percentage}%</span>
                                            </div>
                                        </div>
                                        <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${c.percentage}%` }}
                                                transition={{ duration: 1, delay: i * 0.1 }}
                                                style={{ height: '100%', background: COLORS[i % COLORS.length] }}
                                            ></motion.div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div style={{
                        marginTop: '2rem',
                        padding: '1rem 1.25rem',
                        borderRadius: '1rem',
                        background: 'rgba(16, 185, 129, 0.05)',
                        border: '1px solid rgba(16, 185, 129, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        fontSize: '0.875rem',
                        color: '#10b981'
                    }}>
                        <p>{getInsight()}</p>
                    </div>
                </div>
            </div>

            {/* Bottom Row: Recent Activity */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
                {/* Recent Activity */}
                <div className="glass" style={{ padding: '1.5rem', borderRadius: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.125rem' }}>Recent Activity</h3>
                        <ActivityIcon size={18} color="var(--text-secondary)" />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {activities.length === 0 ? (
                            <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>No recent activity to show.</p>
                        ) : (
                            activities.map((activity, i) => (
                                <div key={activity.id} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '0.75rem',
                                        background: activity.type.includes('FUNDED') ? '#8b5cf620' : activity.type.includes('REGISTER') ? '#3b82f620' : '#10b98120',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: activity.type.includes('FUNDED') ? '#8b5cf6' : activity.type.includes('REGISTER') ? '#3b82f6' : '#10b981',
                                        flexShrink: 0
                                    }}>
                                        {activity.type.includes('FUNDED') ? <TrendingUp size={18} /> : activity.type.includes('REGISTER') ? <Users size={18} /> : <Lightbulb size={18} />}
                                    </div>
                                    <div style={{ flex: 1, borderBottom: i < activities.length - 1 ? '1px solid var(--border-dark)' : 'none', paddingBottom: '1.25rem' }}>
                                        <p style={{ fontSize: '0.9375rem', marginBottom: '0.2rem' }}>{activity.description}</p>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{new Date(activity.createdAt).toLocaleString()}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminHome;
