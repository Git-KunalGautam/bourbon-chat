import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { User, Conversation } from '@/lib/models';
import dbConnect from '@/lib/mongodb';

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
            return NextResponse.json({ error: 'Friend request not found' }, { status: 404 });
        }

        // Update status to accepted
        currentUser.friendRequests[requestIndex].status = 'accepted';

        // Add to friends lists (ensure we store ObjectIDs)
        const mongoose = (await import('mongoose')).default;
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

        // Create a conversation if it doesn't exist
        let conversation = await Conversation.findOne({
            isGroup: false,
            participants: { $all: [currentUser._id, fromUser._id] }
        });

        if (!conversation) {
            conversation = await Conversation.create({
                participants: [currentUser._id, fromUser._id],
                isGroup: false
            });
        }

        return NextResponse.json({ message: 'Friend request accepted', conversationId: conversation._id });
    } catch (error: any) {
        console.error('Accept friend request error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
