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

        let username, name, bio, image;
        const contentType = req.headers.get('content-type') || '';

        if (contentType.includes('application/json')) {
            const data = await req.json();
            username = data.username;
            name = data.name;
            bio = data.bio;
            image = data.image;
        } else if (contentType.includes('multipart/form-data')) {
            const formData = await req.formData();
            username = formData.get('username') as string;
            name = formData.get('name') as string;
            bio = formData.get('bio') as string;

            const avatarFile = formData.get('avatar') as File | null;
            if (avatarFile && typeof avatarFile !== 'string' && avatarFile.size > 0) {
                const bytes = await avatarFile.arrayBuffer();
                const buffer = Buffer.from(bytes);
                const ext = avatarFile.name.split('.').pop() || 'png';
                const filename = `avatar_${Date.now()}.${ext}`;

                const { promises: fs } = require('fs');
                const path = require('path');

                const dir = path.join(process.cwd(), 'public', 'media', 'avatar');
                await fs.mkdir(dir, { recursive: true });
                const filePath = path.join(dir, filename);
                await fs.writeFile(filePath, buffer);

                image = `/media/avatar/${filename}`;
            } else {
                image = formData.get('avatar_url') as string;
            }
        }

        await dbConnect();

        const updateData: any = {};
        if (username) updateData.username = username;
        if (name) updateData.name = name;
        if (bio) updateData.bio = bio;
        if (image) updateData.image = image;

        const user = await User.findOneAndUpdate(
            { email: session.user.email },
            { $set: updateData },
            { new: true }
        );

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({
            username: user.username,
            name: user.name,
            bio: user.bio,
            avatar_url: user.image
        });
    } catch (error: any) {
        console.error('Profile update error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
