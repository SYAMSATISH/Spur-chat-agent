"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHistory = exports.sendMessage = void 0;
const zod_1 = require("zod");
const prisma_1 = require("../utils/prisma");
const llm_1 = require("../services/llm");
const messageSchema = zod_1.z.object({
    message: zod_1.z.string().min(1, "Message cannot be empty"),
    sessionId: zod_1.z.string().uuid().optional(),
});
const sendMessage = async (req, res) => {
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
            conversation = await prisma_1.prisma.conversation.findUnique({
                where: { id: sessionId },
                include: { messages: { orderBy: { createdAt: 'asc' } } }
            });
            if (!conversation) {
                // Create new if not found, or error? Let's create new for robustness
                sessionId = undefined;
            }
        }
        if (!sessionId || !conversation) {
            conversation = await prisma_1.prisma.conversation.create({
                data: {},
                include: { messages: true }
            });
            sessionId = conversation.id;
        }
        // Save User Message
        await prisma_1.prisma.message.create({
            data: {
                conversationId: sessionId,
                role: 'user',
                content: message
            }
        });
        // Generate Reply
        // Context: Last 10 messages to save tokens context
        const history = conversation.messages.slice(-10).map(m => ({ role: m.role, content: m.content }));
        const reply = await (0, llm_1.generateReply)(history, message);
        // Save AI Message
        await prisma_1.prisma.message.create({
            data: {
                conversationId: sessionId,
                role: 'assistant',
                content: reply
            }
        });
        res.json({ reply, sessionId });
    }
    catch (error) {
        console.error("Chat Error", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
exports.sendMessage = sendMessage;
const getHistory = async (req, res) => {
    const { sessionId } = req.params;
    if (!sessionId) {
        res.status(400).json({ error: "Session ID required" });
        return;
    }
    try {
        const conversation = await prisma_1.prisma.conversation.findUnique({
            where: { id: sessionId },
            include: { messages: { orderBy: { createdAt: 'asc' } } }
        });
        if (!conversation) {
            res.status(404).json({ error: "Session not found" });
            return;
        }
        res.json({ messages: conversation.messages });
    }
    catch (error) {
        console.error("History Error", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
exports.getHistory = getHistory;
//# sourceMappingURL=chatController.js.map