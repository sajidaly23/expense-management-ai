import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { getAdminOverview } from './admin.service.js';

export const overview = asyncHandler(async (_req: Request, res: Response) => {
  const result = await getAdminOverview();
  res.status(200).json({
    status: 'success',
    ...result,
  });
});
