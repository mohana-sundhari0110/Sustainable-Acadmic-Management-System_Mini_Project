const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkData() {
    try {
        const student = await prisma.user.findFirst({
            where: { role: 'STUDENT' }
        });

        if (!student) {
            console.log('No student found');
            return;
        }

        console.log('Student:', student.name, 'ID:', student.id);

        const enrollments = await prisma.enrollment.findMany({
            where: { studentId: student.id },
            include: { course: true }
        });

        console.log('Enrollments:', enrollments.length);
        enrollments.forEach(e => console.log(' - Course:', e.course.title, 'Progress:', e.progress));

        const assignments = await prisma.assignment.findMany({
            where: {
                course: {
                    enrollments: {
                        some: { studentId: student.id }
                    }
                }
            },
            include: { course: true }
        });

        console.log('Total Assignments for these courses:', assignments.length);
        assignments.forEach(a => console.log(' - Assignment:', a.title, 'Course:', a.course.title, 'Deadline:', a.deadline));

    } catch (err) {
        console.error(err);
    } finally {
        await prisma.$disconnect();
    }
}

checkData();
