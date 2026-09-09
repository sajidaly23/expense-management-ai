import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { buildExcelBuffer, buildPdfBuffer, buildReport, exportFilename } from './report.service.js';

export const show = asyncHandler(async (req: Request, res: Response) => {
  const report = await buildReport(req.user!.id);
  res.status(200).json({
    status: 'success',
    report,
  });
});

export const exportPdf = asyncHandler(async (req: Request, res: Response) => {
  const report = await buildReport(req.user!.id);
  const filename = exportFilename(report, 'pdf');
  const buffer = buildPdfBuffer(report);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(buffer);
});

export const exportExcel = asyncHandler(async (req: Request, res: Response) => {
  const report = await buildReport(req.user!.id);
  const filename = exportFilename(report, 'xls');
  const buffer = buildExcelBuffer(report);
  res.setHeader('Content-Type', 'application/vnd.ms-excel');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(buffer);
});
