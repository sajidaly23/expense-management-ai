import { Router } from 'express';
import multer from 'multer';
import { requireAuth } from '../auth/auth.middleware.js';
import { scanReceipt } from './receipt.controller.js';

const upload = multer({ limits: { fileSize: 10 * 1024 * 1024 } });
const router = Router();

router.use(requireAuth);
router.post('/scan', upload.single('receipt'), scanReceipt);

export default router;
