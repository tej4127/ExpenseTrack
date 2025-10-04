'use server';

/**
 * @fileOverview An AI agent that suggests expense categories based on the expense description and receipt image.
 *
 * - categorizeExpenseWithAI - A function that suggests expense categories based on the expense description and receipt image.
 * - CategorizeExpenseWithAIInput - The input type for the categorizeExpenseWithAI function.
 * - CategorizeExpenseWithAIOutput - The return type for the categorizeExpenseWithAI function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CategorizeExpenseWithAIInputSchema = z.object({
  description: z.string().describe('The description of the expense.'),
  receiptDataUri: z
    .string()
    .describe(
      "A receipt image as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type CategorizeExpenseWithAIInput = z.infer<typeof CategorizeExpenseWithAIInputSchema>;

const CategorizeExpenseWithAIOutputSchema = z.object({
  categorySuggestions: z.array(z.string()).describe('An array of suggested expense categories.'),
});
export type CategorizeExpenseWithAIOutput = z.infer<typeof CategorizeExpenseWithAIOutputSchema>;

export async function categorizeExpenseWithAI(
  input: CategorizeExpenseWithAIInput
): Promise<CategorizeExpenseWithAIOutput> {
  return categorizeExpenseWithAIFlow(input);
}

const prompt = ai.definePrompt({
  name: 'categorizeExpenseWithAIPrompt',
  input: {schema: CategorizeExpenseWithAIInputSchema},
  output: {schema: CategorizeExpenseWithAIOutputSchema},
  prompt: `You are an expert expense categorizer. Based on the description and receipt image provided, suggest relevant expense categories.

Description: {{{description}}}
Receipt: {{media url=receiptDataUri}}

Suggest up to 3 expense categories that best fit the expense. Return them as a JSON array of strings.

Categories:`,
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_LOW_AND_ABOVE',
      },
    ],
  },
});

const categorizeExpenseWithAIFlow = ai.defineFlow(
  {
    name: 'categorizeExpenseWithAIFlow',
    inputSchema: CategorizeExpenseWithAIInputSchema,
    outputSchema: CategorizeExpenseWithAIOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
