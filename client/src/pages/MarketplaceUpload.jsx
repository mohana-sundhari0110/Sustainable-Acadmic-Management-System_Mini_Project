import React, { useState } from 'react';
import api from '../api/axios';
import { Upload, Leaf, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MarketplaceUpload = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: 'Recycled',
        condition: 'Used - Good',
        imageUrl: '',
        ecoPoints: 10
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/marketplace', formData);
            alert('Product uploaded successfully! Waiting for admin approval.');
            navigate('/student/marketplace/my-products');
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to upload product');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                <ArrowLeft size={16} /> Back
            </button>
            <div className="glass" style={{ padding: '2rem', borderRadius: '1.5rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                        <Upload size={32} color="var(--primary)" />
                    </div>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Sell a Sustainable Product</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>Share your eco-friendly items. Earn green points when they sell!</p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Product Name</label>
                        <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="glass" style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-dark)', color: 'white', background: 'rgba(0,0,0,0.2)' }} />
                    </div>
                    
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Description & Eco-Impact</label>
                        <textarea required rows={4} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="glass" style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-dark)', color: 'white', background: 'rgba(0,0,0,0.2)', resize: 'vertical' }} placeholder="Why is this product sustainable?" />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Price ($) <span style={{color:'var(--text-secondary)'}}>(Enter 0 if giving away)</span></label>
                            <input required type="number" step="0.01" min="0" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="glass" style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-dark)', color: 'white', background: 'rgba(0,0,0,0.2)' }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Green Points to Award</label>
                            <input type="number" value={formData.ecoPoints} onChange={e => setFormData({...formData, ecoPoints: e.target.value})} className="glass" style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-dark)', color: 'white', background: 'rgba(0,0,0,0.2)' }} />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Category</label>
                            <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="glass" style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-dark)', color: 'white', background: 'var(--bg-dark)' }}>
                                <option value="Recycled">Recycled Material</option>
                                <option value="Organic">Organic Product</option>
                                <option value="Reusable">Reusable Item</option>
                                <option value="Upcycled">Upcycled/Handmade</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Condition</label>
                            <select value={formData.condition} onChange={e => setFormData({...formData, condition: e.target.value})} className="glass" style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-dark)', color: 'white', background: 'var(--bg-dark)' }}>
                                <option value="New">New</option>
                                <option value="Used - Like New">Used - Like New</option>
                                <option value="Used - Good">Used - Good</option>
                                <option value="Used - Fair">Used - Fair</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Image URL (Optional)</label>
                        <input type="url" value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} className="glass" placeholder="https://example.com/image.jpg" style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-dark)', color: 'white', background: 'rgba(0,0,0,0.2)' }} />
                    </div>

                    <button disabled={loading} type="submit" className="primary" style={{ width: '100%', padding: '1rem', marginTop: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}>
                        <Leaf size={18} /> {loading ? 'Submitting...' : 'Submit Product Listing'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default MarketplaceUpload;
