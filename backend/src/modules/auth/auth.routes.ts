import { Router } from 'express';
import { validate } from '../../middleware/validate.js';
import { authLimiter } from '../../middleware/rateLimit.js';
import { login, me, register } from './auth.controller.js';
import { requireAuth } from './auth.middleware.js';
import { loginSchema, registerSchema } from './auth.validation.js';

const router = Router();

router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);
router.get('/me', requireAuth, me);

export default router;
