import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';
import { Transaction } from '@/models/types';

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

        if (decoded.role !== 'officer') {
            return NextResponse.json(
                { error: 'Forbidden: Officer access only' },
                { status: 403 }
            );
        }

        const db = await getDatabase();

        // Get recent transactions across all users with user info
        const transactions = await db
            .collection<Transaction>('transactions')
            .aggregate([
                { $sort: { created_at: -1 } },
                { $limit: 20 },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'user_id',
                        foreignField: '_id',
                        as: 'user',
                    },
                },
                { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
                {
                    $project: {
                        _id: 1,
                        type: 1,
                        amount: 1,
                        to_address: 1,
                        blockchain_tx_hash: 1,
                        status: 1,
                        created_at: 1,
                        'user.name': 1,
                        'user.email': 1,
                        'user.wallet_address': 1,
                    },
                },
            ])
            .toArray();

        // Get total distributed amount
        const totalDistributed = await db
            .collection<Transaction>('transactions')
            .aggregate([
                { $match: { status: 'confirmed' } },
                { $group: { _id: null, total: { $sum: '$amount' } } },
            ])
            .toArray();

        return NextResponse.json({
            transactions,
            count: transactions.length,
            totalDistributed: totalDistributed[0]?.total || 0,
        });
    } catch (error) {
        console.error('Get officer transactions error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
