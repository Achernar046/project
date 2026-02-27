import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthenticatedRequest } from '@/lib/auth-middleware';
import { getProvider } from '@/lib/blockchain';
import { getWalletBalance } from '@/lib/blockchain';
import { getDatabase } from '@/lib/mongodb';
import { Wallet } from '@/models/types';
import { ObjectId } from 'mongodb';
import { ethers } from 'ethers';

async function handleGetInfo(request: AuthenticatedRequest) {
    try {
        const userId = request.user!.userId;
        const walletAddress = request.user!.walletAddress;

        // Get ETH balance from Sepolia
        const provider = getProvider();
        const ethBalance = await provider.getBalance(walletAddress);

        // Get WST token balance
        let wstBalance = '0';
        try {
            wstBalance = await getWalletBalance(walletAddress);
        } catch {
            // Contract may not be deployed yet
        }

        // Get wallet record from DB to confirm custodial storage
        const db = await getDatabase();
        const walletDoc = await db.collection<Wallet>('wallets').findOne({
            user_id: new ObjectId(userId),
        });

        return NextResponse.json({
            walletAddress,
            ethBalance: ethers.formatEther(ethBalance),
            wstBalance,
            symbol: 'WST',
            network: 'sepolia',
            chainId: 11155111,
            custodial: true,
            keyStoredEncrypted: !!walletDoc?.encrypted_private_key,
            createdAt: walletDoc?.created_at,
        });
    } catch (error) {
        console.error('Get wallet info error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch wallet info' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    return requireAuth(request, handleGetInfo);
}
