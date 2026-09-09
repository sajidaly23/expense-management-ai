import { Router } from 'express';
import { requireAdmin, requireAuth } from '../auth/auth.middleware.js';
import { overview } from './admin.controller.js';

const router = Router();

router.use(requireAuth);
router.use(requireAdmin);
router.get('/overview', overview);

export default router;
