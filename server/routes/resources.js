const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// --- Classrooms ---

// Get all classrooms
router.get('/classrooms', authenticate, async (req, res) => {
    try {
        const classrooms = await prisma.classroom.findMany();
        res.json(classrooms);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add classroom (Admin)
router.post('/classrooms', authenticate, authorize(['ADMIN']), async (req, res) => {
    try {
        const { roomNumber, capacity, building } = req.body;
        const classroom = await prisma.classroom.create({
            data: { roomNumber, capacity: parseInt(capacity), building }
        });
        res.status(201).json(classroom);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// --- Smart Classroom Allocation ---

// Get suitable classrooms for a given capacity and time slot
router.get('/classrooms/suitable', authenticate, authorize(['ADMIN']), async (req, res) => {
    try {
        const { studentsCount, dayOfWeek, startTime, endTime } = req.query;
        const count = parseInt(studentsCount);

        // 1. Find all classrooms with capacity >= studentsCount
        // 2. Filter out those with conflicting schedules
        const availableClassrooms = await prisma.classroom.findMany({
            where: {
                capacity: { gte: count },
                availability: true,
                schedules: {
                    none: {
                        dayOfWeek,
                        OR: [
                            {
                                startTime: { lt: new Date(endTime) },
                                endTime: { gt: new Date(startTime) }
                            }
                        ]
                    }
                }
            },
            orderBy: {
                capacity: 'asc' // Prioritize smaller suitable rooms for efficiency
            }
        });

        res.json(availableClassrooms);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create class schedule (Smart Allocation)
router.post('/schedules', authenticate, authorize(['ADMIN']), async (req, res) => {
    try {
        const { courseName, studentsCount, dayOfWeek, startTime, endTime, classroomId } = req.body;

        let targetId = classroomId;

        // Auto-allocate if classroomId is not provided
        if (!targetId) {
            const suitable = await prisma.classroom.findFirst({
                where: {
                    capacity: { gte: parseInt(studentsCount) },
                    availability: true,
                    schedules: {
                        none: {
                            dayOfWeek,
                            OR: [
                                {
                                    startTime: { lt: new Date(endTime) },
                                    endTime: { gt: new Date(startTime) }
                                }
                            ]
                        }
                    }
                },
                orderBy: { capacity: 'asc' }
            });

            if (!suitable) {
                return res.status(404).json({ error: 'No suitable classroom available for this slot' });
            }
            targetId = suitable.id;
        }

        const schedule = await prisma.classSchedule.create({
            data: {
                courseName,
                studentsCount: parseInt(studentsCount),
                dayOfWeek,
                startTime: new Date(startTime),
                endTime: new Date(endTime),
                classroom: { connect: { id: targetId } }
            }
        });

        res.status(201).json(schedule);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get schedules (Student/Admin)
router.get('/schedules', authenticate, async (req, res) => {
    try {
        const schedules = await prisma.classSchedule.findMany({
            include: { classroom: true }
        });
        res.json(schedules);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- Lab Equipment ---

// Get all equipment
router.get('/equipment', authenticate, async (req, res) => {
    try {
        const equipment = await prisma.equipment.findMany();
        res.json(equipment);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add equipment (Admin)
router.post('/equipment', authenticate, authorize(['ADMIN']), async (req, res) => {
    try {
        const equipment = await prisma.equipment.create({ data: req.body });
        res.status(201).json(equipment);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Book equipment (Student/Admin)
router.post('/equipment/book', authenticate, authorize(['STUDENT', 'ADMIN']), async (req, res) => {
    try {
        const { equipmentId, startTime, endTime } = req.body;
        const equipId = parseInt(equipmentId);

        if (isNaN(equipId)) {
            return res.status(400).json({ error: 'Invalid equipment ID' });
        }

        // Check if equipment exists and is available
        const equipment = await prisma.equipment.findUnique({
            where: { id: equipId }
        });

        if (!equipment) {
            return res.status(404).json({ error: 'Equipment not found' });
        }

        if (equipment.status !== 'Available') {
            return res.status(400).json({ error: `Equipment is currently ${equipment.status}` });
        }

        // Conflict check
        const conflict = await prisma.equipmentBooking.findFirst({
            where: {
                equipmentId: equipId,
                status: { in: ['PENDING', 'APPROVED'] },
                OR: [
                    {
                        startTime: { lt: new Date(endTime) },
                        endTime: { gt: new Date(startTime) }
                    }
                ]
            }
        });

        if (conflict) {
            return res.status(409).json({ error: 'Equipment already booked for this time slot' });
        }

        const booking = await prisma.equipmentBooking.create({
            data: {
                studentId: req.user.id,
                equipmentId: equipId,
                startTime: new Date(startTime),
                endTime: new Date(endTime)
            }
        });

        res.status(201).json(booking);
    } catch (error) {
        console.error('Booking error:', error);
        res.status(400).json({ error: error.message });
    }
});

// Get bookings (Student/Admin)
router.get('/equipment/bookings', authenticate, async (req, res) => {
    try {
        let where = {};
        if (req.user.role === 'STUDENT') {
            where.studentId = req.user.id;
        }

        const bookings = await prisma.equipmentBooking.findMany({
            where,
            include: { equipment: true, student: { select: { name: true, email: true } } }
        });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Approve/Reject booking (Admin)
router.patch('/equipment/bookings/:id', authenticate, authorize(['ADMIN']), async (req, res) => {
    try {
        const { status } = req.body;
        const booking = await prisma.equipmentBooking.update({
            where: { id: parseInt(req.params.id) },
            data: { status }
        });
        res.json(booking);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
