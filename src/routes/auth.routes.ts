import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
const router = Router();

router.post('/login', AuthController.login);
// NOTA: /register deshabilitado en producción por seguridad
// Para crear usuarios, usa: npm run seed:admin

export default router;