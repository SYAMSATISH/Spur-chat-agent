import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../utils/prisma';
import { generateReply } from '../services/llm';

const messageSchema = z.object({
    message: z.string().min(1, "Message cannot be empty"),
    sessionId: z.string().uuid().optional(),
});

export const sendMessage = async (req: Request, res: Response) => {
    try {
        const validation = messageSchema.safeParse(req.body);
        if (!validation.success) {
            res.status(400).json({ error: validation.error.issues[0]?.message || 'Invalid input' });
            return;
        }

        const { message, sessionId: providedSessionId } = validation.data;
        let sessionId = providedSessionId;
        let conversation;

        if (sessionId) {
            conversation = await prisma.conversation.findUnique({
                where: { id: sessionId },
                include: { messages: { orderBy: { createdAt: 'asc' } } }
            });
            if (!conversation) {
                // Create new if not found, or error? Let's create new for robustness
                sessionId = undefined;
            }
        }

        if (!sessionId || !conversation) {
            conversation = await prisma.conversation.create({
                data: {},
                include: { messages: true }
            });
            sessionId = conversation.id;
        }

        // Save User Message
        await prisma.message.create({
            data: {
                conversationId: sessionId,
                role: 'user',
                content: message
            }
        });

        // Generate Reply
        // Context: Last 10 messages to save tokens context
        const history = conversation.messages.slice(-10).map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }));

        const reply = await generateReply(history, message);

        // Save AI Message
        await prisma.message.create({
            data: {
                conversationId: sessionId,
                role: 'assistant',
                content: reply
            }
        });

        res.json({ reply, sessionId });

    } catch (error) {
        console.error("Chat Error", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const getHistory = async (req: Request, res: Response) => {
    const { sessionId } = req.params;
    if (!sessionId) {
        res.status(400).json({ error: "Session ID required" });
        return;
    }
    try {
        const conversation = await prisma.conversation.findUnique({
            where: { id: sessionId },
            include: { messages: { orderBy: { createdAt: 'asc' } } }
        });

        if (!conversation) {
            res.status(404).json({ error: "Session not found" });
            return;
        }

        res.json({ messages: conversation.messages });
    } catch (error) {
        console.error("History Error", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
