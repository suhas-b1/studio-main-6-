'use server';
/**
 * @fileOverview Matches food donations with nearby, verified NGOs based on need and availability.
 *
 * - matchFoodDonationsWithNGOs - A function that matches food donations with NGOs.
 * - MatchFoodDonationsInput - The input type for the matchFoodDonationsWithNGOs function.
 * - MatchFoodDonationsOutput - The return type for the matchFoodDonationsWithNGOs function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MatchFoodDonationsInputSchema = z.object({
  foodListingDetails: z
    .string()
    .describe('Details of the food listing, including quantity, type, and freshness.'),
  ngoRequirements: z
    .string()
    .describe('The requirements and needs of nearby NGOs.'),
  donorLocation: z.string().describe('The location of the food donor.'),
});
export type MatchFoodDonationsInput = z.infer<typeof MatchFoodDonationsInputSchema>;

const MatchedNgoSchema = z.object({
  ngoName: z.string().describe('The name of the matched NGO.'),
  address: z.string().describe("The full address of the NGO."),
  phone: z.string().describe("The contact phone number for the NGO."),
  email: z.string().describe("The contact email address for the NGO."),
  distance: z.string().describe("The distance from the donor, including units (e.g., '2.5 km')."),
  reasonForMatch: z.string().describe('Why this NGO was matched with the donation.'),
});

const MatchFoodDonationsOutputSchema = z.array(MatchedNgoSchema).describe('A list of matched NGOs.');
export type MatchFoodDonationsOutput = z.infer<typeof MatchFoodDonationsOutputSchema>;

export async function matchFoodDonationsWithNGOs(input: MatchFoodDonationsInput): Promise<MatchFoodDonationsOutput> {
  return matchFoodDonationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'matchFoodDonationsPrompt',
  input: {schema: MatchFoodDonationsInputSchema},
  output: {schema: MatchFoodDonationsOutputSchema},
  prompt: `You are an expert in matching food donations with appropriate NGOs.

  Given the following food listing details, NGO requirements, and donor location, identify the best NGOs to receive the donation. Prioritize NGOs that are nearby, have a demonstrated need for the food, and can utilize the food before it expires.

  Food Listing Details: {{{foodListingDetails}}}
  NGO Requirements: {{{ngoRequirements}}}
  Donor Location: {{{donorLocation}}}

  Return a JSON array of matched NGOs. For each NGO, include the following fields: ngoName, address, phone, email, distance, and reasonForMatch.
  Ensure that the output is a valid JSON array and that all requested fields are populated.
  `,
});

const matchFoodDonationsFlow = ai.defineFlow(
  {
    name: 'matchFoodDonationsFlow',
    inputSchema: MatchFoodDonationsInputSchema,
    outputSchema: MatchFoodDonationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
