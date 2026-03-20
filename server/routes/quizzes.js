const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get all quizzes for a course
router.get('/course/:courseId', authenticate, async (req, res) => {
    try {
        const quizzes = await prisma.quiz.findMany({
            where: { courseId: parseInt(req.params.courseId) },
        });
        res.json(quizzes);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch quizzes' });
    }
});

// Create quiz (Admin only)
router.post('/', authenticate, authorize(['ADMIN']), async (req, res) => {
    try {
        const { courseId, title, questions, deadline, marks } = req.body;
        const quiz = await prisma.quiz.create({
            data: { courseId, title, questions, deadline: new Date(deadline), marks },
        });
        res.status(201).json(quiz);
    } catch (error) {
        res.status(400).json({ error: 'Failed to create quiz' });
    }
});

// Submit/Grade placeholders could go here or in a separate results route

module.exports = router;
