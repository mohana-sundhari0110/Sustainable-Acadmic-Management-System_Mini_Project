const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const ideas = await prisma.innovationIdea.findMany();
    console.log('Innovation Ideas in database:');
    ideas.forEach(i => {
        console.log(`- Title: ${i.title}`);
        console.log(`  Status: ${i.status}`);
        console.log(`  Budget: ${i.budget}`);
        console.log(`  Funding Amount: ${i.fundingAmount}`);
    });

    const fundedCount = await prisma.innovationIdea.count({
        where: {
            status: { in: ['Approved', 'Completed'] },
            fundingAmount: { gt: 0 }
        }
    });
    console.log('\nFunded count (original logic):', fundedCount);

    const statusOnlyCount = await prisma.innovationIdea.count({
        where: {
            status: { in: ['Approved', 'Completed'] }
        }
    });
    console.log('Approved/Completed count (proposed logic):', statusOnlyCount);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
