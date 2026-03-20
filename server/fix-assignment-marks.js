const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Updating assignments with totalMarks: 0 to totalMarks: 10...');
    const result = await prisma.assignment.updateMany({
        where: {
            totalMarks: 0
        },
        data: {
            totalMarks: 10
        }
    });
    console.log(`Updated ${result.count} assignments.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
