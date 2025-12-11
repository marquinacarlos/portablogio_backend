import { Router } from 'express';
import { ProjectController } from '../controllers/project.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

const router = Router();
router.get('/', ProjectController.getProjects);
router.post('/', authenticateToken, ProjectController.createProject);
export default router;