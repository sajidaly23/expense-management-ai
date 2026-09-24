import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { AppError } from '../../utils/AppError.js';
import { parseReceiptData } from './receipt.service.js';

export const scanReceipt = asyncHandler(async (req: Request, res: Response) => {
  const file = req.file;
  const { base64Image, fileName } = req.body || {};

  if (!file && !base64Image) {
    throw new AppError('Upload a receipt image before scanning.', 400);
  }

  const parsed = await parseReceiptData(file?.buffer, base64Image, file?.originalname || fileName, file?.mimetype);

  res.status(200).json({
    status: 'success',
    receipt: parsed,
    warnings: parsed.warnings,
    reviewRequired: parsed.reviewRequired,
  });
});
