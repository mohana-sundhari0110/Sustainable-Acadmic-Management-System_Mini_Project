import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Trophy, Leaf, Medal, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const MarketplaceLeaderboard = () => {
    const [leaders, setLeaders] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const res = await api.get('/marketplace/leaderboard');
                setLeaders(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchLeaderboard();
    }, []);

    const getMedalColor = (index) => {
        if (index === 0) return '#fbbf24'; // Gold
        if (index === 1) return '#9ca3af'; // Silver
        if (index === 2) return '#b45309'; // Bronze
        return 'transparent';
    };

    if (loading) return <div className="glass" style={{ padding: '2rem', textAlign: 'center', borderRadius: '1rem' }}>Loading leaderboard...</div>;

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                <ArrowLeft size={16} /> Back to Marketplace
            </button>

            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(251, 191, 36, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}
                >
                    <Trophy size={40} color="#fbbf24" />
                </motion.div>
                <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem', background: 'linear-gradient(to right, #fbbf24, #10b981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Eco Contributors
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Top students earning green points through sustainable actions.</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {leaders.map((user, idx) => (
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        key={user.id} 
                        className="glass" 
                        style={{ 
                            padding: '1.5rem 2rem', 
                            borderRadius: '1rem', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'space-between',
                            border: idx < 3 ? `1px solid ${getMedalColor(idx)}` : '1px solid var(--border-dark)',
                            background: idx === 0 ? 'rgba(251, 191, 36, 0.05)' : 'var(--glass-bg)'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', width: '30px', textAlign: 'center', color: idx < 3 ? getMedalColor(idx) : 'var(--text-secondary)' }}>
                                #{idx + 1}
                            </div>
                            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(45deg, var(--primary), var(--primary-dark))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem' }}>
                                {user.name.charAt(0)}
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1.2rem', margin: 0 }}>{user.name}</h3>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>{user.department || 'General'}</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(16, 185, 129, 0.1)', padding: '0.5rem 1rem', borderRadius: '2rem' }}>
                            <Leaf size={18} color="var(--primary)" />
                            <span style={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--primary)' }}>{user.greenPoints}</span>
                        </div>
                    </motion.div>
                ))}

                {leaders.length === 0 && (
                    <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>No contributors found yet.</p>
                )}
            </div>
        </div>
    );
};

export default MarketplaceLeaderboard;
