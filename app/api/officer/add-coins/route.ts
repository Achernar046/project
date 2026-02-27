import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';
import { mintCoins } from '@/lib/blockchain';
import { Transaction } from '@/models/types';
import { ObjectId } from 'mongodb';

export async function POST(request: NextRequest) {
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

        const { user_id, amount } = await request.json();
        const numericAmount = Number(amount);

        // Validate input
        if (!user_id || !numericAmount) {
            return NextResponse.json(
                { error: 'User ID and amount are required' },
                { status: 400 }
            );
        }

        if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
            return NextResponse.json(
                { error: 'Amount must be greater than 0' },
                { status: 400 }
            );
        }

        const db = await getDatabase();

        // Get user details
        const user = await db.collection('users').findOne({
            _id: new ObjectId(user_id),
        });

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        const { txHash } = await mintCoins(
            user.wallet_address,
            numericAmount,
            `Officer manual mint by ${decoded.email}`
        );

        // Create transaction record
        const transaction: Transaction = {
            user_id: new ObjectId(user_id),
            type: 'mint',
            amount: numericAmount,
            to_address: user.wallet_address,
            blockchain_tx_hash: txHash,
            status: 'confirmed',
            created_at: new Date(),
        };

        const result = await db.collection<Transaction>('transactions').insertOne(transaction);

        return NextResponse.json(
            {
                message: 'Coins added successfully',
                transaction: {
                    id: result.insertedId.toString(),
                    amount: numericAmount,
                    user: user.email,
                    walletAddress: user.wallet_address,
                    txHash,
                },
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Add coins error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
