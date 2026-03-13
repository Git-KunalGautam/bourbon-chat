import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Chat, User, ChatParticipant } from '@/lib/models';
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

        // Find all chat_ids where user is a participant
        const userParticipations = await ChatParticipant.find({ user_id: user._id });
        const chatIds = userParticipations.map(p => p.chat_id);

        // Find chats
        const chats = await Chat.find({
            _id: { $in: chatIds }
        }).sort({ last_message_at: -1 });

        // Format for frontend
        const formattedConversations = await Promise.all(chats.map(async (chat) => {
            const isGroup = chat.chat_type === 'group';
            let name = chat.chat_name;
            let avatar_url = '';
            let isActive = 0;

            // Get all participants for this chat
            const participants = await ChatParticipant.find({ chat_id: chat._id }).populate('user_id', 'name profile_picture username email isActive bio');
            
            if (!isGroup) {
                const otherParticipantData = participants.find((p: any) => p.user_id._id.toString() !== user._id.toString());
                const otherUser = otherParticipantData?.user_id as any;
                name = otherUser?.username || otherUser?.name || 'Unknown';
                avatar_url = otherUser?.profile_picture || '';
                isActive = otherUser?.isActive || 0;
            } else {
                avatar_url = `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'Group')}&background=random`;
                isActive = 1;
            }

            return {
                id: chat._id,
                name,
                avatar_url,
                last_message: chat.last_message,
                last_message_time: chat.last_message_at,
                isGroup,
                isActive,
                members: participants.map((p: any) => ({
                    id: p.user_id._id,
                    name: p.user_id.name,
                    username: p.user_id.username,
                    image: p.user_id.profile_picture || p.user_id.image,
                    role: p.role
                }))
            };
        }));

        return NextResponse.json({ conversations: formattedConversations });
    } catch (error: any) {
        console.error('Get conversations error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
