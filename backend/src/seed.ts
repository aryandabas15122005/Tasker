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

  // Admin User: Aryan
  const admin = await prisma.user.create({
    data: { name: 'Aryan', email: 'aryan@demo.com', passwordHash, role: 'ADMIN' }
  });

  // Member 1: Sneha
  const member1 = await prisma.user.create({
    data: { name: 'Sneha', email: 'sneha@demo.com', passwordHash, role: 'MEMBER' }
  });

  // Member 2: Ria
  const member2 = await prisma.user.create({
    data: { name: 'Ria', email: 'ria@demo.com', passwordHash, role: 'MEMBER' }
  });

  // Member 3: Jatin
  const member3 = await prisma.user.create({
    data: { name: 'Jatin', email: 'jatin@demo.com', passwordHash, role: 'MEMBER' }
  });

  const project = await prisma.project.create({
    data: {
      name: 'Tasker Website Redesign',
      ownerId: admin.id,
      guidelines: '1. Update the color scheme to the new Tasker Teal identity\n2. Improve responsiveness across all devices\n3. Integrate the new Analytics dashboard\n4. Add OTP email verification on signup',
      members: {
        connect: [{ id: admin.id }, { id: member1.id }, { id: member2.id }, { id: member3.id }]
      }
    }
  });

  await prisma.task.createMany({
    data: [
      { title: 'Brand Identity Design', description: 'Create the new Tasker logo and color palette (Teal & Amber).', status: 'DONE', projectId: project.id, assigneeId: admin.id, dueDate: new Date('2026-05-10') },
      { title: 'Landing Page Mockups', description: 'Create high-fidelity mockups for the new split-screen login and dashboard.', status: 'DONE', projectId: project.id, assigneeId: member1.id, dueDate: new Date('2026-05-12') },
      { title: 'Frontend Implementation', description: 'Build the new Tasker dashboard components using React and DM Sans font.', status: 'IN_PROGRESS', projectId: project.id, assigneeId: admin.id, dueDate: new Date(Date.now() + 86400000) },
      { title: 'Analytics Integration', description: 'Implement Recharts for the team performance visualization.', status: 'TODO', projectId: project.id, assigneeId: member2.id, dueDate: new Date(Date.now() + 172800000) },
      { title: 'Database Migration', description: 'Move from SQLite to MongoDB Atlas for production scalability.', status: 'DONE', projectId: project.id, assigneeId: member3.id, dueDate: new Date('2026-05-14') },
      { title: 'Railway Deployment', description: 'Configure environment variables and link the GitHub repo to Railway.', status: 'TODO', projectId: project.id, assigneeId: admin.id, dueDate: new Date(Date.now() + 259200000) },
    ]
  });

  console.log('Database seeded successfully in MongoDB Atlas!');
  console.log('Demo Accounts (Password: password123):');
  console.log('  Admin (Aryan): aryan@demo.com');
  console.log('  Member (Sneha): sneha@demo.com');
  console.log('  Member (Ria): ria@demo.com');
  console.log('  Member (Jatin): jatin@demo.com');
};

seed()
  .catch(console.error)
  .then(() => prisma.$disconnect());
