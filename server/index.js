const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes placeholder
app.get('/', (req, res) => {
    res.send('SAMS API is running');
});

// Auth Routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// Course Routes
const courseRoutes = require('./routes/courses');
app.use('/api/admin/courses', courseRoutes);

// Assignment Routes
const assignmentRoutes = require('./routes/assignments');
app.use('/api/assignments', assignmentRoutes);

// Innovation Routes
const innovationRoutes = require('./routes/innovations');
app.use('/api/innovations', innovationRoutes);

// Tracker Routes
const trackerRoutes = require('./routes/trackers');
app.use('/api/trackers', trackerRoutes);

// Student Routes
const studentsRoutes = require('./routes/students');
app.use('/api/admin/students', studentsRoutes);

// Resource Management Routes
const resourceRoutes = require('./routes/resources');
app.use('/api/resources', resourceRoutes);

// Energy Monitoring Routes
const energyRoutes = require('./routes/energy');
app.use('/api/energy', energyRoutes);

// Dashboard Routes
const dashboardRoutes = require('./routes/dashboard');
app.use('/api/admin/dashboard', dashboardRoutes);

// Marketplace Routes
const marketplaceRoutes = require('./routes/marketplace');
app.use('/api/marketplace', marketplaceRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
