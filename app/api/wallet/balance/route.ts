import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthenticatedRequest } from '@/lib/auth-middleware';
import { getWalletBalance } from '@/lib/blockchain';

async function handleGetBalance(request: AuthenticatedRequest) {
    try {
        const walletAddress = request.user!.walletAddress;

        // Get balance from blockchain
        const balance = await getWalletBalance(walletAddress);

        return NextResponse.json({
            walletAddress,
            balance,
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
