import type { ChatResponse, Message } from './types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/chat';

export async function sendMessage(message: string, sessionId?: string): Promise<ChatResponse> {
    const res = await fetch(`${API_URL}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, sessionId }),
    });

    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to send message');
    }

    return res.json();
}

export async function getHistory(sessionId: string): Promise<{ messages: Message[] }> {
    const res = await fetch(`${API_URL}/history/${sessionId}`);
    if (!res.ok) {
        throw new Error('Failed to fetch history');
    }
    return res.json();
}
