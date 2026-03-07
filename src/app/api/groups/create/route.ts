import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Conversation, User } from '@/lib/models';
import dbConnect from '@/lib/mongodb';

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { name, participantIds } = await req.json();
        if (!name || !participantIds || !Array.isArray(participantIds)) {
            return NextResponse.json({ error: 'Name and participant IDs are required' }, { status: 400 });
        }

        await dbConnect();

        const currentUser = await User.findOne({ email: session.user.email });
        if (!currentUser) {
            return NextResponse.json({ error: 'Current user not found' }, { status: 404 });
        }

        // Add current user to participants if not already there
        const participants = Array.from(new Set([...participantIds, currentUser._id.toString()]));

        const conversation = await Conversation.create({
            name,
            participants,
            isGroup: true,
            last_message: `Group "${name}" created`,
            last_message_at: new Date()
        });

        return NextResponse.json({ conversation });
    } catch (error: any) {
        console.error('Create group error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
