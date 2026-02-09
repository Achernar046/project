import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';
import { User } from '@/models/types';

export async function GET(request: NextRequest) {
    try {
        const token = request.headers.get('authorization')?.replace('Bearer ', '');

        if (!token) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const decoded = verifyToken(token);

        if (!decoded) {
            return NextResponse.json(
                { error: 'Invalid token' },
                { status: 401 }
            );
        }

        // Check if user is an officer
        if (decoded.role !== 'officer') {
            return NextResponse.json(
                { error: 'Forbidden: Officer access only' },
                { status: 403 }
            );
        }

        const db = await getDatabase();

        // Get all users with role 'user' (exclude officers)
        const users = await db
            .collection<User>('users')
            .find({ role: 'user' })
            .project({
                _id: 1,
                user_id: 1,
                name: 1,
                email: 1,
                wallet_address: 1,
                created_at: 1,
            })
            .sort({ created_at: -1 })
            .toArray();

        return NextResponse.json(
            {
                users: users.map((user) => ({
                    id: user._id?.toString(),
                    userId: user.user_id,
                    name: user.name,
                    email: user.email,
                    walletAddress: user.wallet_address,
                    createdAt: user.created_at,
                })),
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Get users error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
