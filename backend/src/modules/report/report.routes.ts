import { Router } from 'express';
import { requireAuth } from '../auth/auth.middleware.js';
import { exportExcel, exportPdf, show } from './report.controller.js';

const router = Router();

router.use(requireAuth);
router.get('/', show);
router.get('/export.pdf', exportPdf);
router.get('/export.xls', exportExcel);

export default router;
