import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { User } from '@/lib/models';
import dbConnect from '@/lib/mongodb';

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            console.log("Search API: Unauthorized access attempt");
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const query = searchParams.get('query');
        const type = searchParams.get('type') || 'username';

        console.log(`Search API: query="${query}", type="${type}", user="${session.user.email}"`);

        if (!query) {
            return NextResponse.json({ users: [] });
        }

        await dbConnect();

        const currentUserEmail = session.user.email;
        let searchFilter: any = {
            email: { $ne: currentUserEmail }
        };

        if (type === 'email') {
            searchFilter.email = { ...searchFilter.email, $regex: query, $options: 'i' };
        } else {
            searchFilter.$or = [
                { username: { $regex: query, $options: 'i' } },
                { name: { $regex: query, $options: 'i' } }
            ];
        }

        const users = await User.find(searchFilter)
            .select('_id name email image username bio isActive')
            .limit(10);

        console.log(`Search API: Found ${users.length} users`);
        return NextResponse.json({ users });
    } catch (error: any) {
        console.error('Search API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
