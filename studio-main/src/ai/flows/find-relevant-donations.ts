
'use server';
/**
 * @fileOverview Finds relevant food donations for an NGO.
 *
 * - findRelevantDonations - A function that finds the best food donations for a given NGO.
 * - FindRelevantDonationsInput - The input type for the findRelevantDonations function.
 * - FindRelevantDonationsOutput - The return type for the findRelevantDonations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const NgoProfileSchema = z.object({
  name: z.string().describe("The NGO's name."),
  location: z.string().describe("The NGO's address."),
  needs: z.string().describe('A description of the types of food the NGO needs.'),
});

const DonationSchema = z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    type: z.string(),
    quantity: z.string(), // Quantity as a string
    distance: z.number().describe("Distance in kilometers from the NGO."),
});


const FindRelevantDonationsInputSchema = z.object({
  ngoProfile: NgoProfileSchema.describe("The profile of the NGO searching for donations."),
  availableDonations: z.array(DonationSchema).describe("A list of all available food donations."),
});
export type FindRelevantDonationsInput = z.infer<typeof FindRelevantDonationsInputSchema>;


const FindRelevantDonationsOutputSchema = z.object({
  matchedDonationIds: z
    .array(z.string())
    .describe('An array of IDs of the most relevant donations for the NGO, sorted from most to least relevant.'),
});
export type FindRelevantDonationsOutput = z.infer<typeof FindRelevantDonationsOutputSchema>;

export async function findRelevantDonations(input: FindRelevantDonationsInput): Promise<FindRelevantDonationsOutput> {
  return findRelevantDonationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'findRelevantDonationsPrompt',
  input: {schema: FindRelevantDonationsInputSchema},
  output: {schema: FindRelevantDonationsOutputSchema},
  prompt: `You are an AI assistant for the Nourish Connect app. Your task is to act as a "Smart Match" engine for NGOs (Non-Governmental Organizations) looking for food donations.

You will be given the NGO's profile and a list of currently available food donations.

Your goal is to find the most relevant donations for the NGO. Consider the following factors, in order of importance:
1.  **Relevance to Needs**: Does the donation's food type and quantity match the NGO's stated needs? (e.g., a soup kitchen needing produce vs. a food bank needing pantry staples).
2.  **Proximity**: How close is the donation? Lower distance is better.
3.  **Quantity**: Is the quantity appropriate for the NGO?

Based on these criteria, return a sorted list of the top 3 to 5 donation IDs that are the best fit for the NGO. The list should be ordered from the most suitable match to the least.

**NGO Profile:**
- Name: {{{ngoProfile.name}}}
- Location: {{{ngoProfile.location}}}
- Needs: {{{ngoProfile.needs}}}

**Available Donations (JSON):**
{{{json availableDonations}}}

Return only the array of matched donation IDs.
  `,
});

const findRelevantDonationsFlow = ai.defineFlow(
  {
    name: 'findRelevantDonationsFlow',
    inputSchema: FindRelevantDonationsInputSchema,
    outputSchema: FindRelevantDonationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
