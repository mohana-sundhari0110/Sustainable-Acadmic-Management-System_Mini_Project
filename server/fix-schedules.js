const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixSchedules() {
    try {
        // Update schedules to match Course titles exactly
        await prisma.classSchedule.updateMany({
            where: { courseName: 'Sustainable Dev 101' },
            data: { courseName: 'Sustainable Development Basics' }
        });

        await prisma.classSchedule.updateMany({
            where: { courseName: 'Eco-Innovation Lab' },
            data: { courseName: 'Environmental Innovation Lab' }
        });

        // Add a schedule for Renewable Energy Systems if it doesn't exist
        const renewableSchedules = await prisma.classSchedule.findMany({
            where: { courseName: 'Renewable Energy Systems' }
        });

        if (renewableSchedules.length === 0) {
            const classroom = await prisma.classroom.findFirst();
            if (classroom) {
                await prisma.classSchedule.create({
                    data: {
                        courseName: 'Renewable Energy Systems',
                        studentsCount: 30,
                        startTime: new Date('2026-03-09T09:00:00Z'),
                        endTime: new Date('2026-03-09T11:00:00Z'),
                        dayOfWeek: 'Monday',
                        classroomId: classroom.id
                    }
                });
            }
        }

        console.log('Schedules updated successfully');

    } catch (err) {
        console.error(err);
    } finally {
        await prisma.$disconnect();
    }
}

fixSchedules();
