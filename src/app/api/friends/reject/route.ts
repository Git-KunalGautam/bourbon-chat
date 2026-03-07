import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { User } from '@/lib/models';
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
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Find the request and update status to rejected
        const requestIndex = currentUser.friendRequests.findIndex(
            (r: any) => r.from.toString() === fromUserId && r.status === 'pending'
        );

        if (requestIndex === -1) {
            return NextResponse.json({ error: 'Friend request not found' }, { status: 404 });
        }

        currentUser.friendRequests[requestIndex].status = 'rejected';
        await currentUser.save();

        return NextResponse.json({ message: 'Friend request rejected' });
    } catch (error: any) {
        console.error('Reject friend request error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
