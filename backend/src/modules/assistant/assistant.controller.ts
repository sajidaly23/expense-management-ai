import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { askAssistant } from './assistant.service.js';

export const ask = asyncHandler(async (req: Request, res: Response) => {
  const result = await askAssistant(req.user!.id, req.body);
  res.status(200).json({
    status: 'success',
    ...result,
  });
});
