import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { User } from '@/lib/models';
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

        return NextResponse.json({
            id: user._id,
            username: user.username,
            name: user.name,
            email: user.email,
            bio: user.bio,
            avatar_url: user.profile_picture || user.image, // Fallback
            isActive: user.isActive,
            friends: user.friends,
            friendRequests: user.friendRequests,
            phone: user.phone,
            is_online: user.is_online,
            last_seen: user.last_seen
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
