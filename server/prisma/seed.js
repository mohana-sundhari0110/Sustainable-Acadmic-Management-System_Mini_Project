const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
    console.log('Cleaning up data...');
    await prisma.activity.deleteMany();
    await prisma.energyUsage.deleteMany();
    await prisma.equipmentBooking.deleteMany();
    await prisma.innovationIdea.deleteMany();
    await prisma.submission.deleteMany();
    await prisma.quizResult.deleteMany();
    await prisma.enrollment.deleteMany();
    await prisma.assignment.deleteMany();
    await prisma.course.deleteMany();
    await prisma.classSchedule.deleteMany();
    await prisma.classroom.deleteMany();
    await prisma.equipment.deleteMany();
    await prisma.user.deleteMany();

    const adminPassword = await bcrypt.hash('admin123', 10);
    const studentPassword = await bcrypt.hash('student123', 10);

    // --- Users ---
    const admin = await prisma.user.upsert({
        where: { email: 'admin@sams.edu' },
        update: {},
        create: {
            email: 'admin@sams.edu',
            name: 'Admin User',
            password: adminPassword,
            role: 'ADMIN',
        },
    });

    const studentsData = [
        { email: 'student1@sams.edu', name: 'Alice Johnson', reg: 'S2026001', dept: 'Computer Science', year: '3rd' },
        { email: 'student2@sams.edu', name: 'Bob Smith', reg: 'S2026002', dept: 'Mechanical Engineering', year: '2nd' },
        { email: 'student@sams.edu', name: 'Charlie Brown', reg: 'S2026003', dept: 'Environmental Science', year: '4th' },
        { email: 'student4@sams.edu', name: 'Diana Prince', reg: 'S2026004', dept: 'Civil Engineering', year: '1st' },
        { email: 'student5@sams.edu', name: 'Ethan Hunt', reg: 'S2026005', dept: 'Electrical Engineering', year: '2nd' },
        { email: 'student6@sams.edu', name: 'Fiona Gallagher', reg: 'S2026006', dept: 'Architecture', year: '5th' },
        { email: 'student7@sams.edu', name: 'George Miller', reg: 'S2026007', dept: 'Biology', year: '3rd' }
    ];

    const students = [];
    for (const s of studentsData) {
        const createdStudent = await prisma.user.upsert({
            where: { email: s.email },
            update: {},
            create: {
                email: s.email,
                name: s.name,
                password: studentPassword,
                role: 'STUDENT',
                greenPoints: Math.floor(Math.random() * 500),
                registerNumber: s.reg,
                department: s.dept,
                year: s.year
            },
        });
        students.push(createdStudent);
    }

    // --- Courses ---
    const coursesData = [
        { title: 'Sustainable Development Basics', code: 'SDB101', instructor: 'Dr. Green', duration: 12, category: 'General', status: 'Active' },
        { title: 'Environmental Innovation Lab', code: 'EIL202', instructor: 'Dr. Sarah', duration: 12, category: 'Climate Action', status: 'Active' },
        { title: 'Renewable Energy Systems', code: 'RES404', instructor: 'Prof. Miller', duration: 12, category: 'Renewable Energy', status: 'Active' },
        { title: 'Waste Management Strategy', code: 'WMS505', instructor: 'Dr. Waste', duration: 12, category: 'Waste Management', status: 'Active' },
        { title: 'Circular Economy Principles', code: 'CEP303', instructor: 'Prof. Round', duration: 10, category: 'General', status: 'Active' },
        { title: 'Sustainable Architecture', code: 'ARC606', instructor: 'Ar. Build', duration: 14, category: 'Climate Action', status: 'Active' }
    ];

    const courses = [];
    for (const c of coursesData) {
        const createdCourse = await prisma.course.upsert({
            where: { code: c.code },
            update: {},
            create: { ...c, description: `Comprehensive study of ${c.title}.` },
        });
        courses.push(createdCourse);

        // Add an assignment for each course
        await prisma.assignment.create({
            data: {
                title: `${c.title} Implementation Report`,
                type: 'upload',
                description: 'Submit your findings in PDF format.',
                totalMarks: 10,
                deadline: new Date(Date.now() + (Math.floor(Math.random() * 20) + 10) * 24 * 60 * 60 * 1000),
                courseId: createdCourse.id
            }
        });
    }

    // --- Innovation Ideas ---
    const ideasData = [
        {
            title: 'Solar Powered Campus Wi-Fi',
            problem: 'Instability of power grid affecting connectivity.',
            solution: 'Install small solar arrays on existing Wi-Fi poles.',
            impact: 'Reduced grid dependence and zero downtime.',
            budget: 5000,
            fundingAmount: 4500,
            category: 'Renewable Energy',
            status: 'Approved',
            studentId: students[0].id
        },
        {
            title: 'IoT Waste Bin Sensors',
            problem: 'Inefficient garbage collection routes.',
            solution: 'Sensors to notify when bins are 80% full.',
            impact: '40% reduction in fuel consumption for collection trucks.',
            budget: 2500,
            category: 'Waste Management',
            status: 'Pending',
            studentId: students[1].id
        },
        {
            title: 'Campus Composting Program',
            problem: 'Large amount of organic waste from cafeteria.',
            solution: 'On-site composting facility for landscaping use.',
            impact: 'Zero organic waste to landfill, free fertilizer.',
            budget: 3000,
            fundingAmount: 3000,
            category: 'Waste Management',
            status: 'Approved',
            studentId: students[2].id
        },
        {
            title: 'Smart Lighting System',
            problem: 'Lights left on in empty classrooms.',
            solution: 'Motion sensor based LED lighting.',
            impact: '30% reduction in campus electricity bill.',
            budget: 12000,
            category: 'Renewable Energy',
            status: 'Pending',
            studentId: students[3].id
        },
        {
            title: 'Rainwater Harvesting for Gardens',
            problem: 'High water usage for campus landscaping.',
            solution: 'Roof collection systems and underground storage.',
            impact: '60% reduction in fresh water demand for gardening.',
            budget: 8500,
            fundingAmount: 8000,
            category: 'Water Conservation',
            status: 'Approved',
            studentId: students[4].id
        }
    ];

    for (const idea of ideasData) {
        await prisma.innovationIdea.create({ data: idea });
    }

    // --- Resource Management (Classrooms & Equipment) ---
    const classroomsData = [
        { roomNumber: '101', capacity: 30, building: 'Main Block' },
        { roomNumber: '102', capacity: 40, building: 'Main Block' },
        { roomNumber: '201', capacity: 100, building: 'Science Wing' },
        { roomNumber: 'L1', capacity: 20, building: 'Innovation Hub' },
        { roomNumber: 'L2', capacity: 25, building: 'Innovation Hub' },
        { roomNumber: '301', capacity: 50, building: 'Engineering Block' }
    ];

    for (const r of classroomsData) {
        await prisma.classroom.upsert({
            where: { roomNumber: r.roomNumber },
            update: {},
            create: r
        });
    }

    const equipmentData = [
        { name: 'Ender 3D Printer', category: '3D Printer', status: 'Available', description: 'FDM printer for sustainable prototypes.' },
        { name: 'Nvidia Jetson Kit', category: 'Robotics Kit', status: 'Available', description: 'AI development board for edge computing.' },
        { name: 'Sustainability Server', category: 'Computer Lab', status: 'Available', description: 'High performance node for climate modeling.' },
        { name: 'Solar Panel Test Rig', category: 'Renewable Energy', status: 'Available', description: 'Measurement tools for PV cell efficiency.' },
        { name: 'Water Quality Tester', category: 'Testing Kit', status: 'Available', description: 'Digital sensors for pH and purity.' }
    ];

    const equipments = [];
    for (const e of equipmentData) {
        const createdEquip = await prisma.equipment.create({ data: e });
        equipments.push(createdEquip);
    }

    // --- Classroom Schedules ---
    const classrooms = await prisma.classroom.findMany();
    const schedulesData = [
        {
            courseName: 'Sustainable Dev 101',
            studentsCount: 25,
            dayOfWeek: 'Monday',
            startTime: new Date(new Date().setHours(10, 0, 0, 0)),
            endTime: new Date(new Date().setHours(12, 0, 0, 0)),
            classroomId: classrooms[0].id
        },
        {
            courseName: 'Eco-Innovation Lab',
            studentsCount: 15,
            dayOfWeek: 'Wednesday',
            startTime: new Date(new Date().setHours(14, 0, 0, 0)),
            endTime: new Date(new Date().setHours(16, 0, 0, 0)),
            classroomId: classrooms[3].id // Lab
        },
        {
            courseName: 'Circular Economy 303',
            studentsCount: 35,
            dayOfWeek: 'Tuesday',
            startTime: new Date(new Date().setHours(9, 0, 0, 0)),
            endTime: new Date(new Date().setHours(11, 0, 0, 0)),
            classroomId: classrooms[1].id
        }
    ];

    for (const s of schedulesData) {
        await prisma.classSchedule.create({ data: s });
    }

    // --- Energy Usage Records ---
    const energyData = [
        { labName: 'Robotics Wing', consumption: 45.5, recordedBy: admin.id, date: new Date() },
        { labName: 'Main Library', consumption: 120.2, recordedBy: admin.id, date: new Date() },
        { labName: 'Innovation Hub', consumption: 35.8, recordedBy: admin.id, date: new Date() },
        { classroomId: classrooms[0].id, consumption: 15.2, recordedBy: admin.id, date: new Date() },
        { labName: 'Solar Testing Site', consumption: 2.5, recordedBy: admin.id, date: new Date() },
        { classroomId: classrooms[1].id, consumption: 12.8, recordedBy: admin.id, date: new Date() },
        { classroomId: classrooms[2].id, consumption: 45.0, recordedBy: admin.id, date: new Date() }
    ];

    for (const en of energyData) {
        await prisma.energyUsage.create({ data: en });
    }

    console.log('Seed data updated successfully:');
    console.log(`- Admin: ${admin.email}`);
    console.log(`- Students: ${students.length}`);
    console.log(`- Courses: ${courses.length}`);
    console.log(`- Innovation Ideas: ${ideasData.length}`);
    console.log(`- Classrooms: ${classroomsData.length}`);
    console.log(`- Equipment: ${equipmentData.length}`);
    console.log(`- Schedules: ${schedulesData.length}`);
    console.log(`- Energy Records: ${energyData.length}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
