import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [googleAI({ apiKey: 'AIzaSyDfPd2wKhxfIFZAxxup-xuM2vEsUuN86qI' })],
  model: 'googleai/gemini-2.5-flash',
});
