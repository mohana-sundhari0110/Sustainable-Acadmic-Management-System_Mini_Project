import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { ShoppingCart, Leaf, Search, PlusCircle, Trophy, Star, Bell, Box, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';

const StudentMarketplace = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');
    const navigate = useNavigate();

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/marketplace?search=${search}&category=${category}`);
            setProducts(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [search, category]);

    const handleRequestOrder = async (productId) => {
        try {
            await api.post(`/marketplace/${productId}/order`);
            alert('Order requested successfully! The seller will be notified.');
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to request order');
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <ShoppingCart color="var(--primary)" /> 
                        Sustainable Marketplace
                    </h2>
                    <p style={{ color: 'var(--text-secondary)' }}>Buy and sell eco-friendly products. Earn green points!</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button onClick={() => navigate('/student/marketplace/my-products')} className="glass" style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Box size={18} /> My Products & Orders
                    </button>
                    <button onClick={() => navigate('/student/marketplace/upload')} className="glass" style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <PlusCircle size={18} color="var(--primary)" /> Sell Item
                    </button>
                    <button onClick={() => navigate('/student/marketplace/leaderboard')} className="glass" style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Trophy size={18} color="#fbbf24" /> Leaderboard
                    </button>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <div className="glass" style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '0.75rem 1rem', borderRadius: '1rem' }}>
                    <Search size={20} color="var(--text-secondary)" style={{ marginRight: '0.5rem' }} />
                    <input 
                        type="text" 
                        placeholder="Search products..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ background: 'transparent', border: 'none', color: 'white', width: '100%', outline: 'none' }} 
                    />
                </div>
                <select 
                    className="glass"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    style={{ padding: '0.75rem 1rem', borderRadius: '1rem', background: 'var(--bg-dark)', color: 'white', border: '1px solid var(--border-dark)', minWidth: '150px' }}
                >
                    <option value="">All Categories</option>
                    <option value="Recycled">Recycled</option>
                    <option value="Organic">Organic</option>
                    <option value="Reusable">Reusable</option>
                    <option value="Upcycled">Upcycled</option>
                    <option value="Other">Other</option>
                </select>
            </div>

            {loading ? (
                <div className="glass" style={{ padding: '2rem', textAlign: 'center', borderRadius: '1rem' }}>Loading marketplace...</div>
            ) : products.length === 0 ? (
                <div className="glass" style={{ padding: '4rem 2rem', textAlign: 'center', borderRadius: '1rem', color: 'var(--text-secondary)' }}>
                    <ShoppingCart size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                    <p>No products found in the marketplace.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                    {products.map(product => (
                        <motion.div whileHover={{ scale: 1.02 }} key={product.id} className="glass" style={{ borderRadius: '1rem', overflow: 'hidden' }}>
                            <div style={{ height: '160px', background: 'linear-gradient(45deg, #1f2937, #111827)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {product.imageUrl ? (
                                    <img src={product.imageUrl} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <Leaf size={48} color="rgba(255,255,255,0.2)" />
                                )}
                            </div>
                            <div style={{ padding: '1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <span style={{ fontSize: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--primary)', padding: '0.2rem 0.5rem', borderRadius: '0.25rem' }}>{product.category}</span>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{product.condition || 'New'}</span>
                                </div>
                                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{product.name}</h3>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem', minHeight: '2.5rem' }}>
                                    {product.description.length > 60 ? product.description.substring(0, 60) + '...' : product.description}
                                </p>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                    <span style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>${product.price.toFixed(2)}</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem', color: 'var(--primary)' }}>
                                        <Leaf size={14} /> +{product.ecoPoints} points
                                    </div>
                                </div>
                                <button onClick={() => handleRequestOrder(product.id)} className="primary" style={{ width: '100%', padding: '0.75rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                                    <ShoppingCart size={16} /> Request to Buy
                                </button>
                                <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                                        {product.seller.name.charAt(0)}
                                    </div>
                                    <span>Seller: {product.seller.name}</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default StudentMarketplace;
