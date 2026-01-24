import { Router } from 'express';
import { ContactController } from '../controllers/contact.controller.js';

const router = Router();

// POST /api/v1/contact - Enviar mensaje de contacto (publico)
router.post('/', ContactController.sendMessage);

export default router;
