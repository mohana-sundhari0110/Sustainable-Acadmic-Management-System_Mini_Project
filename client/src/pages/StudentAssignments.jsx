import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { PenTool, Upload, CheckCircle, Clock, FileText, HelpCircle, AlertCircle, ArrowRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const StudentAssignments = () => {
    const [assignments, setAssignments] = useState([]);
    const [activeQuiz, setActiveQuiz] = useState(null);
    const [answers, setAnswers] = useState({});
    const [quizResult, setQuizResult] = useState(null);
    const [timeLeft, setTimeLeft] = useState(null);
    const [showUploadModal, setShowUploadModal] = useState(null);
    const [fileUrl, setFileUrl] = useState('');

    const fetchAllAssignments = async () => {
        try {
            const coursesRes = await api.get('/admin/courses');
            const allAssignments = [];
            for (const course of coursesRes.data) {
                const res = await api.get(`/assignments/course/${course.id}`);
                allAssignments.push(...res.data.map(a => ({ ...a, courseTitle: course.title })));
            }
            setAssignments(allAssignments);
        } catch (err) {
            console.error('Failed to fetch assignments');
        }
    };

    useEffect(() => {
        fetchAllAssignments();
    }, []);

    useEffect(() => {
        if (activeQuiz && timeLeft !== null && timeLeft > 0) {
            const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
            return () => clearInterval(timer);
        } else if (timeLeft === 0) {
            handleQuizSubmit();
        }
    }, [activeQuiz, timeLeft]);

    const handleStartQuiz = (assignment) => {
        setActiveQuiz(assignment);
        setAnswers({});
        setQuizResult(null);
        if (assignment.timeLimit) {
            setTimeLeft(assignment.timeLimit * 60);
        } else {
            setTimeLeft(null);
        }
    };

    const handleQuizSubmit = async () => {
        try {
            const res = await api.post(`/assignments/${activeQuiz.id}/submit`, { answers });
            setQuizResult(res.data);
            fetchAllAssignments();
        } catch (err) {
            alert('Failed to submit quiz');
        }
    };

    const handleFileUpload = async () => {
        try {
            await api.post(`/assignments/${showUploadModal.id}/submit`, { fileUrl });
            setShowUploadModal(null);
            setFileUrl('');
            fetchAllAssignments();
            alert('Assignment submitted successfully!');
        } catch (err) {
            alert('Failed to submit assignment');
        }
    };

    return (
        <div style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Academic Journey</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '3rem' }}>Complete your assessments and track your academic progress.</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '2.5rem' }}>
                <AnimatePresence>
                    {assignments.map((assignment) => (
                        <motion.div
                            whileHover={{ y: -10 }}
                            key={assignment.id}
                            className="glass"
                            style={{ padding: '2rem', borderRadius: '2rem', border: '1px solid rgba(255,255,255,0.1)', position: 'relative' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                                <div style={{
                                    background: assignment.type === 'quiz' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                                    padding: '0.75rem',
                                    borderRadius: '1.25rem',
                                    color: assignment.type === 'quiz' ? '#10b981' : '#3b82f6'
                                }}>
                                    {assignment.type === 'quiz' ? <HelpCircle size={28} /> : <FileText size={28} />}
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Deadline</span>
                                    <span style={{ fontSize: '1rem', fontWeight: 'bold' }}>{new Date(assignment.deadline).toLocaleDateString()}</span>
                                </div>
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                                    <span>{assignment.courseTitle}</span>
                                </div>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', lineHeight: '1.2' }}>{assignment.title}</h3>
                            </div>

                            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.25rem', borderRadius: '1.25rem', marginBottom: '2rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ padding: '0.5rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.05)' }}>
                                        {assignment.submissions?.length > 0 ? <CheckCircle size={20} color="#10b981" /> : <Clock size={20} color="#f59e0b" />}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Status</p>
                                        <p style={{ fontSize: '0.9rem', fontWeight: '600' }}>
                                            {assignment.submissions?.length > 0 ? (
                                                assignment.submissions[0].status === 'GRADED' ? `Graded: ${assignment.submissions[0].score}/${assignment.totalMarks}` : 'Submitted'
                                            ) : 'Pending Submission'}
                                        </p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Marks</p>
                                        <p style={{ fontWeight: 'bold' }}>{assignment.totalMarks} pts</p>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => assignment.type === 'quiz' ? handleStartQuiz(assignment) : setShowUploadModal(assignment)}
                                className="primary"
                                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', padding: '1rem', borderRadius: '1.25rem', fontWeight: 'bold' }}
                            >
                                {assignment.type === 'quiz' ? (
                                    <><HelpCircle size={20} /> Start Quiz</>
                                ) : (
                                    <><Upload size={20} /> Submit Work</>
                                )}
                                <ArrowRight size={18} />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Quiz Modal */}
            {activeQuiz && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1.5rem' }}>
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="glass"
                        style={{ width: '100%', maxWidth: '900px', maxHeight: '90vh', overflowY: 'auto', padding: '3rem', borderRadius: '2.5rem', border: '1px solid rgba(255,255,255,0.1)' }}
                    >
                        {!quizResult ? (
                            <>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                                    <div>
                                        <h3 style={{ fontSize: '2rem', fontWeight: 'bold' }}>{activeQuiz.title}</h3>
                                        <p style={{ color: 'var(--text-secondary)' }}>Answer all questions to complete the quiz.</p>
                                    </div>
                                    {timeLeft !== null && (
                                        <div style={{ background: timeLeft < 60 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255,255,255,0.05)', padding: '1rem 1.5rem', borderRadius: '1.25rem', border: `1px solid ${timeLeft < 60 ? '#ef4444' : 'rgba(255,255,255,0.1)'}` }}>
                                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Time Remaining</p>
                                            <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: timeLeft < 60 ? '#ef4444' : 'white' }}>
                                                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {activeQuiz.questions.map((q, idx) => (
                                    <div key={q.id} style={{ marginBottom: '2.5rem', padding: '2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '1.5rem' }}>
                                        <p style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>{idx + 1}. {q.question}</p>
                                        <div style={{ display: 'grid', gridTemplateColumns: q.type === 'MCQ' ? '1fr 1fr' : '1fr', gap: '1rem' }}>
                                            {[q.option1, q.option2, q.option3, q.option4].filter(Boolean).map(opt => (
                                                <button
                                                    key={opt}
                                                    onClick={() => setAnswers({ ...answers, [q.id]: opt })}
                                                    style={{
                                                        textAlign: 'left',
                                                        padding: '1.25rem',
                                                        borderRadius: '1rem',
                                                        background: answers[q.id] === opt ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                                                        color: answers[q.id] === opt ? 'white' : 'var(--text-secondary)',
                                                        border: '1px solid rgba(255,255,255,0.1)',
                                                        transition: 'all 0.2s'
                                                    }}
                                                >
                                                    {opt}
                                                </button>
                                            ))}
                                            {q.type === 'TRUE_FALSE' && ['True', 'False'].map(opt => (
                                                <button
                                                    key={opt}
                                                    onClick={() => setAnswers({ ...answers, [q.id]: opt })}
                                                    style={{
                                                        textAlign: 'left',
                                                        padding: '1.25rem',
                                                        borderRadius: '1rem',
                                                        background: answers[q.id] === opt ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                                                        color: answers[q.id] === opt ? 'white' : 'var(--text-secondary)',
                                                        border: '1px solid rgba(255,255,255,0.1)'
                                                    }}
                                                >
                                                    {opt}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}

                                <div style={{ display: 'flex', gap: '1.5rem' }}>
                                    <button onClick={() => setActiveQuiz(null)} style={{ flex: 1, padding: '1.25rem', borderRadius: '1.5rem', background: 'rgba(255,255,255,0.05)', fontWeight: 'bold' }}>Quit Quiz</button>
                                    <button onClick={handleQuizSubmit} className="primary" style={{ flex: 2, padding: '1.25rem', borderRadius: '1.5rem', fontWeight: 'bold', fontSize: '1.125rem' }}>Submit Answers</button>
                                </div>
                            </>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '2rem' }}>
                                <div style={{ width: '100px', height: '100px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}>
                                    <CheckCircle size={60} />
                                </div>
                                <h3 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Quiz Completed!</h3>
                                <div style={{ fontSize: '4rem', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '1rem' }}>
                                    {quizResult.score} <span style={{ fontSize: '1.5rem', color: 'var(--text-secondary)' }}>/ {activeQuiz.totalMarks}</span>
                                </div>
                                <p style={{ color: 'var(--text-secondary)', marginBottom: '3rem' }}>Great job! Your score has been recorded in the database.</p>
                                <button onClick={() => setActiveQuiz(null)} className="primary" style={{ padding: '1rem 3rem', borderRadius: '1.25rem', fontWeight: 'bold' }}>Close</button>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}

            {/* Upload Modal */}
            {showUploadModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1.5rem' }}>
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass" style={{ width: '100%', maxWidth: '500px', padding: '2.5rem', borderRadius: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Submit Assignment</h3>
                            <button onClick={() => setShowUploadModal(null)} style={{ background: 'transparent', color: 'var(--text-secondary)' }}><X /></button>
                        </div>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{showUploadModal.description}</p>
                        <div style={{ marginBottom: '2rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.75rem', fontSize: '0.875rem' }}>Paste File URL / Submission Link</label>
                            <input
                                style={{ width: '100%', padding: '1rem', borderRadius: '1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                                value={fileUrl}
                                onChange={e => setFileUrl(e.target.value)}
                                placeholder="https://docs.google.com/..."
                            />
                        </div>
                        <button onClick={handleFileUpload} className="primary" style={{ width: '100%', padding: '1rem', borderRadius: '1.25rem', fontWeight: 'bold' }}>Confirm Submission</button>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default StudentAssignments;
