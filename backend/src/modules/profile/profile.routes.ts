import { Router } from 'express';
import { validate } from '../../middleware/validate.js';
import { requireAuth } from '../auth/auth.middleware.js';
import { show, update } from './profile.controller.js';
import { updateProfileSchema } from './profile.validation.js';

const router = Router();

router.use(requireAuth);
router.get('/', show);
router.patch('/', validate(updateProfileSchema), update);

export default router;
