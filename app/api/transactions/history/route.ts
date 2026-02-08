import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { requireAuth, AuthenticatedRequest } from '@/lib/auth-middleware';
import { Transaction } from '@/models/types';
import { ObjectId } from 'mongodb';

async function handleGetHistory(request: AuthenticatedRequest) {
    try {
        const db = await getDatabase();
        const userId = new ObjectId(request.user!.userId);

        // Get user's transaction history
        const transactions = await db
            .collection<Transaction>('transactions')
            .find({ user_id: userId })
            .sort({ created_at: -1 })
            .limit(50)
            .toArray();

        return NextResponse.json({
            transactions,
            count: transactions.length,
        });
    } catch (error) {
        console.error('Get transaction history error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    return requireAuth(request, handleGetHistory);
}
