import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import prisma from '../prisma';

const router = Router();
router.use(authenticate);

router.get('/metrics', async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role;

    const taskFilter = role === 'ADMIN' ? {} : {
      project: { memberIds: { has: userId } }
    };

    const totalTasks = await prisma.task.count({ where: taskFilter });
    const todoTasks = await prisma.task.count({ where: { ...taskFilter, status: 'TODO' } });
    const inProgressTasks = await prisma.task.count({ where: { ...taskFilter, status: 'IN_PROGRESS' } });
    const doneTasks = await prisma.task.count({ where: { ...taskFilter, status: 'DONE' } });
    
    const overdueTasks = await prisma.task.count({
      where: {
        ...taskFilter,
        status: { not: 'DONE' },
        dueDate: { lt: new Date() }
      }
    });

    const upcomingTasks = await prisma.task.findMany({
      where: {
        ...taskFilter,
        status: { not: 'DONE' },
        dueDate: { not: null }
      },
      orderBy: { dueDate: 'asc' },
      take: 5,
      include: { project: { select: { name: true } } }
    });

    res.json({
      totalTasks,
      todoTasks,
      inProgressTasks,
      doneTasks,
      overdueTasks,
      upcomingTasks,
      // Personal stats for dashboard
      personalCompleted: await prisma.task.count({ where: { assigneeId: userId, status: 'DONE' } }),
      personalPending: await prisma.task.count({ where: { assigneeId: userId, status: { not: 'DONE' } } })
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/analytics', async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role;

    const taskFilter = role === 'ADMIN' ? {} : {
      project: { memberIds: { has: userId } }
    };

    // 1. Task Status Distribution
    const todoTasks = await prisma.task.count({ where: { ...taskFilter, status: 'TODO' } });
    const inProgressTasks = await prisma.task.count({ where: { ...taskFilter, status: 'IN_PROGRESS' } });
    const doneTasks = await prisma.task.count({ where: { ...taskFilter, status: 'DONE' } });
    
    const taskStatusCounts = [
      { name: 'To Do', value: todoTasks },
      { name: 'In Progress', value: inProgressTasks },
      { name: 'Done', value: doneTasks },
    ].filter(s => s.value > 0);

    // 2. Member Contributions
    let userFilter = {};
    if (role !== 'ADMIN') {
      // In MongoDB, we find users who are part of projects that the current user is also part of
      const userProjects = await prisma.project.findMany({
        where: { memberIds: { has: userId } },
        select: { memberIds: true }
      });
      const allTeamMemberIds = Array.from(new Set(userProjects.flatMap(p => p.memberIds)));
      userFilter = { id: { in: allTeamMemberIds } };
    }
    
    const members = await prisma.user.findMany({
      where: userFilter,
      select: { id: true, name: true }
    });

    const memberContributions = await Promise.all(members.map(async (member) => {
      const completed = await prisma.task.count({ where: { ...taskFilter, assigneeId: member.id, status: 'DONE' } });
      const pending = await prisma.task.count({ where: { ...taskFilter, assigneeId: member.id, status: { not: 'DONE' } } });
      return { name: member.name, completed, pending };
    }));

    // Filter out members who have 0 tasks assigned to them across these projects to keep chart clean
    const activeMemberContributions = memberContributions.filter(m => m.completed > 0 || m.pending > 0);

    // 3. Project Progress
    const projectsFilter = role === 'ADMIN' ? {} : { memberIds: { has: userId } };
    const projects = await prisma.project.findMany({
      where: projectsFilter,
      select: { id: true, name: true }
    });

    const projectProgress = await Promise.all(projects.map(async (p) => {
      const total = await prisma.task.count({ where: { projectId: p.id } });
      const completed = await prisma.task.count({ where: { projectId: p.id, status: 'DONE' } });
      return { name: p.name, completed, total };
    }));

    res.json({
      taskStatusCounts,
      memberContributions: activeMemberContributions,
      projectProgress
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
