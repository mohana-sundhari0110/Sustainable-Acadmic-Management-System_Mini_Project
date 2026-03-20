const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get assignments for a course
router.get('/course/:courseId', authenticate, async (req, res) => {
    try {
        const assignments = await prisma.assignment.findMany({
            where: { courseId: parseInt(req.params.courseId) },
            include: {
                questions: true,
                submissions: {
                    where: { studentId: req.user.id }
                }
            }
        });
        res.json(assignments);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch assignments' });
    }
});

// Get single assignment with questions
router.get('/:id', authenticate, async (req, res) => {
    try {
        const assignment = await prisma.assignment.findUnique({
            where: { id: parseInt(req.params.id) },
            include: { questions: true }
        });
        res.json(assignment);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch assignment' });
    }
});

// Create assignment (Admin only)
router.post('/', authenticate, authorize(['ADMIN']), async (req, res) => {
    try {
        const { courseId, title, type, description, totalMarks, deadline, timeLimit, questions } = req.body;

        const assignmentData = {
            courseId,
            title,
            type,
            description,
            totalMarks,
            deadline: new Date(deadline),
            timeLimit: timeLimit ? parseInt(timeLimit) : null
        };

        const assignment = await prisma.assignment.create({
            data: assignmentData
        });

        if (type === 'quiz' && questions && Array.isArray(questions)) {
            await prisma.quizQuestion.createMany({
                data: questions.map(q => ({
                    assignmentId: assignment.id,
                    question: q.question,
                    type: q.type,
                    option1: q.option1,
                    option2: q.option2,
                    option3: q.option3,
                    option4: q.option4,
                    correctAnswer: q.correctAnswer,
                    marks: q.marks || 1
                }))
            });
        }

        const created = await prisma.assignment.findUnique({
            where: { id: assignment.id },
            include: { questions: true }
        });

        res.status(201).json(created);
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: 'Failed to create assignment' });
    }
});

// Submit assignment
router.post('/:id/submit', authenticate, async (req, res) => {
    try {
        const assignmentId = parseInt(req.params.id);
        const studentId = req.user.id;
        console.log(`[Submission] Attempt: assignmentId=${assignmentId}, studentId=${studentId}`);

        const assignment = await prisma.assignment.findUnique({
            where: { id: assignmentId },
            include: { questions: true }
        });

        if (!assignment) {
            console.error(`[Submission] Assignment ${assignmentId} not found`);
            return res.status(404).json({ error: 'Assignment not found' });
        }

        let submissionData = {
            assignmentId,
            studentId,
            status: 'SUBMITTED'
        };

        if (assignment.type === 'quiz') {
            const studentAnswers = req.body.answers || {};
            console.log(`[Submission] Quiz answers:`, studentAnswers);
            let score = 0;

            assignment.questions.forEach(q => {
                const studentAnswer = studentAnswers[q.id];
                if (studentAnswer === q.correctAnswer) {
                    score += q.marks;
                }
            });
            submissionData.score = score;
            submissionData.status = 'GRADED';
            console.log(`[Submission] Calculated quiz score: ${score}`);
        } else {
            console.log(`[Submission] File URL: ${req.body.fileUrl}`);
            submissionData.fileUrl = req.body.fileUrl;
        }

        const submission = await prisma.submission.create({
            data: submissionData
        });
        console.log(`[Submission] Success! ID: ${submission.id}`);
        res.status(201).json(submission);
    } catch (error) {
        console.error('[Submission] Error:', error);
        res.status(400).json({ error: 'Failed to submit: ' + error.message });
    }
});

// Grade submission (Admin only)
router.patch('/submissions/:id/grade', authenticate, authorize(['ADMIN']), async (req, res) => {
    try {
        const { score, feedback } = req.body;
        const submission = await prisma.submission.update({
            where: { id: parseInt(req.params.id) },
            data: {
                score: parseInt(score),
                feedback,
                status: 'GRADED'
            }
        });
        res.json(submission);
    } catch (error) {
        res.status(400).json({ error: 'Failed to grade submission' });
    }
});

// Get submissions for an assignment (Admin only)
router.get('/:id/submissions', authenticate, authorize(['ADMIN']), async (req, res) => {
    try {
        const submissions = await prisma.submission.findMany({
            where: { assignmentId: parseInt(req.params.id) },
            include: { student: { select: { name: true, email: true } } }
        });
        res.json(submissions);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch submissions' });
    }
});

// Get analytics for a quiz (Admin only)
router.get('/:id/analytics', authenticate, authorize(['ADMIN']), async (req, res) => {
    try {
        const submissions = await prisma.submission.findMany({
            where: { assignmentId: parseInt(req.params.id) }
        });

        if (submissions.length === 0) {
            return res.json({ averageScore: 0, highestScore: 0, attemptCount: 0 });
        }

        const scores = submissions.map(s => s.score || 0);
        const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;
        const highestScore = Math.max(...scores);

        res.json({
            averageScore,
            highestScore,
            attemptCount: submissions.length
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
});

// Delete assignment (Admin only)
router.delete('/:id', authenticate, authorize(['ADMIN']), async (req, res) => {
    try {
        const id = parseInt(req.params.id);

        // Delete associated quiz questions first (Prisma might handle this with cascades, but let's be explicit if not configured)
        await prisma.quizQuestion.deleteMany({
            where: { assignmentId: id }
        });

        // Delete associated submissions
        await prisma.submission.deleteMany({
            where: { assignmentId: id }
        });

        // Delete the assignment
        await prisma.assignment.delete({
            where: { id }
        });

        res.json({ message: 'Assignment deleted successfully' });
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ error: 'Failed to delete assignment' });
    }
});

module.exports = router;
