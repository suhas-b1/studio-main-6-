'use server';

import { ai } from '@/ai/genkit';

export type ChatMessage = {
    role: 'user' | 'assistant';
    content: string;
    imageDataUri?: string;
};

export type AppContext = {
    role: 'donor' | 'ngo';
    userName: string;
    userAddress?: string;
    userPhone?: string;
    currentPage: string;
    availableDonations: Array<{
        id: string;
        title: string;
        type: string;
        quantity: string;
        distance: number;
        location: string;
        status: string;
        donorName: string;
    }>;
    userDonations: Array<{
        id: string;
        title: string;
        status: string;
        quantity: string;
    }>;
    userClaims: Array<{
        id: string;
        title: string;
        status: string;
    }>;
};

export async function chatWithAIAction(
    messages: ChatMessage[],
    appContext: AppContext
): Promise<{ reply: string; error?: string }> {
    try {
        const lastMsg = messages[messages.length - 1];

        // Build full prompt text including system context + history + current message
        const history = messages.slice(0, -1)
            .map(m => `${m.role === 'user' ? 'User' : 'Nourish AI'}: ${m.content}`)
            .join('\n');

        const contextBlock = `
=== LIVE APP DATA ===
User: ${appContext.userName} | Role: ${appContext.role.toUpperCase()} | Page: ${appContext.currentPage}
Phone: ${appContext.userPhone || 'Not provided'} | Address/Location: ${appContext.userAddress || 'Not provided'}

Available Donations (${appContext.availableDonations.length} total):
${appContext.availableDonations.slice(0, 12).map(d =>
            `  • [ID: ${d.id}] "${d.title}" | ${d.type} | ${d.quantity} | ${d.distance.toFixed(1)}km | By: ${d.donorName} | ${d.status}`
        ).join('\n') || '  (none)'}

${appContext.role === 'donor' ? `Your Donations (${appContext.userDonations.length}):
${appContext.userDonations.map(d => `  • "${d.title}" | ${d.quantity} | ${d.status}`).join('\n') || '  (none)'}` : ''}
${appContext.role === 'ngo' ? `Your Claims (${appContext.userClaims.length}):
${appContext.userClaims.map(c => `  • "${c.title}" | ${c.status}`).join('\n') || '  (none)'}` : ''}
=== END APP DATA ===
`.trim();

        const systemPrompt = `You are Nourish AI 🤖 — the intelligent assistant for NourishConnect, India's leading food donation platform.

You have FULL ACCESS to every section of NourishConnect:
• Dashboard — impact stats, hero cards, recent activity  
• New Donation (/donations/new) — list food surplus with AI title suggestion  
• My Donations (/donations) — manage listed donations  
• Smart Matches (/matches) — AI-powered donation matching  
• Food Aid Map (/food-aid-map) — 144+ NGOs, orphanages, shelters across India  
• My Claims (/claims) — track claimed donations with live delivery timeline  
• Impact (/impact) — environmental and social impact stats  
• Rank / Leaderboard (/leaderboard) — Gamified donor rankings with global and geographic filters. Donors earn Impact Points.
• Settings, Help, Feedback sections

FOR DONORS: Analyze food images → detect type/weight/shelf life → suggest nearest NGOs  
FOR RECEIVERS/NGOs: Find matching donations by type/quantity/distance  

IMPORTANT FOR RANKINGS: NourishConnect absolutely HAS a ranking system! If a user asks about their rank, leaderboard, or points, excitedly tell them about the Gamified Leaderboard and instruct them to check it out. Use NAV_ACTION: /leaderboard | View Leaderboard

=== TRANSACTIONAL ACTIONS ===
When you want to perform one of the following actions, you MUST include the exact text block below in your response. The chat UI will parse it and render a rich UI component for the user.
1. To show a list of specific available donations inside the chat, use:
ACTION: SHOW_DONATIONS | id1,id2,id3

2. To let a receiver CLAIM/ORDER a donation, you MUST use their registered Address/Phone as the delivery destination. Once they confirm, use:
ACTION: CLAIM_DONATION | <<donation_id>>

3. To automatically CREATE a donation for a donor based on details they provided (or photo), you MUST use their registered Address/Phone as the pickup location. When you have enough details (title, description, quantity, type, pickupDeadline), use:
ACTION: CREATE_DONATION | {"title":"...","description":"...","quantity":"...","type":"Produce","pickupDeadline":"YYYY-MM-DD"}
=============================

NAVIGATION: When user needs to go somewhere, add this at the end of your response:
NAV_ACTION: /path/to/page | Button label text

Keep responses concise (2-3 paragraphs), use bullet points, bold key info with **bold**.
Always end with one clear actionable next step.

${contextBlock}`;

        const historySection = history ? `\n=== CONVERSATION HISTORY ===\n${history}\n=== END HISTORY ===\n` : '';

        // Build prompt parts
        const promptParts: any[] = [];

        if (lastMsg.imageDataUri) {
            promptParts.push({ media: { url: lastMsg.imageDataUri } });
        }
        promptParts.push({ text: lastMsg.content });

        // Use the same ai.generate pattern the project uses
        const response = await ai.generate({
            prompt: promptParts,
            system: `${systemPrompt}${historySection}`,
            config: {
                temperature: 0.7,
            },
        });

        const reply = response.text ?? 'I could not generate a response. Please try again.';

        return { reply };

    } catch (error: any) {
        console.error('AI chat error:', error?.message ?? error);
        return {
            reply: '',
            error: `AI error: ${error?.message ?? 'Unknown error. Check server logs.'}`,
        };
    }
}
