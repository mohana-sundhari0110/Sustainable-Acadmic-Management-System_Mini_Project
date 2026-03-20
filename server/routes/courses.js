const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get all courses
router.get('/', authenticate, async (req, res) => {
    try {
        const courses = await prisma.course.findMany();
        res.json(courses);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch courses' });
    }
});

// Add course (Admin only)
router.post('/', authenticate, authorize(['ADMIN']), async (req, res) => {
    try {
        const { title, code, instructor, duration, description, category, status, objectives, content } = req.body;

        if (!title || !code || !instructor || !duration) {
            return res.status(400).json({ error: 'Title, Code, Instructor, and Duration are required' });
        }

        const durationInt = parseInt(duration);
        if (isNaN(durationInt) || durationInt <= 0) {
            return res.status(400).json({ error: 'Duration must be a valid positive integer' });
        }

        const course = await prisma.course.create({
            data: {
                title,
                code,
                instructor,
                duration: durationInt,
                description: description || '',
                objectives: objectives || '',
                content: content || '',
                category: category || 'General',
                status: status || 'Active'
            },
        });
        res.status(201).json(course);
    } catch (error) {
        console.error('Course creation error:', error);
        if (error.code === 'P2002') {
            return res.status(400).json({ error: `Course code '${req.body.code}' already exists.` });
        }
        res.status(500).json({ error: 'Failed to create course. Please try again later.' });
    }
});

// Update course (Admin only)
router.put('/:id', authenticate, authorize(['ADMIN']), async (req, res) => {
    try {
        const { title, code, instructor, duration, description, category, status, objectives, content } = req.body;

        const durationInt = duration ? parseInt(duration) : undefined;
        if (durationInt !== undefined && (isNaN(durationInt) || durationInt <= 0)) {
            return res.status(400).json({ error: 'Duration must be a valid positive integer' });
        }

        const course = await prisma.course.update({
            where: { id: parseInt(req.params.id) },
            data: {
                title,
                code,
                instructor,
                duration: durationInt,
                description,
                objectives,
                content,
                category,
                status
            },
        });
        res.json(course);
    } catch (error) {
        console.error('Course update error:', error);
        if (error.code === 'P2002') {
            return res.status(400).json({ error: `Course code '${req.body.code}' already exists.` });
        }
        res.status(400).json({ error: 'Failed to update course' });
    }
});
router.delete('/:id', authenticate, authorize(['ADMIN']), async (req, res) => {
    try {
        await prisma.course.delete({ where: { id: parseInt(req.params.id) } });
        res.json({ message: 'Course deleted' });
    } catch (error) {
        res.status(400).json({ error: 'Failed to delete course' });
    }
});

module.exports = router;
