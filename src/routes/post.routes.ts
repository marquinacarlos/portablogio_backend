import { Router } from 'express';
import { PostController } from '../controllers/post.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

const router = Router();

// Definición de rutas
// GET /api/v1/posts
router.get('/', PostController.getPosts);

// GET /api/v1/posts/mi-primer-post
router.get('/:slug', PostController.getPostBySlug);

// POST /api/v1/posts
// NOTA: Más adelante, aquí agregaremos un middleware de autenticación 
// router.post('/', authMiddleware, PostController.createPost);
router.post('/', authenticateToken, PostController.createPost); 

export default router;