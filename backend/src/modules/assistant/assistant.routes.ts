import { Router } from 'express';
import { validate } from '../../middleware/validate.js';
import { requireAuth } from '../auth/auth.middleware.js';
import { ask } from './assistant.controller.js';
import { askAssistantSchema } from './assistant.service.js';

const router = Router();

router.use(requireAuth);
router.post('/ask', validate(askAssistantSchema), ask);

export default router;
