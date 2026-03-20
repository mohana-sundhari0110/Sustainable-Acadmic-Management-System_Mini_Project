import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import StudentHome from './StudentHome';
import StudentCourses from './StudentCourses';
import StudentAssignments from './StudentAssignments';
import InnovationSubmit from './InnovationSubmit';
import MyInnovations from './MyInnovations';
import StudentLabBooking from './StudentLabBooking';
import StudentClassSchedules from './StudentClassSchedules';
import StudentMarketplace from './StudentMarketplace';
import MarketplaceUpload from './MarketplaceUpload';
import MarketplaceManage from './MarketplaceManage';
import MarketplaceLeaderboard from './MarketplaceLeaderboard';

const StudentDashboard = () => {
    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            <Sidebar role="STUDENT" />
            <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
                <header style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '2rem'
                }}>
                    <div>
                        <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>Student Portal</h1>
                        <p style={{ color: 'var(--text-secondary)' }}>Welcome back! Track your green progress and learning.</p>
                    </div>
                    <div className="glass" style={{ padding: '0.75rem 1.25rem', borderRadius: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: 'linear-gradient(to bottom right, #3b82f6, #2563eb)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 'bold'
                        }}>S</div>
                        <div>
                            <p style={{ fontSize: '0.875rem', fontWeight: '600' }}>Student User</p>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Green Points: 250</p>
                        </div>
                    </div>
                </header>

                <Routes>
                    <Route path="/" element={<StudentHome />} />
                    <Route path="/courses" element={<StudentCourses />} />
                    <Route path="/assignments" element={<StudentAssignments />} />
                    <Route path="/innovation" element={<MyInnovations />} />
                    <Route path="/innovation/submit" element={<InnovationSubmit />} />
                    <Route path="/lab-booking" element={<StudentLabBooking />} />
                    <Route path="/schedules" element={<StudentClassSchedules />} />
                    <Route path="/marketplace" element={<StudentMarketplace />} />
                    <Route path="/marketplace/upload" element={<MarketplaceUpload />} />
                    <Route path="/marketplace/my-products" element={<MarketplaceManage />} />
                    <Route path="/marketplace/leaderboard" element={<MarketplaceLeaderboard />} />
                </Routes>
            </main>
        </div>
    );
};

export default StudentDashboard;
