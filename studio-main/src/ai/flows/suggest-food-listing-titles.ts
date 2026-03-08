'use server';
/**
 * @fileOverview This file implements the Genkit flow for suggesting food listing titles.
 *
 * It allows donors to upload a picture or provide a description of food items,
 * and have the app suggest appropriate listing titles.
 *
 * - suggestFoodListingTitles - A function that handles the food listing title suggestion process.
 * - SuggestFoodListingTitlesInput - The input type for the suggestFoodListingTitles function.
 * - SuggestFoodListingTitlesOutput - The return type for the suggestFoodListingTitles function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestFoodListingTitlesInputSchema = z.object({
  photoDataUri: z
    .string()
    .optional()
    .describe(
      "A photo of the food items, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  description: z
    .string()
    .optional()
    .describe('A description of the food items.'),
});
export type SuggestFoodListingTitlesInput = z.infer<
  typeof SuggestFoodListingTitlesInputSchema
>;

const SuggestFoodListingTitlesOutputSchema = z.object({
  suggestedTitles: z
    .array(z.string())
    .describe('An array of suggested listing titles.'),
});
export type SuggestFoodListingTitlesOutput = z.infer<
  typeof SuggestFoodListingTitlesOutputSchema
>;

export async function suggestFoodListingTitles(
  input: SuggestFoodListingTitlesInput
): Promise<SuggestFoodListingTitlesOutput> {
  return suggestFoodListingTitlesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestFoodListingTitlesPrompt',
  input: {schema: SuggestFoodListingTitlesInputSchema},
  output: {schema: SuggestFoodListingTitlesOutputSchema},
  prompt: `You are an AI assistant designed to suggest appropriate listing titles for food donations.

  You will receive either a description or a photo of the food items.

  Based on the provided information, suggest a few concise and descriptive titles that a donor could use when listing the food items for donation.

  Consider factors such as the type of food, quantity, and any special characteristics.

  Your suggestions should comply with food safety guidelines, avoiding titles that suggest the food is unsafe for consumption (e.g., opened, used, expired).

  If a photo is provided, use it to identify the food items and generate appropriate titles.
  If the food items in the image are not suitable for donation, respond with an empty array.

  Description: {{description}}
  Photo: {{#if photoDataUri}}{{media url=photoDataUri}}{{else}}No photo provided.{{/if}}

  Output the results as a JSON array of strings.
  `,
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

const suggestFoodListingTitlesFlow = ai.defineFlow(
  {
    name: 'suggestFoodListingTitlesFlow',
    inputSchema: SuggestFoodListingTitlesInputSchema,
    outputSchema: SuggestFoodListingTitlesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
