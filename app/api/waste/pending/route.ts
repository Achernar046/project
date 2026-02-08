import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { requireOfficer, AuthenticatedRequest } from '@/lib/auth-middleware';
import { WasteSubmission } from '@/models/types';

async function handleGetPending(request: AuthenticatedRequest) {
    try {
        const db = await getDatabase();

        // Get all pending submissions with user information
        const submissions = await db
            .collection<WasteSubmission>('waste_submissions')
            .aggregate([
                { $match: { status: 'pending' } },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'user_id',
                        foreignField: '_id',
                        as: 'user',
                    },
                },
                { $unwind: '$user' },
                {
                    $project: {
                        _id: 1,
                        waste_type: 1,
                        weight_kg: 1,
                        description: 1,
                        image_url: 1,
                        status: 1,
                        created_at: 1,
                        'user.email': 1,
                        'user.wallet_address': 1,
                    },
                },
                { $sort: { created_at: -1 } },
            ])
            .toArray();

        return NextResponse.json({
            submissions,
            count: submissions.length,
        });
    } catch (error) {
        console.error('Get pending submissions error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    return requireOfficer(request, handleGetPending);
}
