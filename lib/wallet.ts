import { ethers } from 'ethers';
import crypto from 'crypto';

const ENCRYPTION_SECRET = process.env.ENCRYPTION_SECRET || 'default-secret-change-this';
const ALGORITHM = 'aes-256-cbc';

/**
 * Generate a new Ethereum wallet
 */
export function generateWallet(): { address: string; privateKey: string } {
    const wallet = ethers.Wallet.createRandom();
    return {
        address: wallet.address,
        privateKey: wallet.privateKey,
    };
}

/**
 * Encrypt private key for storage
 */
export function encryptPrivateKey(privateKey: string): {
    encryptedKey: string;
    iv: string;
} {
    // Create a 32-byte key from the secret
    const key = crypto.createHash('sha256').update(ENCRYPTION_SECRET).digest();

    // Generate a random initialization vector
    const iv = crypto.randomBytes(16);

    // Create cipher
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    // Encrypt the private key
    let encrypted = cipher.update(privateKey, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return {
        encryptedKey: encrypted,
        iv: iv.toString('hex'),
    };
}

/**
 * Decrypt private key for signing transactions
 */
export function decryptPrivateKey(encryptedKey: string, iv: string): string {
    // Create a 32-byte key from the secret
    const key = crypto.createHash('sha256').update(ENCRYPTION_SECRET).digest();

    // Create decipher
    const decipher = crypto.createDecipheriv(
        ALGORITHM,
        key,
        Buffer.from(iv, 'hex')
    );

    // Decrypt the private key
    let decrypted = decipher.update(encryptedKey, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
}

/**
 * Create a wallet instance from encrypted private key
 */
export function getWalletFromEncrypted(
    encryptedKey: string,
    iv: string
): ethers.Wallet {
    const privateKey = decryptPrivateKey(encryptedKey, iv);
    return new ethers.Wallet(privateKey);
}
