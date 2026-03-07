import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { User } from '@/lib/models';
import dbConnect from '@/lib/mongodb';

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            console.log("Friend Request API: Unauthorized");
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { targetUserId } = await req.json();
        console.log(`Friend Request API: from="${session.user.email}" to="${targetUserId}"`);

        if (!targetUserId) {
            return NextResponse.json({ error: 'Target user ID is required' }, { status: 400 });
        }

        await dbConnect();

        const currentUser = await User.findOne({ email: session.user.email });
        if (!currentUser) {
            console.log(`Friend Request API: Current user not found in DB: ${session.user.email}`);
            return NextResponse.json({ error: 'Current user not found' }, { status: 404 });
        }

        if (currentUser._id.toString() === targetUserId) {
            return NextResponse.json({ error: 'You cannot add yourself' }, { status: 400 });
        }

        const targetUser = await User.findById(targetUserId);
        if (!targetUser) {
            console.log(`Friend Request API: Target user not found: ${targetUserId}`);
            return NextResponse.json({ error: 'Target user not found' }, { status: 404 });
        }

        // Initialize arrays if missing (Mongoose doesn't always initialize them if doc was created outside schema)
        if (!currentUser.friends) currentUser.friends = [];
        if (!targetUser.friendRequests) targetUser.friendRequests = [];

        console.log(`Friend Request API: Current user friends: ${JSON.stringify(currentUser.friends)}`);

        // Check if already friends
        const isAlreadyFriends = currentUser.friends.some((id: any) => id.toString() === targetUserId);
        if (isAlreadyFriends) {
            return NextResponse.json({ error: 'Already friends' }, { status: 400 });
        }

        // Check if a request is already sent
        const existingRequest = targetUser.friendRequests.find(
            (req: any) => req.from.toString() === currentUser._id.toString() && req.status === 'pending'
        );

        if (existingRequest) {
            return NextResponse.json({ error: 'Friend request already sent' }, { status: 400 });
        }

        // Add request to target user
        targetUser.friendRequests.push({
            from: currentUser._id,
            status: 'pending',
            createdAt: new Date()
        });

        await targetUser.save();
        console.log("Friend Request API: Success");

        return NextResponse.json({ message: 'Friend request sent successfully' });
    } catch (error: any) {
        console.error('Friend Request API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
