import { Router } from 'express';
import postRoutes from './post.routes.js';
import projectRoutes from './project.routes.js';
import serviceRoutes from './service.routes.js';
import authRoutes from './auth.routes.js';
import contactRoutes from './contact.routes.js';

const router = Router();

router.use('/posts', postRoutes);
router.use('/projects', projectRoutes);
router.use('/services', serviceRoutes);
router.use('/auth', authRoutes);
router.use('/contact', contactRoutes);

export default router;