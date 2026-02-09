import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthenticatedRequest } from '@/lib/auth-middleware';
import { getDatabase } from '@/lib/mongodb';
import { Transaction } from '@/models/types';
import { ObjectId } from 'mongodb';

async function handleGetBalance(request: AuthenticatedRequest) {
    try {
        const userId = request.user!.userId;
        const walletAddress = request.user!.walletAddress;

        const db = await getDatabase();

        // Calculate balance from transactions
        const transactions = await db
            .collection<Transaction>('transactions')
            .find({
                user_id: new ObjectId(userId),
                status: 'confirmed',
            })
            .toArray();

        // Sum all transaction amounts
        const balance = transactions.reduce((sum, tx) => sum + tx.amount, 0);

        return NextResponse.json({
            walletAddress,
            balance: balance.toString(),
            symbol: 'WST',
        });
    } catch (error) {
        console.error('Get balance error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch balance' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    return requireAuth(request, handleGetBalance);
}
