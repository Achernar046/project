import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { comparePassword, generateToken } from '@/lib/auth';
import { User } from '@/models/types';

export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json();

        // Validate input
        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            );
        }

        const db = await getDatabase();

        // Find user by email
        const user = await db.collection<User>('users').findOne({ email });

        if (!user) {
            return NextResponse.json(
                { error: 'Invalid email or password' },
                { status: 401 }
            );
        }

        // Verify password
        const isPasswordValid = await comparePassword(password, user.password_hash);

        if (!isPasswordValid) {
            return NextResponse.json(
                { error: 'Invalid email or password' },
                { status: 401 }
            );
        }

        // Generate JWT token
        const token = generateToken({
            userId: user._id!.toString(),
            email: user.email,
            role: user.role,
            walletAddress: user.wallet_address,
        });

        return NextResponse.json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
                walletAddress: user.wallet_address,
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
