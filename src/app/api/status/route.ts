import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { User, Status } from '@/lib/models';
import dbConnect from '@/lib/mongodb';
import { promises as fs } from 'fs';
import path from 'path';

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

        if (action === 'deleteAll') {
            const statuses = await Status.find({ user_id: user._id });
            for (const status of statuses) {
                if (status.media_url) {
                    try {
                        const oldPath = path.join(process.cwd(), 'public', status.media_url.replace(/^\//, ''));
                        await fs.unlink(oldPath);
                    } catch (e) { }
                }
            }
            await Status.deleteMany({ user_id: user._id });
            return NextResponse.json({ message: 'All statuses deleted' });
        }

        if (action === 'delete') {
            const statusId = formData.get('statusId') as string;
            const status = await Status.findOne({ _id: statusId, user_id: user._id });
            if (status) {
                if (status.media_url) {
                    try {
                        const oldPath = path.join(process.cwd(), 'public', status.media_url.replace(/^\//, ''));
                        await fs.unlink(oldPath);
                    } catch (e) { }
                }
                await Status.deleteOne({ _id: statusId });
                return NextResponse.json({ message: 'Status deleted' });
            }
            return NextResponse.json({ error: 'Status not found' }, { status: 404 });
        }

        // For 'add' or 'update'
        if (action === 'update') {
             const oldStatuses = await Status.find({ user_id: user._id });
             for (const status of oldStatuses) {
                if (status.media_url) {
                    try {
                        const oldPath = path.join(process.cwd(), 'public', status.media_url.replace(/^\//, ''));
                        await fs.unlink(oldPath);
                    } catch (e) { }
                }
            }
            await Status.deleteMany({ user_id: user._id });
        }

        const captions = formData.getAll('content') as string[];
        const mediaFiles = formData.getAll('media') as File[];

        if (mediaFiles.length === 0) {
             return NextResponse.json({ error: 'Media is required for status' }, { status: 400 });
        }

        const dir = path.join(process.cwd(), 'public', 'media', 'status');
        await fs.mkdir(dir, { recursive: true });

        for (let i = 0; i < mediaFiles.length; i++) {
            const mediaFile = mediaFiles[i];
            const caption = captions[i] || '';
            let mediaUrl = '';
            let mediaType = 'image';

            if (mediaFile && typeof mediaFile !== 'string' && mediaFile.size > 0) {
                const bytes = await mediaFile.arrayBuffer();
                const buffer = Buffer.from(bytes);
                const ext = mediaFile.name.split('.').pop() || 'png';
                const filename = `status_${Date.now()}_${i}.${ext}`;
                const filePath = path.join(dir, filename);
                await fs.writeFile(filePath, buffer);

                mediaUrl = `/media/status/${filename}`;
                mediaType = mediaFile.type.startsWith('video') ? 'video' : 'image';

                await Status.create({
                    user_id: user._id,
                    media_url: mediaUrl,
                    media_type: mediaType,
                    caption: caption,
                    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000)
                });
            }
        }

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

        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const now = new Date();
        
        // Get own active statuses
        const myStatuses = await Status.find({
            user_id: user._id,
            expires_at: { $gt: now }
        }).sort({ created_at: -1 });

        // Get friends' active statuses
        const friendIds = user.friends || [];
        const friendsWithStatuses = await User.find({
            _id: { $in: friendIds }
        }).select('name profile_picture image username');

        const friendsStatuses = await Promise.all(friendsWithStatuses.map(async (f: any) => {
            const statuses = await Status.find({
                user_id: f._id,
                expires_at: { $gt: now }
            }).sort({ created_at: 1 });

            if (statuses.length === 0) return null;

            return {
                userId: f._id,
                name: f.name,
                username: f.username,
                image: f.profile_picture || f.image,
                statuses: statuses
            };
        }));

        return NextResponse.json({
            myStatuses,
            friendsStatuses: friendsStatuses.filter(f => f !== null)
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

        const statuses = await Status.find({ user_id: user._id });
        for (const status of statuses) {
            if (status.media_url) {
                try {
                    const oldPath = path.join(process.cwd(), 'public', status.media_url.replace(/^\//, ''));
                    await fs.unlink(oldPath);
                } catch (e) { }
            }
        }

        await Status.deleteMany({ user_id: user._id });
        return NextResponse.json({ message: 'Status deleted successfully' });

    } catch (error: any) {
        console.error('Delete status error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
