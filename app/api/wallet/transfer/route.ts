import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthenticatedRequest } from '@/lib/auth-middleware';
import { getUserWalletSigner } from '@/lib/wallet';
import { getContractWithSigner } from '@/lib/blockchain';
import { getDatabase } from '@/lib/mongodb';
import { Transaction } from '@/models/types';
import { ObjectId } from 'mongodb';
import { ethers } from 'ethers';

async function handleTransfer(request: AuthenticatedRequest) {
    try {
        const { to_address, amount } = await request.json();
        const userId = request.user!.userId;

        // Validate input
        if (!to_address || !amount) {
            return NextResponse.json(
                { error: 'to_address and amount are required' },
                { status: 400 }
            );
        }

        if (!ethers.isAddress(to_address)) {
            return NextResponse.json(
                { error: 'Invalid destination address' },
                { status: 400 }
            );
        }

        const numericAmount = Number(amount);
        if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
            return NextResponse.json(
                { error: 'Amount must be a positive number' },
                { status: 400 }
            );
        }

        // Get user's wallet signer (decrypt from DB → connect to Sepolia)
        const walletSigner = await getUserWalletSigner(userId);

        // Get contract with this user's signer
        const contract = getContractWithSigner(walletSigner);

        // Convert amount to wei (18 decimals)
        const amountInWei = ethers.parseEther(numericAmount.toString());

        // Send the transfer transaction on Sepolia
        const tx = await contract.transfer(to_address, amountInWei);
        const receipt = await tx.wait();

        // Record transaction in MongoDB
        const db = await getDatabase();
        const transaction: Transaction = {
            user_id: new ObjectId(userId),
            type: 'transfer',
            amount: numericAmount,
            from_address: walletSigner.address,
            to_address,
            blockchain_tx_hash: receipt.hash,
            status: 'confirmed',
            created_at: new Date(),
        };

        await db.collection<Transaction>('transactions').insertOne(transaction);

        return NextResponse.json({
            message: 'Transfer successful',
            txHash: receipt.hash,
            from: walletSigner.address,
            to: to_address,
            amount: numericAmount,
            symbol: 'WST',
            network: 'sepolia',
            etherscanUrl: `https://sepolia.etherscan.io/tx/${receipt.hash}`,
        });
    } catch (error: unknown) {
        console.error('Transfer error:', error);

        const message = error instanceof Error ? error.message : 'Transfer failed';

        // User-friendly error messages
        if (message.includes('insufficient funds')) {
            return NextResponse.json(
                { error: 'Insufficient WST balance or ETH for gas' },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: message },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    return requireAuth(request, handleTransfer);
}
