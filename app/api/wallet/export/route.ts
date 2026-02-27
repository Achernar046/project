import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthenticatedRequest } from '@/lib/auth-middleware';
import { getDatabase } from '@/lib/mongodb';
import { comparePassword } from '@/lib/auth';
import { decryptPrivateKey } from '@/lib/wallet';
import { User, Wallet } from '@/models/types';
import { ObjectId } from 'mongodb';

async function handleExport(request: AuthenticatedRequest) {
    try {
        const { password } = await request.json();
        const userId = request.user!.userId;

        // Require password confirmation for security
        if (!password) {
            return NextResponse.json(
                { error: 'Password is required to export private key' },
                { status: 400 }
            );
        }

        const db = await getDatabase();

        // Verify user's password
        const user = await db.collection<User>('users').findOne({
            _id: new ObjectId(userId),
        });

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        const isPasswordValid = await comparePassword(password, user.password_hash);
        if (!isPasswordValid) {
            return NextResponse.json(
                { error: 'Invalid password' },
                { status: 401 }
            );
        }

        // Get encrypted wallet from DB
        const walletDoc = await db.collection<Wallet>('wallets').findOne({
            user_id: new ObjectId(userId),
        });

        if (!walletDoc) {
            return NextResponse.json(
                { error: 'Wallet not found' },
                { status: 404 }
            );
        }

        // Decrypt and return the private key
        const privateKey = decryptPrivateKey(
            walletDoc.encrypted_private_key,
            walletDoc.encryption_iv
        );

        return NextResponse.json({
            message: 'Private key exported successfully. Keep it safe!',
            walletAddress: walletDoc.address,
            privateKey,
            warning: 'Never share your private key. Anyone with this key can access your funds.',
        });
    } catch (error) {
        console.error('Export wallet error:', error);
        return NextResponse.json(
            { error: 'Failed to export wallet' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    return requireAuth(request, handleExport);
}
