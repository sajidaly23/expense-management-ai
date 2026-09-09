import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { getHealthScore } from './score.service.js';

export const show = asyncHandler(async (req: Request, res: Response) => {
  const score = await getHealthScore(req.user!.id);
  res.status(200).json({
    status: 'success',
    score,
  });
});
