const express = require('express');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get all students (Admin only)
router.get('/', authenticate, authorize(['ADMIN']), async (req, res) => {
    try {
        const students = await prisma.user.findMany({
            where: { role: 'STUDENT' },
            orderBy: { createdAt: 'desc' }
        });
        res.json(students);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch students' });
    }
});

// Create new student (Admin only)
router.post('/', authenticate, authorize(['ADMIN']), async (req, res) => {
    try {
        const { name, email, registerNumber, department, year, password } = req.body;

        // Check if email already exists
        const existingEmail = await prisma.user.findUnique({ where: { email } });
        if (existingEmail) return res.status(400).json({ error: 'Email already registered' });

        // Check if register number exists
        const existingReg = await prisma.user.findUnique({ where: { registerNumber } });
        if (existingReg) return res.status(400).json({ error: 'Register number already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);

        const student = await prisma.user.create({
            data: {
                name,
                email,
                registerNumber,
                department,
                year,
                password: hashedPassword,
                role: 'STUDENT'
            }
        });

        // Log Activity
        await prisma.activity.create({
            data: {
                type: 'STUDENT_REGISTER',
                description: `New student registered: ${name} (${registerNumber})`
            }
        });

        res.status(201).json(student);
    } catch (error) {
        res.status(400).json({ error: 'Failed to create student' });
    }
});

// Update student (Admin only)
router.put('/:id', authenticate, authorize(['ADMIN']), async (req, res) => {
    try {
        const { name, department, year } = req.body;
        const student = await prisma.user.update({
            where: { id: parseInt(req.params.id) },
            data: { name, department, year }
        });
        res.json(student);
    } catch (error) {
        res.status(400).json({ error: 'Failed to update student' });
    }
});

// Delete student (Admin only)
router.delete('/:id', authenticate, authorize(['ADMIN']), async (req, res) => {
    try {
        await prisma.user.delete({
            where: { id: parseInt(req.params.id) }
        });
        res.json({ message: 'Student deleted successfully' });
    } catch (error) {
        res.status(400).json({ error: 'Failed to delete student' });
    }
});

// Enroll in a course
router.get('/dashboard-info', authenticate, async (req, res) => {
    try {
        const studentId = req.user.id;

        const [student, enrollments, upcomingAssignments, bookings, submissions] = await Promise.all([
            prisma.user.findUnique({
                where: { id: studentId },
                select: { name: true }
            }),
            prisma.enrollment.findMany({
                where: { studentId },
                include: { course: true }
            }),
            prisma.assignment.findMany({
                where: {
                    course: {
                        enrollments: {
                            some: { studentId }
                        }
                    },
                    deadline: { gte: new Date() },
                    submissions: {
                        none: { studentId }
                    }
                },
                include: { course: true },
                orderBy: { deadline: 'asc' },
                take: 5
            }),
            prisma.equipmentBooking.findMany({
                where: { studentId },
                include: { equipment: true },
                orderBy: { startTime: 'desc' },
                take: 5
            }),
            prisma.submission.findMany({
                where: { studentId, status: 'GRADED' },
                select: { score: true }
            })
        ]);

        const averageScore = submissions.length > 0
            ? (submissions.reduce((sum, s) => sum + (s.score || 0), 0) / submissions.length).toFixed(1)
            : 0;

        // Get schedules for enrolled courses
        const courseNames = enrollments.map(e => e.course.title);
        const schedules = await prisma.classSchedule.findMany({
            where: {
                courseName: { in: courseNames }
            },
            include: { classroom: true }
        });

        res.json({
            student: { ...student, averageScore },
            enrollments,
            upcomingAssignments,
            bookings,
            schedules
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch dashboard info' });
    }
});

router.post('/enroll', authenticate, async (req, res) => {
    try {
        const { courseId } = req.body;
        const studentId = parseInt(req.user.id);

        if (isNaN(studentId)) {
            return res.status(401).json({ error: 'Invalid user authentication' });
        }

        const cid = parseInt(courseId);
        if (isNaN(cid)) {
            return res.status(400).json({ error: 'Invalid course ID' });
        }

        // Check if course exists
        const course = await prisma.course.findUnique({
            where: { id: cid }
        });

        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }

        // Check if already enrolled
        const existingEnrollment = await prisma.enrollment.findUnique({
            where: {
                studentId_courseId: {
                    studentId,
                    courseId: cid
                }
            }
        });

        if (existingEnrollment) {
            return res.status(400).json({ error: 'Already enrolled in this course' });
        }

        const enrollment = await prisma.enrollment.create({
            data: {
                studentId,
                courseId: cid,
                progress: 0
            }
        });

        res.status(201).json(enrollment);
    } catch (error) {
        console.error('Enrollment error:', error);
        res.status(500).json({
            error: 'Failed to enroll in course',
            details: error.message
        });
    }
});

// Get Dashboard Stats (Admin only)
router.get('/stats', authenticate, authorize(['ADMIN']), async (req, res) => {
    try {
        const [studentCount, courseCount, innovationCount, completedCount] = await Promise.all([
            prisma.user.count({ where: { role: 'STUDENT' } }),
            prisma.course.count(),
            prisma.innovationIdea.count(),
            prisma.innovationIdea.count({ where: { status: 'Completed' } })
        ]);

        res.json({
            students: studentCount,
            courses: courseCount,
            innovations: innovationCount,
            funded: completedCount
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

module.exports = router;
