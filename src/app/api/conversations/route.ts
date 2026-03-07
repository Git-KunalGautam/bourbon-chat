import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Conversation, User } from '@/lib/models';
import dbConnect from '@/lib/mongodb';

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Find conversations where user is a participant
        const conversations = await Conversation.find({
            participants: user._id
        })
            .populate('participants', 'name image username email isActive bio')
            .sort({ last_message_at: -1 });

        // Format for frontend
        const formattedConversations = conversations.map(conv => {
            const isGroup = conv.isGroup;
            let name = conv.name;
            let avatar_url = '';
            let isActive = 0;

            if (!isGroup) {
                const otherParticipant = conv.participants.find((p: any) => p._id.toString() !== user._id.toString());
                name = otherParticipant?.username || otherParticipant?.name || 'Unknown';
                avatar_url = otherParticipant?.image || '';
                isActive = (otherParticipant as any)?.isActive || 0;
            } else {
                avatar_url = `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'Group')}&background=random`;
                // Group isActive can be 1 by default or logic based
                isActive = 1;
            }

            return {
                id: conv._id,
                name,
                avatar_url,
                last_message: conv.last_message,
                last_message_time: conv.last_message_at,
                isGroup,
                isActive,
            };
        });

        return NextResponse.json({ conversations: formattedConversations });
    } catch (error: any) {
        console.error('Get conversations error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
