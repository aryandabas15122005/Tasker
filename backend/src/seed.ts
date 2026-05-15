import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const seed = async () => {
  // Clear existing data in MongoDB Atlas
  await prisma.task.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.otpVerification.deleteMany({});

  const passwordHash = await bcrypt.hash('password123', 10);

  // Admin User: Arjun Singh
  const admin = await prisma.user.create({
    data: { name: 'Arjun Singh', email: 'admin@demo.com', passwordHash, role: 'ADMIN' }
  });

  // Member 1: Sheena Bajaj
  const member1 = await prisma.user.create({
    data: { name: 'Sheena Bajaj', email: 'alice@demo.com', passwordHash, role: 'MEMBER' }
  });

  // Member 2: Ronit Dabas
  const member2 = await prisma.user.create({
    data: { name: 'Ronit Dabas', email: 'ronit@demo.com', passwordHash, role: 'MEMBER' }
  });

  const project = await prisma.project.create({
    data: {
      name: 'Tasker Website Redesign',
      ownerId: admin.id,
      guidelines: '1. Update the color scheme to the new Tasker Teal identity\n2. Improve responsiveness across all devices\n3. Integrate the new Analytics dashboard\n4. Add OTP email verification on signup',
      members: {
        connect: [{ id: admin.id }, { id: member1.id }, { id: member2.id }]
      }
    }
  });

  await prisma.task.createMany({
    data: [
      { title: 'Brand Identity Design', description: 'Create the new Tasker logo and color palette (Teal & Amber).', status: 'DONE', projectId: project.id, assigneeId: admin.id, dueDate: new Date('2026-05-10') },
      { title: 'Landing Page Mockups', description: 'Create high-fidelity mockups for the new split-screen login and dashboard.', status: 'DONE', projectId: project.id, assigneeId: member1.id, dueDate: new Date('2026-05-12') },
      { title: 'Frontend Implementation', description: 'Build the new Tasker dashboard components using React and DM Sans font.', status: 'IN_PROGRESS', projectId: project.id, assigneeId: admin.id, dueDate: new Date(Date.now() + 86400000) },
      { title: 'Analytics Integration', description: 'Implement Recharts for the team performance visualization.', status: 'TODO', projectId: project.id, assigneeId: member1.id, dueDate: new Date(Date.now() + 172800000) },
      { title: 'Database Migration', description: 'Move from SQLite to MongoDB Atlas for production scalability.', status: 'DONE', projectId: project.id, assigneeId: member2.id, dueDate: new Date('2026-05-14') },
      { title: 'Railway Deployment', description: 'Configure environment variables and link the GitHub repo to Railway.', status: 'TODO', projectId: project.id, assigneeId: admin.id, dueDate: new Date(Date.now() + 259200000) },
    ]
  });

  console.log('Database seeded successfully in MongoDB Atlas!');
  console.log('Demo Accounts:');
  console.log('  Admin (Arjun Singh): admin@demo.com / password123');
  console.log('  Member (Sheena Bajaj): alice@demo.com / password123');
  console.log('  Member (Ronit Dabas): ronit@demo.com / password123');
};

seed()
  .catch(console.error)
  .then(() => prisma.$disconnect());
