const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Record energy usage (Admin)
router.post('/record', authenticate, authorize(['ADMIN']), async (req, res) => {
    try {
        const { classroomId, labName, consumption } = req.body;
        const record = await prisma.energyUsage.create({
            data: {
                classroomId: classroomId ? parseInt(classroomId) : null,
                labName,
                consumption: parseFloat(consumption),
                recordedBy: req.user.id
            }
        });
        res.status(201).json(record);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get all energy records
router.get('/history', authenticate, authorize(['ADMIN']), async (req, res) => {
    try {
        const history = await prisma.energyUsage.findMany({
            include: { classroom: true },
            orderBy: { date: 'desc' }
        });
        res.json(history);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Helper for automatic energy calculation
const calculateAutomatedUsage = (records, schedules, bookings) => {
    const virtualRecords = [...records];

    // Rates constants (kWh/hr)
    const CLASSROOM_BASE_RATE = 0.5;
    const STUDENT_RATE = 0.1;
    const EQUIPMENT_RATES = {
        '3D Printer': 1.5,
        'Robotics Kit': 0.8,
        'Computer Lab': 3.0
    };

    // Add Schedules as Virtual Records
    schedules.forEach(s => {
        const durationHrs = (new Date(s.endTime) - new Date(s.startTime)) / (1000 * 60 * 60);
        const consumption = durationHrs * (CLASSROOM_BASE_RATE + (s.studentsCount * STUDENT_RATE));
        virtualRecords.push({
            classroom: s.classroom,
            classroomId: s.classroomId,
            consumption: parseFloat(consumption.toFixed(2)),
            date: s.startTime,
            isAutomated: true
        });
    });

    // Add Approved Bookings as Virtual Records
    bookings.forEach(b => {
        if (['APPROVED', 'COMPLETED'].includes(b.status)) {
            const durationHrs = (new Date(b.endTime) - new Date(b.startTime)) / (1000 * 60 * 60);
            const rate = EQUIPMENT_RATES[b.equipment.category] || 1.0;
            virtualRecords.push({
                labName: b.equipment.name,
                consumption: parseFloat((durationHrs * rate).toFixed(2)),
                date: b.startTime,
                isAutomated: true
            });
        }
    });

    return virtualRecords;
};

// Get energy stats for dashboard
router.get('/dashboard-stats', authenticate, authorize(['ADMIN']), async (req, res) => {
    try {
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

        const manualRecords = await prisma.energyUsage.findMany({
            include: { classroom: true },
            orderBy: { date: 'desc' }
        });

        const schedules = await prisma.classSchedule.findMany({
            include: { classroom: true }
        });

        const bookings = await prisma.equipmentBooking.findMany({
            include: { equipment: true }
        });

        // Merge manual data with automated activity data
        const allRecords = calculateAutomatedUsage(manualRecords, schedules, bookings);

        // Sort by date desc
        allRecords.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Current period (last 7 days)
        const currentPeriodRecords = allRecords.filter(r => new Date(r.date) >= sevenDaysAgo);
        const currentTotal = currentPeriodRecords.reduce((sum, r) => sum + r.consumption, 0);

        // Previous period (8-14 days ago)
        const previousPeriodRecords = allRecords.filter(r => new Date(r.date) >= fourteenDaysAgo && new Date(r.date) < sevenDaysAgo);
        const previousTotal = previousPeriodRecords.reduce((sum, r) => sum + r.consumption, 0);

        // Trend calculation
        let trend = 0;
        if (previousTotal > 0) {
            trend = ((currentTotal - previousTotal) / previousTotal) * 100;
        }

        // Daily breakdown for charts
        const dailyStats = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
            const dateStr = d.toISOString().split('T')[0];
            const dayTotal = allRecords
                .filter(r => new Date(r.date).toISOString().split('T')[0] === dateStr)
                .reduce((sum, r) => sum + r.consumption, 0);

            dailyStats.push({
                date: d.toLocaleDateString(undefined, { weekday: 'short' }),
                consumption: parseFloat(dayTotal.toFixed(2))
            });
        }

        // Group by facility
        const consumptionByFacility = allRecords.reduce((acc, curr) => {
            const name = curr.classroom ? `Room ${curr.classroom.roomNumber}` : curr.labName;
            acc[name] = (acc[name] || 0) + curr.consumption;
            return acc;
        }, {});

        const facilityStats = Object.keys(consumptionByFacility).map(name => ({
            name,
            consumption: consumptionByFacility[name]
        })).sort((a, b) => b.consumption - a.consumption);

        res.json({
            totalConsumption: currentTotal || allRecords.reduce((sum, r) => sum + r.consumption, 0),
            trend: parseFloat(trend.toFixed(1)),
            facilityStats,
            dailyStats,
            recentRecords: allRecords.slice(0, 8)
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete energy record (Admin)
router.delete('/:id', authenticate, authorize(['ADMIN']), async (req, res) => {
    try {
        await prisma.energyUsage.delete({
            where: { id: parseInt(req.params.id) }
        });
        res.json({ message: 'Record deleted successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
