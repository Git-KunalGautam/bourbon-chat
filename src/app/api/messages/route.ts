import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Message, Conversation } from "@/lib/models";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// GET /api/messages?conversation_id=...
export async function GET(req: NextRequest) {
    try {
        let session = await getServerSession(authOptions);

        // POSTMAN TEST BYPASS (ENABLED ONLY IN DEV)
        if (!session && process.env.NODE_ENV === 'development') {
            session = { user: { id: '65e751234567890abcdef123', email: 'postman@test.com' } } as any;
        }

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();
        const { searchParams } = new URL(req.url);
        const conversation_id = searchParams.get("conversation_id");

        if (!conversation_id) {
            return NextResponse.json({ error: "conversation_id is required" }, { status: 400 });
        }

        const messages = await Message.find({ conversation_id })
            .sort({ createdAt: 1 })
            .limit(50);

        return NextResponse.json(messages);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
    }
}

// POST /api/messages
export async function POST(req: NextRequest) {
    try {
        let session = await getServerSession(authOptions);

        // POSTMAN TEST BYPASS (ENABLED ONLY IN DEV)
        if (!session && process.env.NODE_ENV === 'development') {
            session = { user: { id: '65e751234567890abcdef123', email: 'postman@test.com' } } as any;
        }

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();
        const body = await req.json();

        const newMessage = new Message({
            ...body,
            sender_id: (session.user as any).id,
        });

        await newMessage.save();

        // Side effect: update conversation
        await Conversation.findByIdAndUpdate(body.conversation_id, {
            last_message: body.content,
            last_message_at: new Date(),
        });

        return NextResponse.json(newMessage, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to create message" }, { status: 500 });
    }
}
