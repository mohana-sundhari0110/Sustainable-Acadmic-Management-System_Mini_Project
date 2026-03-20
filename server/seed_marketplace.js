const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Finding user...");
    let user = await prisma.user.findFirst({ where: { role: 'STUDENT' } });
    
    if (!user) {
        user = await prisma.user.findFirst();
    }
    
    if (!user) {
        user = await prisma.user.create({
            data: {
                name: 'Eco Student',
                email: 'eco@student.com',
                password: 'password123',
                role: 'STUDENT',
                greenPoints: 50
            }
        });
    }

    console.log(`Using user ${user.name} (${user.id}) as the seller...`);

    const products = [
        {
            name: 'Reusable Stainless Steel Water Bottle',
            description: 'A 500ml double-walled vacuum insulated water bottle. Keeps drinks cold for 24 hours. Ditch single-use plastic!',
            price: 15.00,
            category: 'Reusable',
            condition: 'New',
            imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
            ecoPoints: 15,
            sellerId: user.id,
            status: 'APPROVED'
        },
        {
            name: 'Handcrafted Organic Cotton Tote Bag',
            description: 'Perfect for groceries and daily use. Made from 100% organic cotton, naturally dyed without harmful chemicals.',
            price: 8.50,
            category: 'Organic',
            condition: 'New',
            imageUrl: 'https://images.unsplash.com/photo-1597484661643-2f5fef640df1?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
            ecoPoints: 10,
            sellerId: user.id,
            status: 'APPROVED'
        },
        {
            name: 'Upcycled Denim Pencil Case',
            description: 'Hand sewn from old reclaimed jeans. A durable and stylish way to carry your pens while reducing textile waste.',
            price: 5.00,
            category: 'Upcycled',
            condition: 'Used - Good',
            imageUrl: 'https://images.unsplash.com/photo-1628151015968-3a4429e9ef04?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
            ecoPoints: 5,
            sellerId: user.id,
            status: 'APPROVED'
        },
        {
            name: 'Recycled Paper Notebooks (3 Pack)',
            description: 'Notebooks made entirely from 100% post-consumer recycled paper. Unlined, great for sketching or taking class notes.',
            price: 12.00,
            category: 'Recycled',
            condition: 'New',
            imageUrl: 'https://images.unsplash.com/photo-1531346878377-a541e4ab0e93?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
            ecoPoints: 20,
            sellerId: user.id,
            status: 'APPROVED'
        },
        {
            name: 'Bamboo Toothbrush Set',
            description: 'Set of 4 biodegradable bamboo toothbrushes with charcoal bristles. A zero waste bathroom essential.',
            price: 10.00,
            category: 'Reusable',
            condition: 'New',
            imageUrl: 'https://images.unsplash.com/photo-1607547024148-35aa833e728e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
            ecoPoints: 10,
            sellerId: user.id,
            status: 'PENDING'
        }
    ];

    console.log("Clearing existing products...");
    await prisma.product.deleteMany({});
    
    console.log("Adding new mock products...");
    for (const p of products) {
        await prisma.product.create({ data: p });
    }

    console.log("Seeded products successfully!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
