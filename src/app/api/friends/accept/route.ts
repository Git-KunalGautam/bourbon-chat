import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { User, Chat, ChatParticipant } from '@/lib/models';
import dbConnect from '@/lib/mongodb';
import mongoose from 'mongoose';

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { fromUserId } = await req.json();
        if (!fromUserId) {
            return NextResponse.json({ error: 'From User ID is required' }, { status: 400 });
        }

        await dbConnect();

        const currentUser = await User.findOne({ email: session.user.email });
        if (!currentUser) {
            return NextResponse.json({ error: 'Current user not found' }, { status: 404 });
        }

        const fromUser = await User.findById(fromUserId);
        if (!fromUser) {
            return NextResponse.json({ error: 'Sender not found' }, { status: 404 });
        }

        // Initialize arrays if missing
        if (!currentUser.friendRequests) currentUser.friendRequests = [];
        if (!currentUser.friends) currentUser.friends = [];
        if (!fromUser.friends) fromUser.friends = [];

        // Find the request in currentUser's friendRequests 
        const requestIndex = currentUser.friendRequests.findIndex(
            (r: any) => r.from.toString() === fromUserId && r.status === 'pending'
        );

        if (requestIndex === -1) {
             // Fallback: check if they are already friends or if request was already accepted
             if (currentUser.friends.some((id: any) => id.toString() === fromUserId)) {
                  // Already friends, proceed to check conversation
             } else {
                return NextResponse.json({ error: 'Friend request not found' }, { status: 404 });
             }
        } else {
            // Update status to accepted
            currentUser.friendRequests[requestIndex].status = 'accepted';
        }

        // Add to friends lists (ensure we store ObjectIDs)
        const fromUserIdObj = new mongoose.Types.ObjectId(fromUserId);
        const currentUserIdObj = new mongoose.Types.ObjectId(currentUser._id.toString());

        if (!currentUser.friends.some((id: any) => id.toString() === fromUserId)) {
            currentUser.friends.push(fromUserIdObj);
        }
        if (!fromUser.friends.some((id: any) => id.toString() === currentUser._id.toString())) {
            fromUser.friends.push(currentUserIdObj);
        }

        await currentUser.save();
        await fromUser.save();

        // Check if a private chat already exists between these two
        // This is tricky now with the junction table.
        // We need to find chats where both are participants and chat_type is 'private'
        
        const currentUserChats = await ChatParticipant.find({ user_id: currentUser._id }).select('chat_id');
        const fromUserChats = await ChatParticipant.find({ user_id: fromUser._id }).select('chat_id');
        
        const commonChatIds = currentUserChats
            .map(c => c.chat_id.toString())
            .filter(id => fromUserChats.some(f => f.chat_id.toString() === id));
            
        let chat = await Chat.findOne({
            _id: { $in: commonChatIds },
            chat_type: 'private'
        });

        if (!chat) {
            chat = await Chat.create({
                chat_type: 'private',
                created_by: currentUser._id
            });
            
            await ChatParticipant.create([
                { chat_id: chat._id, user_id: currentUser._id, role: 'member' },
                { chat_id: chat._id, user_id: fromUser._id, role: 'member' }
            ]);
        }

        return NextResponse.json({ message: 'Friend request accepted', chatId: chat._id });
    } catch (error: any) {
        console.error('Accept friend request error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
