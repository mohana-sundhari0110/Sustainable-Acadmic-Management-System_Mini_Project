const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const assignments = await prisma.assignment.findMany({
        include: {
            submissions: {
                include: {
                    student: true
                }
            }
        }
    });

    console.log('Assignments in database:');
    assignments.forEach(a => {
        console.log(`- ID: ${a.id}, Title: ${a.title}, Type: ${a.type}, Total Marks: ${a.totalMarks}`);
        a.submissions.forEach(s => {
            console.log(`  * Submission by: ${s.student.name} (${s.student.email}), Score: ${s.score}, Status: ${s.status}`);
        });
    });
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
