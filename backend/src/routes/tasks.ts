import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import prisma from '../prisma';

const router = Router();
router.use(authenticate);

// Get tasks for a project
router.get('/project/:projectId', async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const tasks = await prisma.task.findMany({
      where: { projectId: req.params.projectId as string },
      include: { assignee: { select: { name: true, email: true } } }
    });
    res.json(tasks);
  } catch (error) {
    console.error('Tasks error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create task
router.post('/', async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { title, description, status, dueDate, projectId, assigneeId } = req.body;
    if (!title || !projectId) return res.status(400).json({ message: 'Title and Project ID required' });

    const task = await prisma.task.create({
      data: {
        title,
        description,
        status: status || 'TODO',
        dueDate: dueDate ? new Date(dueDate) : null,
        projectId,
        assigneeId
      }
    });
    res.status(201).json(task);
  } catch (error) {
    console.error('Tasks error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update task
router.patch('/:id', async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { status, assigneeId, dueDate, title, description } = req.body;
    const task = await prisma.task.update({
      where: { id: req.params.id as string },
      data: {
        status,
        assigneeId,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        title,
        description
      }
    });
    res.json(task);
  } catch (error) {
    console.error('Tasks error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete task
router.delete('/:id', async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    await prisma.task.delete({
      where: { id: req.params.id as string }
    });
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Tasks error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
