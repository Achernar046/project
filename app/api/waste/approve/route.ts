import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { requireOfficer, AuthenticatedRequest } from '@/lib/auth-middleware';
import { WasteSubmission, Transaction, User } from '@/models/types';
import { ObjectId } from 'mongodb';
import { mintCoins } from '@/lib/blockchain';

async function handleApprove(request: AuthenticatedRequest) {
    try {
        const { submission_id, coin_amount } = await request.json();

        // Validate input
        if (!submission_id || !coin_amount) {
            return NextResponse.json(
                { error: 'Submission ID and coin amount are required' },
                { status: 400 }
            );
        }

        if (coin_amount <= 0) {
            return NextResponse.json(
                { error: 'Coin amount must be greater than 0' },
                { status: 400 }
            );
        }

        const db = await getDatabase();

        // Find the submission
        const submission = await db
            .collection<WasteSubmission>('waste_submissions')
            .findOne({ _id: new ObjectId(submission_id) });

        if (!submission) {
            return NextResponse.json(
                { error: 'Submission not found' },
                { status: 404 }
            );
        }

        if (submission.status !== 'pending') {
            return NextResponse.json(
                { error: 'Submission already processed' },
                { status: 400 }
            );
        }

        // Get user's wallet address
        const user = await db
            .collection<User>('users')
            .findOne({ _id: submission.user_id });

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Mint coins on blockchain
        const { txHash } = await mintCoins(
            user.wallet_address,
            coin_amount,
            `Waste submission ${submission_id}`
        );

        // Update submission status
        await db.collection<WasteSubmission>('waste_submissions').updateOne(
            { _id: new ObjectId(submission_id) },
            {
                $set: {
                    status: 'approved',
                    coin_amount,
                    reviewed_by: new ObjectId(request.user!.userId),
                    reviewed_at: new Date(),
                    blockchain_tx_hash: txHash,
                    updated_at: new Date(),
                },
            }
        );

        // Record transaction
        const transaction: Transaction = {
            user_id: submission.user_id,
            type: 'mint',
            amount: coin_amount,
            to_address: user.wallet_address,
            blockchain_tx_hash: txHash,
            waste_submission_id: new ObjectId(submission_id),
            status: 'confirmed',
            created_at: new Date(),
        };

        await db.collection<Transaction>('transactions').insertOne(transaction);

        return NextResponse.json({
            message: 'Submission approved and coins minted',
            txHash,
            coin_amount,
        });
    } catch (error) {
        console.error('Approve submission error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    return requireOfficer(request, handleApprove);
}
