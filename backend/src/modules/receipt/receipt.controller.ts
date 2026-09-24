import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { parseReceiptData } from './receipt.service.ts';

export const scanReceipt = asyncHandler(async (req: Request, res: Response) => {
  const file = req.file;
  const { base64Image, fileName } = req.body || {};

  const parsed = await parseReceiptData(file?.buffer, base64Image, file?.originalname || fileName);

  res.status(200).json({
    status: 'success',
    receipt: parsed,
  });
});
