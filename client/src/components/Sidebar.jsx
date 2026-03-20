import React from 'react';
import { LayoutDashboard, BookOpen, PenTool, Lightbulb, User, LogOut, Boxes, Zap, Calendar, ShoppingCart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, NavLink } from 'react-router-dom';

const Sidebar = ({ role }) => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const adminLinks = [
        { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/admin' },
        { name: 'Courses', icon: <BookOpen size={20} />, path: '/admin/courses' },
        { name: 'Assignments', icon: <PenTool size={20} />, path: '/admin/assignments' },
        { name: 'Resources', icon: <Boxes size={20} />, path: '/admin/resources' },
        { name: 'Energy', icon: <Zap size={20} />, path: '/admin/energy' },
        { name: 'Innovations', icon: <Lightbulb size={20} />, path: '/admin/innovations' },
        { name: 'Students', icon: <User size={20} />, path: '/admin/students' },
        { name: 'Marketplace', icon: <ShoppingCart size={20} />, path: '/admin/marketplace' },
    ];

    const studentLinks = [
        { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/student' },
        { name: 'Courses', icon: <BookOpen size={20} />, path: '/student/courses' },
        { name: 'Assignments', icon: <PenTool size={20} />, path: '/student/assignments' },
        { name: 'Lab Booking', icon: <Boxes size={20} />, path: '/student/lab-booking' },
        { name: 'Schedules', icon: <Calendar size={20} />, path: '/student/schedules' },
        { name: 'Innovation', icon: <Lightbulb size={20} />, path: '/student/innovation' },
        { name: 'Marketplace', icon: <ShoppingCart size={20} />, path: '/student/marketplace' },
    ];

    const links = role === 'ADMIN' ? adminLinks : studentLinks;

    return (
        <div className="glass" style={{
            width: '260px',
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            padding: '1.5rem',
            borderRight: '1px solid var(--border-dark)'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2.5rem' }}>
                <div style={{ background: 'var(--primary)', padding: '0.5rem', borderRadius: '0.5rem' }}>
                    <BookOpen color="white" size={20} />
                </div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>SAMS</h2>
            </div>

            <nav style={{ flex: 1 }}>
                {links.map((link) => (
                    <NavLink
                        key={link.path}
                        to={link.path}
                        style={({ isActive }) => ({
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '0.875rem 1rem',
                            borderRadius: '0.75rem',
                            marginBottom: '0.5rem',
                            background: isActive ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                            color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                            fontWeight: isActive ? '600' : '400',
                            textDecoration: 'none'
                        })}
                    >
                        {link.icon}
                        {link.name}
                    </NavLink>
                ))}
            </nav>

            <div style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid var(--border-dark)' }}>
                <button
                    onClick={logout}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.875rem 1rem',
                        width: '100%',
                        borderRadius: '0.75rem',
                        background: 'transparent',
                        color: '#ef4444',
                        textAlign: 'left'
                    }}
                >
                    <LogOut size={20} />
                    Logout
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
