import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { requireAuth, AuthenticatedRequest } from '@/lib/auth-middleware';
import { WasteSubmission } from '@/models/types';
import { ObjectId } from 'mongodb';

async function handleSubmit(request: AuthenticatedRequest) {
    try {
        const { waste_type, weight_kg, description, image_url } = await request.json();

        // Validate input
        if (!waste_type || !weight_kg) {
            return NextResponse.json(
                { error: 'Waste type and weight are required' },
                { status: 400 }
            );
        }

        if (weight_kg <= 0) {
            return NextResponse.json(
                { error: 'Weight must be greater than 0' },
                { status: 400 }
            );
        }

        const db = await getDatabase();

        // Create waste submission
        const submission: WasteSubmission = {
            user_id: new ObjectId(request.user!.userId),
            waste_type,
            weight_kg: parseFloat(weight_kg),
            description,
            image_url,
            status: 'pending',
            created_at: new Date(),
            updated_at: new Date(),
        };

        const result = await db.collection<WasteSubmission>('waste_submissions').insertOne(submission);

        return NextResponse.json(
            {
                message: 'Waste submission created successfully',
                submission: {
                    id: result.insertedId,
                    ...submission,
                },
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Waste submission error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    return requireAuth(request, handleSubmit);
}
