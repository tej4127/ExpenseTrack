import { config } from 'dotenv';
config();


import '@/ai/flows/prefill-expense-details-with-ocr.ts';
import '@/ai/flows/suggest-expense-category.ts';
import '@/ai/flows/categorize-expense-with-ai.ts';

