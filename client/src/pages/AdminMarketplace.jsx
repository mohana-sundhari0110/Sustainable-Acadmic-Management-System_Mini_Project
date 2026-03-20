import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { ShoppingCart, CheckCircle, XCircle, Package } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminMarketplace = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchProducts = async () => {
        try {
            const res = await api.get('/marketplace/manage');
            setProducts(res.data);
        } catch (err) {
            console.error('Failed to fetch marketplace products');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleUpdateStatus = async (id, status) => {
        try {
            await api.put(`/marketplace/${id}/status`, { status });
            alert(`Product ${status.toLowerCase()} successfully`);
            fetchProducts();
        } catch (err) {
            alert('Failed to update product status');
        }
    };

    if (loading) return <div className="glass" style={{ padding: '2rem', borderRadius: '1rem' }}>Loading marketplace data...</div>;

    const pendingProducts = products.filter(p => p.status === 'PENDING');
    const reviewedProducts = products.filter(p => p.status !== 'PENDING');

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
                <Package size={28} color="var(--primary)" />
                <h2 style={{ fontSize: '1.75rem', m: 0 }}>Marketplace Management</h2>
            </div>
            
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Review and approve sustainable products listed by students.</p>

            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                Pending Approvals ({pendingProducts.length})
            </h3>
            
            {pendingProducts.length === 0 ? (
                <div className="glass" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)', borderRadius: '1rem', marginBottom: '3rem' }}>
                    No products pending approval.
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '1rem', marginBottom: '3rem' }}>
                    {pendingProducts.map(product => (
                        <div key={product.id} className="glass" style={{ padding: '1.5rem', borderRadius: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    {product.name}
                                    <span style={{ fontSize: '0.7rem', background: 'rgba(255,255,255,0.1)', padding: '0.2rem 0.5rem', borderRadius: '1rem', color: 'var(--text-secondary)' }}>{product.category}</span>
                                </h4>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Seller: {product.seller.name} | Price: ${product.price.toFixed(2)} | Green Points: {product.ecoPoints}</p>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', background: 'var(--bg-dark)', padding: '0.75rem', borderRadius: '0.5rem' }}>
                                    {product.description}
                                </p>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button onClick={() => handleUpdateStatus(product.id, 'APPROVED')} style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--primary)', border: '1px solid var(--primary)', padding: '0.5rem 1rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <CheckCircle size={16} /> Approve
                                </button>
                                <button onClick={() => handleUpdateStatus(product.id, 'REJECTED')} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid #ef4444', padding: '0.5rem 1rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <XCircle size={16} /> Reject
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
                Reviewed Products ({reviewedProducts.length})
            </h3>

            <div style={{ display: 'grid', gap: '1rem' }}>
                {reviewedProducts.map(product => (
                    <div key={product.id} className="glass" style={{ padding: '1rem 1.5rem', borderRadius: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: product.status === 'REJECTED' ? 0.6 : 1 }}>
                        <div>
                            <h4 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>{product.name}</h4>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Seller: {product.seller.name}</p>
                        </div>
                        <span style={{ 
                            padding: '0.25rem 0.75rem', 
                            borderRadius: '1rem', 
                            fontSize: '0.8rem', 
                            fontWeight: 'bold',
                            background: product.status === 'APPROVED' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                            color: product.status === 'APPROVED' ? 'var(--primary)' : '#ef4444'
                        }}>
                            {product.status}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminMarketplace;
