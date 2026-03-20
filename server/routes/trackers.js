const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Add tracking data
router.post('/', authenticate, authorize(['STUDENT']), async (req, res) => {
    try {
        const { type, data } = req.body;
        const tracker = await prisma.sustainabilityTracker.create({
            data: {
                studentId: req.user.id,
                type,
                data: JSON.stringify(data),
            },
        });
        res.status(201).json(tracker);
    } catch (error) {
        res.status(400).json({ error: 'Failed to save tracker data' });
    }
});

// Get tracking history
router.get('/:type', authenticate, async (req, res) => {
    try {
        const history = await prisma.sustainabilityTracker.findMany({
            where: {
                studentId: req.user.id,
                type: req.params.type.toUpperCase(),
            },
            orderBy: { date: 'desc' },
        });
        res.json(history.map(h => ({ ...h, data: JSON.parse(h.data) })));
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch tracking history' });
    }
});

module.exports = router;
