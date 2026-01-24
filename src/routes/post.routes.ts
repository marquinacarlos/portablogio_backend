import { Router } from 'express';
import { PostController } from '../controllers/post.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

const router = Router();

// =============================================================================
// RUTAS PÚBLICAS
// =============================================================================

// GET /api/v1/posts - Listar posts publicados (paginado)
router.get('/', PostController.getPosts);

// =============================================================================
// RUTAS PROTEGIDAS (requieren autenticación)
// IMPORTANTE: Rutas específicas ANTES de rutas con parámetros (:slug)
// =============================================================================

// GET /api/v1/posts/admin - Listar todos los posts para admin (incluye drafts)
router.get('/admin', authenticateToken, PostController.getPostsAdmin);

// POST /api/v1/posts - Crear nuevo post
router.post('/', authenticateToken, PostController.createPost);

// PUT /api/v1/posts/:slug - Actualizar post existente
router.put('/:slug', authenticateToken, PostController.updatePost);

// DELETE /api/v1/posts/:slug - Eliminar post
router.delete('/:slug', authenticateToken, PostController.deletePost);

// =============================================================================
// RUTA CON PARÁMETRO (debe ir AL FINAL para no capturar otras rutas)
// =============================================================================

// GET /api/v1/posts/:slug - Obtener post por slug
router.get('/:slug', PostController.getPostBySlug);

export default router;