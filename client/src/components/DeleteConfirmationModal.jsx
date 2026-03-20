import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, title }) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.8)',
                backdropFilter: 'blur(4px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 2000,
                padding: '1rem'
            }}>
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    style={{
                        background: '#1e293b',
                        borderRadius: '1.25rem',
                        padding: '2rem',
                        width: '100%',
                        maxWidth: '400px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.5rem' }}>
                        <button onClick={onClose} style={{ background: 'transparent', color: '#94a3b8', border: 'none', cursor: 'pointer' }}>
                            <X size={20} />
                        </button>
                    </div>

                    <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                        <div style={{
                            background: 'rgba(239, 68, 68, 0.1)',
                            width: '4rem',
                            height: '4rem',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1.5rem',
                            color: '#ef4444'
                        }}>
                            <AlertTriangle size={32} />
                        </div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'white', marginBottom: '0.5rem' }}>Delete Assignment?</h3>
                        <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                            Are you sure you want to delete <span style={{ color: 'white', fontWeight: 'bold' }}>"{title}"</span>? This action cannot be undone.
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button
                            onClick={onClose}
                            style={{
                                flex: 1,
                                padding: '0.75rem',
                                borderRadius: '0.75rem',
                                background: 'rgba(255,255,255,0.05)',
                                color: 'white',
                                border: 'none',
                                fontWeight: '600',
                                cursor: 'pointer'
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            style={{
                                flex: 2,
                                padding: '0.75rem',
                                borderRadius: '0.75rem',
                                background: '#ef4444',
                                color: 'white',
                                border: 'none',
                                fontWeight: 'bold',
                                cursor: 'pointer'
                            }}
                        >
                            Delete Assignment
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default DeleteConfirmationModal;
