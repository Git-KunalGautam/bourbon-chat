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

        const contentType = req.headers.get('content-type') || '';
        let content, mediaType;

        if (contentType.includes('multipart/form-data')) {
            const formData = await req.formData();
            content = formData.get('content') as string;

            const mediaFile = formData.get('media') as File | null;
            if (mediaFile && typeof mediaFile !== 'string' && mediaFile.size > 0) {
                const bytes = await mediaFile.arrayBuffer();
                const buffer = Buffer.from(bytes);
                const ext = mediaFile.name.split('.').pop() || 'png';
                const filename = `status_${Date.now()}.${ext}`;

                const { promises: fs } = require('fs');
                const path = require('path');

                const dir = path.join(process.cwd(), 'public', 'media', 'status');
                await fs.mkdir(dir, { recursive: true });
                const filePath = path.join(dir, filename);
                await fs.writeFile(filePath, buffer);

                // If there's a file, content is the URL. User text could be stored elsewhere but the schema only has content.
                content = `/media/status/${filename}`;
                mediaType = mediaFile.type.startsWith('video') ? 'video' : 'image';
            } else {
                mediaType = 'text';
            }
        } else {
            const data = await req.json();
            content = data.content;
            mediaType = data.mediaType;
        }

        if (!content) {
            return NextResponse.json({ error: 'Content is required' }, { status: 400 });
        }

        await dbConnect();

        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        user.statuses.push({
            content,
            mediaType: mediaType || 'text',
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
        });

        await user.save();

        return NextResponse.json({ message: 'Status added successfully' });
    } catch (error: any) {
        console.error('Add status error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const user = await User.findOne({ email: session.user.email }).populate('friends');
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Get own active statuses
        const now = new Date();
        const myStatuses = user.statuses.filter((s: any) => s.expiresAt > now);

        // Get friends' active statuses
        const friendIds = user.friends.map((f: any) => f._id);
        const friendsWithStatuses = await User.find({
            _id: { $in: friendIds },
            'statuses.expiresAt': { $gt: now }
        }).select('name image username statuses');

        const friendsStatuses = friendsWithStatuses.map((f: any) => ({
            userId: f._id,
            name: f.name,
            username: f.username,
            image: f.image,
            statuses: f.statuses.filter((s: any) => s.expiresAt > now)
        }));

        return NextResponse.json({
            myStatuses,
            friendsStatuses
        });
    } catch (error: any) {
        console.error('Get status error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
