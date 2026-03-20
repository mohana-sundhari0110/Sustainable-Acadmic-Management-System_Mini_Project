import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Package, Clock, CheckCircle, Leaf, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const MarketplaceManage = () => {
    const [myProducts, setMyProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchMyProducts = async () => {
        try {
            const res = await api.get('/marketplace/manage');
            setMyProducts(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyProducts();
    }, []);

    const handleCompleteOrder = async (orderId) => {
        try {
            await api.put(`/marketplace/orders/${orderId}/status`, { status: 'COMPLETED' });
            alert('Order completed! Green points have been awarded to both you and the buyer.');
            fetchMyProducts();
        } catch (err) {
            alert('Failed to complete order');
        }
    };

    if (loading) return <div className="glass" style={{ padding: '2rem', borderRadius: '1rem', textAlign: 'center' }}>Loading your products...</div>;

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', color: 'var(--text-secondary)' }}>
                    <ArrowLeft size={16} /> Back
                </button>
                <h2 style={{ fontSize: '1.75rem', m: 0 }}>My Sustainable Products</h2>
            </div>
            
            {myProducts.length === 0 ? (
                <div className="glass" style={{ padding: '4rem', textAlign: 'center', borderRadius: '1rem' }}>
                    <Package size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                    <p style={{ color: 'var(--text-secondary)' }}>You haven't listed any products yet.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {myProducts.map(product => (
                        <motion.div key={product.id} className="glass" style={{ padding: '1.5rem', borderRadius: '1rem', borderLeft: `4px solid ${product.status === 'APPROVED' ? 'var(--primary)' : product.status === 'PENDING' ? '#fbbf24' : '#ef4444'}` }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                <div>
                                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{product.name}</h3>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>${product.price.toFixed(2)} | {product.category}</p>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                    <span style={{ 
                                        padding: '0.25rem 0.75rem', 
                                        borderRadius: '1rem', 
                                        fontSize: '0.8rem', 
                                        fontWeight: 'bold',
                                        background: product.status === 'APPROVED' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.05)',
                                        color: product.status === 'APPROVED' ? 'var(--primary)' : product.status === 'PENDING' ? '#fbbf24' : '#ef4444'
                                    }}>
                                        {product.status}
                                    </span>
                                </div>
                            </div>
                            
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                                {product.description}
                            </p>

                            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '0.75rem' }}>
                                <h4 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>Order Requests ({product.orders.length})</h4>
                                {product.orders.length === 0 ? (
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>No orders yet.</p>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        {product.orders.map(order => (
                                            <div key={order.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'var(--bg-dark)', borderRadius: '0.5rem', border: '1px solid var(--border-dark)' }}>
                                                <div>
                                                    <p style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Buyer: {order.buyer.name}</p>
                                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Status: {order.status}</p>
                                                </div>
                                                {order.status === 'REQUESTED' ? (
                                                    <button onClick={() => handleCompleteOrder(order.id)} className="primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <CheckCircle size={16} /> Mark Completed
                                                    </button>
                                                ) : (
                                                    <span style={{ color: 'var(--primary)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                        <Leaf size={14} /> Points Awarded
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MarketplaceManage;
