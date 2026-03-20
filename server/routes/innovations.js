const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Submit innovation idea (Student only)
router.post('/', authenticate, authorize(['STUDENT']), async (req, res) => {
    try {
        const { title, problem, solution, impact, budget, supportingDoc, category } = req.body;
        const idea = await prisma.innovationIdea.create({
            data: {
                studentId: req.user.id,
                title, problem, solution, impact, budget, supportingDoc,
                category: category || 'General'
            },
        });

        // Log Activity
        await prisma.activity.create({
            data: {
                type: 'INNOVATION_SUBMIT',
                description: `New innovation submitted: "${title}"`
            }
        });

        res.status(201).json(idea);
    } catch (error) {
        res.status(400).json({ error: 'Failed to submit idea' });
    }
});

// Get all ideas (Admin) or my ideas (Student)
router.get('/', authenticate, async (req, res) => {
    try {
        const where = req.user.role === 'ADMIN' ? {} : { studentId: req.user.id };
        const ideas = await prisma.innovationIdea.findMany({ where });
        res.json(ideas);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch ideas' });
    }
});

// Update idea status & review (Admin only)
router.put('/:id', authenticate, authorize(['ADMIN']), async (req, res) => {
    try {
        const { status, adminFeedback, fundingAmount } = req.body;

        // If approved and no funding amount provided, use budget as default
        let finalFundingAmount = fundingAmount ? parseFloat(fundingAmount) : null;
        if (status === 'Approved' && !finalFundingAmount) {
            const currentIdea = await prisma.innovationIdea.findUnique({ where: { id: parseInt(req.params.id) } });
            if (currentIdea) finalFundingAmount = currentIdea.budget;
        }

        const idea = await prisma.innovationIdea.update({
            where: { id: parseInt(req.params.id) },
            data: {
                status,
                adminFeedback,
                fundingAmount: finalFundingAmount,
                reviewedBy: req.user.id,
                reviewedAt: new Date()
            },
        });

        // Log Activity if funded
        if (status === 'Approved' && parseFloat(fundingAmount) > 0) {
            await prisma.activity.create({
                data: {
                    type: 'INNOVATION_FUNDED',
                    description: `Innovation funded: "${idea.title}" with $${fundingAmount}`
                }
            });
        } else if (status === 'Approved' || status === 'Rejected') {
            await prisma.activity.create({
                data: {
                    type: 'INNOVATION_REVIEWED',
                    description: `Innovation review completed: "${idea.title}" - Status: ${status}`
                }
            });
        }

        res.json(idea);
    } catch (error) {
        res.status(400).json({ error: 'Failed to update idea' });
    }
});

module.exports = router;
