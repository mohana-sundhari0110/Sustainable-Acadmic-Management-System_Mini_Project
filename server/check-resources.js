const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkResources() {
    try {
        const courses = await prisma.course.findMany({
            include: {
                assignments: true,
                _count: { select: { enrollments: true } }
            }
        });

        console.log('--- COURSES ---');
        courses.forEach(c => {
            console.log(`Course: ${c.title} (ID: ${c.id})`);
            console.log(` - Assignments: ${c.assignments.length}`);
            console.log(` - Enrollments: ${c._count.enrollments}`);
        });

        const schedules = await prisma.classSchedule.findMany({});
        console.log('\n--- SCHEDULES ---');
        schedules.forEach(s => {
            console.log(`Schedule for: ${s.courseName} (${s.dayOfWeek} ${new Date(s.startTime).toLocaleTimeString()})`);
        });

    } catch (err) {
        console.error(err);
    } finally {
        await prisma.$disconnect();
    }
}

checkResources();
