'use server';

/**
 * @fileOverview An AI agent that uses OCR to prefill expense details from a receipt image.
 *
 * - prefillExpenseDetailsWithOCR - A function that handles the expense details prefilling process.
 * - PrefillExpenseDetailsWithOCRInput - The input type for the prefillExpenseDetailsWithOCR function.
 * - PrefillExpenseDetailsWithOCROutput - The return type for the prefillExpenseDetailsWithOCR function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PrefillExpenseDetailsWithOCRInputSchema = z.object({
  receiptDataUri: z
    .string()
    .describe(
      "A receipt image as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type PrefillExpenseDetailsWithOCRInput = z.infer<typeof PrefillExpenseDetailsWithOCRInputSchema>;

const PrefillExpenseDetailsWithOCROutputSchema = z.object({
  amount: z.string().optional().describe('The amount extracted from the receipt.'),
  date: z.string().optional().describe('The date extracted from the receipt.'),
  vendor: z.string().optional().describe('The vendor extracted from the receipt.'),
});
export type PrefillExpenseDetailsWithOCROutput = z.infer<typeof PrefillExpenseDetailsWithOCROutputSchema>;

export async function prefillExpenseDetailsWithOCR(
  input: PrefillExpenseDetailsWithOCRInput
): Promise<PrefillExpenseDetailsWithOCROutput> {
  return prefillExpenseDetailsWithOCRFlow(input);
}

const prompt = ai.definePrompt({
  name: 'prefillExpenseDetailsWithOCRPrompt',
  input: {schema: PrefillExpenseDetailsWithOCRInputSchema},
  output: {schema: PrefillExpenseDetailsWithOCROutputSchema},
  prompt: `You are an OCR assistant that extracts expense details from receipt images.

  Analyze the receipt image and extract the amount, date, and vendor.
  If a field cannot be determined, leave it blank.

  Receipt: {{media url=receiptDataUri}}
  Output format: JSON`,
});

const prefillExpenseDetailsWithOCRFlow = ai.defineFlow(
  {
    name: 'prefillExpenseDetailsWithOCRFlow',
    inputSchema: PrefillExpenseDetailsWithOCRInputSchema,
    outputSchema: PrefillExpenseDetailsWithOCROutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);


