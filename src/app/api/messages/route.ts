import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Message, Chat } from "@/lib/models";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// GET /api/messages?chat_id=...
export async function GET(req: NextRequest) {
    try {
        let session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();
        const { searchParams } = new URL(req.url);
        const chat_id = searchParams.get("chat_id") || searchParams.get("conversation_id"); // Fallback for transition

        if (!chat_id) {
            return NextResponse.json({ error: "chat_id is required" }, { status: 400 });
        }

        const messages = await Message.find({ chat_id })
            .sort({ created_at: 1 })
            .limit(100);

        // Map fields for frontend if needed, but better to keep it consistent
        return NextResponse.json(messages);
    } catch (error) {
        console.error("Fetch messages error:", error);
        return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
    }
}

// POST /api/messages
export async function POST(req: NextRequest) {
    try {
        let session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();
        const body = await req.json();

        const chatId = body.chat_id || body.conversation_id;
        const messageText = body.message_text || body.content;

        const newMessage = new Message({
            chat_id: chatId,
            sender_id: (session.user as any).id,
            message_text: messageText,
            message_type: body.message_type || body.type || 'text',
            attachment_url: body.attachment_url || body.media_url,
        });

        await newMessage.save();

        // Side effect: update chat
        await Chat.findByIdAndUpdate(chatId, {
            last_message: messageText,
            last_message_at: new Date(),
        });

        return NextResponse.json(newMessage, { status: 201 });
    } catch (error) {
        console.error("Create message error:", error);
        return NextResponse.json({ error: "Failed to create message" }, { status: 500 });
    }
}
