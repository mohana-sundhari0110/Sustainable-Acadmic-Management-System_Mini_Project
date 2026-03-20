const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get Dashboard Stats (Admin only)
router.get('/stats', authenticate, authorize(['ADMIN']), async (req, res) => {
    try {
        const [studentCount, courseCount, innovationCount, fundedProjects, totalFunding] = await Promise.all([
            prisma.user.count({ where: { role: 'STUDENT' } }),
            prisma.course.count(),
            prisma.innovationIdea.count(),
            prisma.innovationIdea.count({
                where: {
                    status: { in: ['Approved', 'Completed'] }
                }
            }),
            prisma.innovationIdea.aggregate({
                where: { status: { in: ['Approved', 'Completed'] } },
                _sum: { fundingAmount: true }
            })
        ]);

        res.json({
            students: studentCount,
            courses: courseCount,
            innovations: innovationCount,
            funded: fundedProjects,
            totalFunding: totalFunding._sum.fundingAmount || 0
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

// Get Activity Feed (Admin only)
router.get('/activity', authenticate, authorize(['ADMIN']), async (req, res) => {
    try {
        const activities = await prisma.activity.findMany({
            take: 10,
            orderBy: { createdAt: 'desc' }
        });
        res.json(activities);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch activity' });
    }
});

// Get Analytics (Weekly submissions and categories)
router.get('/analytics', authenticate, authorize(['ADMIN']), async (req, res) => {
    try {
        const { range } = req.query; // '7days', '30days', 'all'
        let startDate = null;

        if (range === '7days') {
            startDate = new Date();
            startDate.setDate(startDate.getDate() - 7);
        } else if (range === '30days') {
            startDate = new Date();
            startDate.setDate(startDate.getDate() - 30);
        }

        const where = startDate ? { createdAt: { gte: startDate } } : {};

        // 1. Trend Data (Always 7 days for the chart, regardless of range? 
        // Or should it follow the range? User said "Dynamically update chart based on createdAt date." 
        // For the trend chart, we'll keep 7 days as standard unless user specifically asked for trend change. 
        // Actually, let's keep trend logic for last 7 days as it's "Weekly Trend", 
        // but category depends on range.)

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const submissions = await prisma.innovationIdea.findMany({
            where: { createdAt: { gte: sevenDaysAgo } },
            select: { createdAt: true }
        });

        // Group by day for trend
        const dailyData = {};
        for (let i = 0; i < 7; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toLocaleDateString('en-US', { weekday: 'short' });
            dailyData[dateStr] = 0;
        }

        submissions.forEach(s => {
            const day = s.createdAt.toLocaleDateString('en-US', { weekday: 'short' });
            if (dailyData[day] !== undefined) dailyData[day]++;
        });

        const trendData = Object.keys(dailyData).reverse().map(day => ({
            name: day,
            count: dailyData[day]
        }));

        // 2. Category distribution based on RANGE
        const categories = await prisma.innovationIdea.groupBy({
            where: where,
            by: ['category'],
            _count: { id: true }
        });

        const totalIdeas = categories.reduce((sum, c) => sum + c._count.id, 0);

        const categoryData = categories.map(c => ({
            name: c.category,
            value: c._count.id,
            percentage: totalIdeas > 0 ? Math.round((c._count.id / totalIdeas) * 100) : 0
        }));

        res.json({
            trend: trendData,
            categories: categoryData,
            totalIdeas: totalIdeas
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
});

module.exports = router;
