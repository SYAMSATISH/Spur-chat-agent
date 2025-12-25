import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.OPENAI_API_KEY;

// Only initialize if key is present to avoid immediate crash, check at usage time
const openai = apiKey && apiKey !== 'CHANGE_ME' ? new OpenAI({ apiKey }) : null;

const SYSTEM_PROMPT = `
You are a helpful support agent for a small e-commerce store called 'Spur Store'.
Answer customers clearly and concisely.

Store Policy Information:
- Shipping: We ship worldwide. Shipping is free for orders over $50. Otherwise, flat rate $5.
- Returns: You can return any item within 30 days of purchase for a full refund, provided it is unused.
- Support Hours: 9 AM to 5 PM EST, Monday to Friday.

If you don't know the answer, politely say you don't know and offer to connect them to a human (simulate this).
`;

export async function generateReply(history: { role: 'user' | 'assistant'; content: string }[], newMessage: string): Promise<string> {
    if (!openai) {
        console.warn('OpenAI API Key missing or invalid');
        return "I'm sorry, I am currently offline configuration wise (Missing API Key). Please try again later.";
    }

    try {
        const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
            { role: 'system', content: SYSTEM_PROMPT },
            ...history.map(h => ({ role: h.role, content: h.content })),
            { role: 'user', content: newMessage }
        ];

        const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: messages,
            max_tokens: 150, // Cost control
            temperature: 0.7,
        });

        return completion.choices[0]?.message?.content || "I didn't catch that. Could you rephrase?";
    } catch (error: any) {
        console.error('LLM Error:', error);
        return "I'm having trouble connecting to my brain right now. Please try again in a moment.";
    }
}
