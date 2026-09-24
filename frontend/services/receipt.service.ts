import { apiUpload } from '../lib/api';

export type ParsedReceipt = {
  merchant: string;
  date: string;
  total: number;
  tax: number;
  currency: string;
  items: Array<{ name: string; price: number }>;
  suggestedCategory: string;
  confidence: number;
  rawText?: string;
};

export async function uploadReceipt(file: File): Promise<{ status: string; receipt: ParsedReceipt }> {
  const formData = new FormData();
  formData.append('receipt', file);
  return apiUpload('/api/receipts/scan', formData);
}
