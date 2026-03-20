import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import AdminHome from './AdminHome';
import AdminCourses from './AdminCourses';
import AdminAssignments from './AdminAssignments';
import AdminSubmissions from './AdminSubmissions';
import AdminInnovations from './AdminInnovations';
import AdminStudents from './AdminStudents';
import AdminResourceManagement from './AdminResourceManagement';
import AdminEnergyMonitor from './AdminEnergyMonitor';
import AdminMarketplace from './AdminMarketplace';

const AdminDashboard = () => {
    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            <Sidebar role="ADMIN" />
            <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
                <header style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '2rem'
                }}>
                    <div>
                        <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>Admin Control Center</h1>
                        <p style={{ color: 'var(--text-secondary)' }}>Manage sustainability education and student innovation.</p>
                    </div>
                    <div className="glass" style={{ padding: '0.75rem 1.25rem', borderRadius: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: 'linear-gradient(to bottom right, var(--primary), var(--primary-dark))',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 'bold'
                        }}>A</div>
                        <div>
                            <p style={{ fontSize: '0.875rem', fontWeight: '600' }}>Admin User</p>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Administrator</p>
                        </div>
                    </div>
                </header>

                <Routes>
                    <Route path="/" element={<AdminHome />} />
                    <Route path="/courses" element={<AdminCourses />} />
                    <Route path="/assignments" element={<AdminAssignments />} />
                    <Route path="/assignments/:id/submissions" element={<AdminSubmissions />} />
                    <Route path="/innovations" element={<AdminInnovations />} />
                    <Route path="/students" element={<AdminStudents />} />
                    <Route path="/resources" element={<AdminResourceManagement />} />
                    <Route path="/energy" element={<AdminEnergyMonitor />} />
                    <Route path="/marketplace" element={<AdminMarketplace />} />
                </Routes>
            </main>
        </div>
    );
};

export default AdminDashboard;
