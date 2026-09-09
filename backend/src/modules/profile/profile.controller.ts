import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { getProfile, updateProfile } from './profile.service.js';

export const show = asyncHandler(async (req: Request, res: Response) => {
  const profile = await getProfile(req.user!.id);
  res.status(200).json({
    status: 'success',
    profile,
  });
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const profile = await updateProfile(req.user!.id, req.body);
  res.status(200).json({
    status: 'success',
    message: 'Financial profile saved.',
    profile,
  });
});
