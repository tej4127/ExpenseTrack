import { NextResponse } from 'next/server';
import { prefillExpenseDetailsWithOCR } from '@/ai/flows/prefill-expense-details-with-ocr';


export async function POST(request: Request) {
  try {
    const { receiptDataUri } = await request.json();

    if (!receiptDataUri) {
      return NextResponse.json({ error: 'Missing receiptDataUri' }, { status: 400 });
    }

    const ocrResult = await prefillExpenseDetailsWithOCR({ receiptDataUri });

    return NextResponse.json(ocrResult);
  } catch (error) {
    console.error('OCR parsing error:', error);
    return NextResponse.json({ error: 'Failed to parse receipt' }, { status: 500 });
  }
}
