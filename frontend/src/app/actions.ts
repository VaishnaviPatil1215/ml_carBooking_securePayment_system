'use server';

import {
  analyzePricing,
  type DynamicPricingInput,
} from '@/ai/flows/dynamic-pricing-analysis';
import { z } from 'zod';

const DynamicPricingInputSchema = z.object({
  basePrice: z.number(),
  demandFactor: z.number(),
  seasonalityFactor: z.number(),
  competitorPrice: z.number(),
});

export async function getDynamicPrice(input: DynamicPricingInput) {
  try {
    const validatedInput = DynamicPricingInputSchema.parse(input);
    const result = await analyzePricing(validatedInput);
    return { success: true, data: result };
  } catch (error) {
    console.error('AI Pricing Error:', error);
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Invalid input provided.' };
    }
    return {
      success: false,
      error:
        'An unexpected error occurred while analyzing pricing. Please try again.',
    };
  }
}
