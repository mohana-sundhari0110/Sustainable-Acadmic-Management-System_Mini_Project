const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Add a helper function to create notifications
async function createNotification(userId, message, type) {
    await prisma.notification.create({
        data: { userId, message, type }
    });
}

// ============== PRODUCT ROUTES ==============

// 1. Get all APPROVED products (for marketplace browsing)
router.get('/', authenticate, async (req, res) => {
    try {
        const { category, search } = req.query;
        let whereClause = { status: 'APPROVED' };

        if (category && category !== 'All') {
            whereClause.category = category;
        }

        if (search) {
            whereClause.name = { contains: search };
            // In sqlite we can't do mode: 'insensitive' typically, so basic contains
        }

        const products = await prisma.product.findMany({
            where: whereClause,
            include: {
                seller: { select: { id: true, name: true, department: true } },
                reviews: true
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(products);
    } catch (error) {
        console.error("Fetch products error:", error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

// 2. Get my products OR all products (Admin)
router.get('/manage', authenticate, async (req, res) => {
    try {
        const whereClause = req.user.role === 'ADMIN' ? {} : { sellerId: req.user.id };
        const products = await prisma.product.findMany({
            where: whereClause,
            include: {
                seller: { select: { name: true, email: true } },
                orders: { include: { buyer: { select: { name: true, email: true } } } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch managed products' });
    }
});

// 3. Create a new product (Student)
router.post('/', authenticate, async (req, res) => {
    try {
        const { name, description, price, category, condition, imageUrl, ecoPoints } = req.body;
        
        const product = await prisma.product.create({
            data: {
                name,
                description,
                price: parseFloat(price),
                category: category || "General",
                condition,
                imageUrl,
                ecoPoints: parseInt(ecoPoints) || 10,
                sellerId: req.user.id
            }
        });

        res.status(201).json(product);
    } catch (error) {
        console.error("Create product error:", error);
        res.status(400).json({ error: 'Failed to create product' });
    }
});

// 4. Update product status (Admin)
router.put('/:id/status', authenticate, authorize(['ADMIN']), async (req, res) => {
    try {
        const { status } = req.body;
        const productId = parseInt(req.params.id);

        const product = await prisma.product.update({
            where: { id: productId },
            data: { status }
        });

        // Notify seller
        await createNotification(
            product.sellerId,
            `Your product "${product.name}" has been ${status}.`,
            'PRODUCT_APPROVED'
        );

        res.json(product);
    } catch (error) {
        res.status(400).json({ error: 'Failed to update product status' });
    }
});


// ============== ORDER ROUTES ==============

// 5. Request to buy an item
router.post('/:id/order', authenticate, async (req, res) => {
    try {
        const productId = parseInt(req.params.id);
        
        const product = await prisma.product.findUnique({ where: { id: productId } });
        if (!product || product.status !== 'APPROVED') {
            return res.status(400).json({ error: "Product not available" });
        }
        if (product.sellerId === req.user.id) {
            return res.status(400).json({ error: "You cannot buy your own product" });
        }

        const existingOrder = await prisma.order.findFirst({
            where: { productId, buyerId: req.user.id }
        });

        if (existingOrder) {
            return res.status(400).json({ error: "You have already requested this item" });
        }

        const order = await prisma.order.create({
            data: {
                productId,
                buyerId: req.user.id
            }
        });

        // Notify seller
        await createNotification(
            product.sellerId,
            `${req.user.name} has requested to buy "${product.name}".`,
            'NEW_ORDER'
        );

        res.status(201).json(order);
    } catch (error) {
        res.status(400).json({ error: 'Failed to request order' });
    }
});

// 6. Manage order status (Seller completing order)
router.put('/orders/:id/status', authenticate, async (req, res) => {
    try {
        const orderId = parseInt(req.params.id);
        const { status } = req.body;

        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { product: true }
        });

        if (!order) return res.status(404).json({ error: "Order not found" });

        // Ensure only seller can update status, or maybe admin
        if (order.product.sellerId !== req.user.id && req.user.role !== 'ADMIN') {
            return res.status(403).json({ error: "Unauthorized" });
        }

        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: { status }
        });

        // Notify buyer
        await createNotification(
            order.buyerId,
            `Your order for "${order.product.name}" is now ${status}.`,
            'ORDER_UPDATE'
        );

        // If completed, distribute green points
        if (status === 'COMPLETED') {
            const ecoPoints = order.product.ecoPoints;

            // Give points to buyer
            await prisma.user.update({
                where: { id: order.buyerId },
                data: { greenPoints: { increment: ecoPoints } }
            });

            // Give points to seller
            await prisma.user.update({
                where: { id: order.product.sellerId },
                data: { greenPoints: { increment: ecoPoints } }
            });
        }

        res.json(updatedOrder);
    } catch (error) {
        res.status(400).json({ error: 'Failed to update order status' });
    }
});


// ============== LEADERBOARD & REVIEWS ==============

// 7. Get leaderboard
router.get('/leaderboard', authenticate, async (req, res) => {
    try {
        const leaderboard = await prisma.user.findMany({
            where: { greenPoints: { gt: 0 } },
            orderBy: { greenPoints: 'desc' },
            take: 10,
            select: { id: true, name: true, department: true, greenPoints: true }
        });
        res.json(leaderboard);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
});

// 8. Submit review
router.post('/:id/review', authenticate, async (req, res) => {
    try {
        const productId = parseInt(req.params.id);
        const { rating, comment } = req.body;

        // Ensure user bought the product
        const order = await prisma.order.findFirst({
            where: { productId, buyerId: req.user.id, status: 'COMPLETED' }
        });

        if (!order && req.user.role !== 'ADMIN') {
            return res.status(403).json({ error: "You can only review products you have purchased" });
        }

        const review = await prisma.productReview.create({
            data: {
                productId,
                reviewerId: req.user.id,
                rating: parseInt(rating),
                comment
            }
        });

        res.status(201).json(review);
    } catch (error) {
        res.status(400).json({ error: 'Failed to submit review' });
    }
});

// Get user notifications
router.get('/notifications', authenticate, async (req, res) => {
    try {
        const notifs = await prisma.notification.findMany({
            where: { userId: req.user.id },
            orderBy: { createdAt: 'desc' }
        });
        res.json(notifs);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch notifications" });
    }
});

// Mark all as read
router.put('/notifications/read', authenticate, async (req, res) => {
    try {
        await prisma.notification.updateMany({
            where: { userId: req.user.id, isRead: false },
            data: { isRead: true }
        });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: "Failed to update notifications" });
    }
});

module.exports = router;
