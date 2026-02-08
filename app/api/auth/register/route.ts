import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { hashPassword, generateToken } from '@/lib/auth';
import { generateWallet, encryptPrivateKey } from '@/lib/wallet';
import { User, Wallet } from '@/models/types';

export async function POST(request: NextRequest) {
    try {
        const { email, password, role = 'user' } = await request.json();

        // Validate input
        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                { error: 'Password must be at least 6 characters' },
                { status: 400 }
            );
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: 'Invalid email format' },
                { status: 400 }
            );
        }

        const db = await getDatabase();

        // Check if user already exists
        const existingUser = await db.collection<User>('users').findOne({ email });
        if (existingUser) {
            return NextResponse.json(
                { error: 'User already exists' },
                { status: 409 }
            );
        }

        // Hash password
        const password_hash = await hashPassword(password);

        // Generate Ethereum wallet
        const wallet = generateWallet();
        const { encryptedKey, iv } = encryptPrivateKey(wallet.privateKey);

        // Create user
        const user: User = {
            email,
            password_hash,
            role: role as 'user' | 'officer',
            wallet_address: wallet.address,
            created_at: new Date(),
            updated_at: new Date(),
        };

        const userResult = await db.collection<User>('users').insertOne(user);

        // Store encrypted wallet
        const walletDoc: Wallet = {
            user_id: userResult.insertedId,
            address: wallet.address,
            encrypted_private_key: encryptedKey,
            encryption_iv: iv,
            created_at: new Date(),
        };

        await db.collection<Wallet>('wallets').insertOne(walletDoc);

        // Generate JWT token
        const token = generateToken({
            userId: userResult.insertedId.toString(),
            email: user.email,
            role: user.role,
            walletAddress: user.wallet_address,
        });

        return NextResponse.json(
            {
                message: 'User registered successfully',
                token,
                user: {
                    id: userResult.insertedId,
                    email: user.email,
                    role: user.role,
                    walletAddress: user.wallet_address,
                },
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
