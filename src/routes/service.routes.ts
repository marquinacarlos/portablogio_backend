import { Router } from 'express';
import { ServiceController } from '../controllers/service.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

const router = Router();
router.get('/', ServiceController.getServices);
router.post('/', authenticateToken, ServiceController.createService);
export default router;