'use server';

/**
 * @fileOverview This file defines a Genkit flow for dynamic pricing analysis.
 *
 * - analyzePricing - A function that analyzes and adjusts pricing based on real-time factors.
 * - DynamicPricingInput - The input type for the analyzePricing function.
 * - DynamicPricingOutput - The return type for the analyzePricing function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DynamicPricingInputSchema = z.object({
  basePrice: z.number().describe('The base price of the car rental.'),
  demandFactor: z.number().describe('A factor representing current demand (e.g., 1.0 for normal, 1.2 for high demand).'),
  seasonalityFactor: z.number().describe('A factor representing seasonality (e.g., 1.0 for normal, 0.9 for off-season, 1.1 for peak season).'),
  competitorPrice: z.number().describe('The average price of competitors for a similar rental.'),
});
export type DynamicPricingInput = z.infer<typeof DynamicPricingInputSchema>;

const DynamicPricingOutputSchema = z.object({
  adjustedPrice: z.number().describe('The dynamically adjusted price based on demand, seasonality, and competitor pricing.'),
  explanation: z.string().describe('A brief explanation of how the price was adjusted.'),
});
export type DynamicPricingOutput = z.infer<typeof DynamicPricingOutputSchema>;

export async function analyzePricing(input: DynamicPricingInput): Promise<DynamicPricingOutput> {
  return dynamicPricingAnalysisFlow(input);
}

const dynamicPricingPrompt = ai.definePrompt({
  name: 'dynamicPricingPrompt',
  input: {schema: DynamicPricingInputSchema},
  output: {schema: DynamicPricingOutputSchema},
  prompt: `You are an expert pricing analyst for a car rental company. Your goal is to dynamically adjust the rental price based on several factors.

  Here's the information you have:
  - Base Price: {{{basePrice}}}
  - Demand Factor: {{{demandFactor}}}
  - Seasonality Factor: {{{seasonalityFactor}}}
  - Competitor Price: {{{competitorPrice}}}

  Consider these factors and provide an adjusted price that is competitive and fair. Also, provide a brief explanation of how you arrived at the adjusted price.

  Make sure that the adjusted price is no more than 20% higher than the base price, and no more than 10% lower than the competitor price.
  `,
});

const dynamicPricingAnalysisFlow = ai.defineFlow(
  {
    name: 'dynamicPricingAnalysisFlow',
    inputSchema: DynamicPricingInputSchema,
    outputSchema: DynamicPricingOutputSchema,
  },
  async input => {
    const {output} = await dynamicPricingPrompt(input);
    return output!;
  }
);
