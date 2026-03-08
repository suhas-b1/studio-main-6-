
// @/app/actions.ts
'use server';

import {
  suggestFoodListingTitles,
  type SuggestFoodListingTitlesInput,
} from '@/ai/flows/suggest-food-listing-titles';
import {
  matchFoodDonationsWithNGOs
} from '@/ai/flows/match-food-donations-with-ngos';
import {
  findRelevantDonations
} from '@/ai/flows/find-relevant-donations';
import type { Donation, Ngo } from '@/lib/types';

export async function suggestTitlesAction(
  input: SuggestFoodListingTitlesInput
): Promise<{ suggestions?: string[]; error?: string }> {
  try {
    const result = await suggestFoodListingTitles(input);
    if (result.suggestedTitles.length === 0) {
      return { suggestions: ["No safe/valid titles could be generated. Please check your input."] };
    }
    return { suggestions: result.suggestedTitles };
  } catch (error) {
    console.error('Error suggesting titles:', error);
    return { error: 'Failed to suggest titles due to an internal error.' };
  }
}

export async function generateMatchesAction(): Promise<{ matches?: Ngo[]; error?: string; }> {
  try {
    const realisticInput = {
      foodListingDetails: '25 kg of fresh, mixed organic vegetables (carrots, bell peppers, spinach). Best if used within 3 days. Ready for immediate pickup.',
      ngoRequirements: '1. Urban Food Bank: Requires fresh produce for their soup kitchen, serves 200 meals daily. Located at 456 Main St. 2. St. Jude\'s Shelter: Needs vegetables for family meal boxes, pickup required. Find them at 789 Oak Ave. 3. City Harvest Collective: Accepts bulk produce, has refrigerated trucks for transport. Based at 101 Pine Ln.',
      donorLocation: 'Greenleaf Organics, 123 Market St, Springfield',
    };
    const result = await matchFoodDonationsWithNGOs(realisticInput);

    const matchesWithIds = result.map((match, index) => ({
      ...match,
      name: match.ngoName,
      id: `match-${index}-${new Date().getTime()}`
    }));

    return { matches: matchesWithIds };

  } catch (error) {
    console.error('Error generating matches:', error);
    return { error: 'Failed to generate matches due to an internal error.' };
  }
}


export async function findRelevantDonationsAction(availableDonations: Donation[]): Promise<{ matches?: Donation[]; error?: string; }> {
  try {
    const ngoProfile = {
      name: "Community Kitchen",
      location: "789 Oak Ave, Springfield",
      needs: "We run a soup kitchen serving 200 hot meals daily and also provide family meal boxes. We have a high need for fresh produce, protein, and prepared meals. We have refrigeration and can pick up larger donations."
    };

    // The action now receives the current list of available donations from the client state.
    // We need to transform the data to match the schema expected by the AI prompt.
    const donationsForAI = availableDonations.map(d => ({
      id: d.id,
      title: d.title,
      description: d.description,
      type: d.type,
      quantity: d.quantity.toString(), // Ensure quantity is a string
      distance: d.distance, // Keep distance as a number for the AI prompt
    }));

    const result = await findRelevantDonations({
      ngoProfile: ngoProfile,
      availableDonations: donationsForAI
    });

    // The AI returns IDs, we need to map them back to the full donation objects
    const matchedDonations = result.matchedDonationIds
      .map(id => availableDonations.find(d => d.id === id))
      .filter((d): d is Donation => !!d);

    return { matches: matchedDonations };

  } catch (error) {
    console.error('Error finding relevant donations:', error);
    return { error: 'Failed to find relevant donations due to an internal error.' };
  }
}
