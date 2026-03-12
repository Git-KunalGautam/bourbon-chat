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

        const formData = await req.formData();
        const action = (formData.get('action') as string) || 'add'; // 'add', 'update', 'delete', 'deleteAll'

        await dbConnect();
        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const { promises: fs } = require('fs');
        const path = require('path');

        if (action === 'deleteAll') {
            for (const status of user.statuses) {
                if (status.mediaUrl) {
                    try {
                        const oldPath = path.join(process.cwd(), 'public', status.mediaUrl.replace(/^\//, ''));
                        await fs.unlink(oldPath);
                    } catch (e) { }
                } else if (status.content && status.content.startsWith('/media/status/')) {
                    try {
                        const oldPath = path.join(process.cwd(), 'public', status.content.replace(/^\//, ''));
                        await fs.unlink(oldPath);
                    } catch (e) { }
                }
            }
            user.statuses = [];
            await user.save();
            return NextResponse.json({ message: 'All statuses deleted' });
        }

        if (action === 'delete') {
            const statusId = formData.get('statusId') as string;
            const statusIdx = user.statuses.findIndex((s: any) => s._id.toString() === statusId);
            if (statusIdx !== -1) {
                const status = user.statuses[statusIdx];
                if (status.mediaUrl) {
                    try {
                        const oldPath = path.join(process.cwd(), 'public', status.mediaUrl.replace(/^\//, ''));
                        await fs.unlink(oldPath);
                    } catch (e) { }
                } else if (status.content && status.content.startsWith('/media/status/')) {
                    try {
                        const oldPath = path.join(process.cwd(), 'public', status.content.replace(/^\//, ''));
                        await fs.unlink(oldPath);
                    } catch (e) { }
                }
                user.statuses.splice(statusIdx, 1);
                await user.save();
                return NextResponse.json({ message: 'Status deleted' });
            }
            return NextResponse.json({ error: 'Status not found' }, { status: 404 });
        }

        // For 'add' or 'update'
        if (action === 'update') {
            for (const status of user.statuses) {
                if (status.mediaUrl) {
                    try {
                        const oldPath = path.join(process.cwd(), 'public', status.mediaUrl.replace(/^\//, ''));
                        await fs.unlink(oldPath);
                    } catch (e) { }
                } else if (status.content && status.content.startsWith('/media/status/')) {
                    try {
                        const oldPath = path.join(process.cwd(), 'public', status.content.replace(/^\//, ''));
                        await fs.unlink(oldPath);
                    } catch (e) { }
                }
            }
            user.statuses = []; // clear out old manually
        }

        const contents = formData.getAll('content') as string[];
        const mediaFiles = formData.getAll('media') as File[];

        if (mediaFiles.length === 0 && contents.length === 0) {
            return NextResponse.json({ error: 'Content or media is required' }, { status: 400 });
        }

        const dir = path.join(process.cwd(), 'public', 'media', 'status');
        await fs.mkdir(dir, { recursive: true });

        // User can upload multiple files/texts in one go
        const maxLen = Math.max(contents.length, mediaFiles.length);
        for (let i = 0; i < maxLen; i++) {
            const mediaFile = mediaFiles[i];
            const content = contents[i] || '';
            let mediaUrl = '';
            let mediaType = 'text';

            if (mediaFile && typeof mediaFile !== 'string' && mediaFile.size > 0) {
                const bytes = await mediaFile.arrayBuffer();
                const buffer = Buffer.from(bytes);
                const ext = mediaFile.name.split('.').pop() || 'png';
                const filename = `status_${Date.now()}_${i}.${ext}`;
                const filePath = path.join(dir, filename);
                await fs.writeFile(filePath, buffer);

                mediaUrl = `/media/status/${filename}`;
                mediaType = mediaFile.type.startsWith('video') ? 'video' : 'image';
            }

            if (content || mediaUrl) {
                user.statuses.push({
                    content,
                    mediaUrl,
                    mediaType,
                    createdAt: new Date(),
                    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
                });
            }
        }

        await user.save();
        return NextResponse.json({ message: `Status ${action}ed successfully` });

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

export async function DELETE(req: NextRequest) {
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

        const { promises: fs } = require('fs');
        const path = require('path');

        // Clean up old media files
        for (const status of user.statuses) {
            if (status.mediaUrl) {
                try {
                    const oldPath = path.join(process.cwd(), 'public', status.mediaUrl.replace(/^\//, ''));
                    await fs.unlink(oldPath);
                } catch (e) {
                    console.error('Failed to clear old status media:', e);
                }
            } else if (status.content && status.content.startsWith('/media/status/')) {
                try {
                    const oldPath = path.join(process.cwd(), 'public', status.content.replace(/^\//, ''));
                    await fs.unlink(oldPath);
                } catch (e) {
                    console.error('Failed to clear old status media:', e);
                }
            }
        }

        user.statuses = [];
        await user.save();

        return NextResponse.json({ message: 'Status deleted successfully' });

    } catch (error: any) {
        console.error('Delete status error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
