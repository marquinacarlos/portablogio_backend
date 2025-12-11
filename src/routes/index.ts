import { Router } from 'express';
import postRoutes from './post.routes.js';
import projectRoutes from './project.routes.js';
import serviceRoutes from './service.routes.js';
import authRoutes from './auth.routes.js';

const router = Router();

// Aquí "montamos" las rutas modulares
// Todas las rutas de postRoutes ahora empezarán por /posts
router.use('/posts', postRoutes);
router.use('/projects', projectRoutes);
router.use('/services', serviceRoutes);
router.use('/auth', authRoutes);

// Futuro:
// router.use('/auth', authRoutes);
// router.use('/services', serviceRoutes);

export default router;