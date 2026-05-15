import { Router, Response } from 'express';
import { authenticate, authorizeAdmin, AuthRequest } from '../middleware/auth';
import prisma from '../prisma';

const router = Router();
router.use(authenticate);

// Get all projects user has access to
router.get('/', async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const role = req.user?.role;
    const userId = req.user?.id;

    if (role === 'ADMIN') {
      const projects = await prisma.project.findMany({
        include: { owner: { select: { name: true, email: true } }, members: { select: { id: true, name: true, email: true } } }
      });
      return res.json(projects);
    } else {
      const projects = await prisma.project.findMany({
        where: { memberIds: { has: userId } },
        include: { owner: { select: { name: true } }, members: { select: { id: true, name: true, email: true } } }
      });
      return res.json(projects);
    }
  } catch (error) {
    console.error('Projects error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get single project details
router.get('/:id', async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id as string },
      include: { owner: { select: { name: true, email: true } }, members: { select: { id: true, name: true, email: true } } }
    });
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (error) {
    console.error('Projects error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Admin creates project
router.post('/', authorizeAdmin, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { name, description, guidelines, memberIds } = req.body;
    if (!name) return res.status(400).json({ message: 'Project name is required' });

    // Ensure we only have unique IDs and they are valid
    const uniqueMemberIds = Array.from(new Set([...(memberIds || []), req.user!.id]));
    const membersConnect = uniqueMemberIds.map(id => ({ id }));
    
    const project = await prisma.project.create({
      data: {
        name,
        description,
        guidelines,
        ownerId: req.user!.id,
        members: { 
          connect: membersConnect
        }
      }
    });
    res.status(201).json(project);
  } catch (error) {
    console.error('Projects error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
