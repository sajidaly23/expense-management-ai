import { Router } from 'express';
import { validate } from '../../middleware/validate.js';
import { login, me, register } from './auth.controller.js';
import { requireAuth } from './auth.middleware.js';
import { loginSchema, registerSchema } from './auth.validation.js';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.get('/me', requireAuth, me);

export default router;
