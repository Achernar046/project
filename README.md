# WasteCoin - Waste-to-Blockchain Rewards System

A full-stack Web3 application that incentivizes waste management by converting waste submissions into blockchain-based coins (WasteCoin/WST) on the Sepolia testnet.

## 🌟 Features

- **User Registration & Auto Wallet Creation**: Users get an Ethereum wallet automatically upon registration
- **Waste Submission**: Submit waste with type, weight, and description
- **Officer Verification**: Human-in-the-loop approval system for waste submissions
- **Blockchain Rewards**: Earn WST tokens minted on Sepolia testnet
- **Secure Authentication**: Custom JWT-based authentication with bcrypt password hashing
- **Encrypted Wallets**: Private keys encrypted with AES-256 and stored securely
- **Modern UI**: Glassmorphism design with gradients and animations

## 🛠️ Tech Stack

### Frontend
- Next.js 14+ with TypeScript
- React 19
- Vanilla CSS with CSS variables
- Inter font from Google Fonts

### Backend
- Next.js API Routes
- MongoDB Atlas for database
- Custom JWT authentication
- bcryptjs for password hashing

### Blockchain
- Solidity 0.8.20 (ERC20 smart contract)
- Ethers.js v6
- Sepolia Testnet
- Hardhat for development

## 📋 Prerequisites

1. **Node.js** (v18 or higher)
2. **MongoDB Atlas** account and cluster
3. **Sepolia Testnet** RPC URL (Infura or Alchemy)
4. **Sepolia ETH** for deploying contract and minting coins

## 🚀 Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in the following variables in `.env.local`:

```env
# MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/waste-coin-db

# JWT Secret (generate a random string)
JWT_SECRET=your-super-secret-jwt-key

# Encryption Secret (generate a 32-byte hex string)
ENCRYPTION_SECRET=your-32-byte-hex-encryption-key

# Sepolia RPC URL (get from Infura or Alchemy)
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID

# Officer wallet private key (needs Sepolia ETH)
OFFICER_PRIVATE_KEY=0x...

# Contract address (fill after deployment)
WASTE_COIN_CONTRACT_ADDRESS=

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Get Sepolia ETH

1. Create a wallet or use an existing one
2. Get free Sepolia ETH from faucets:
   - https://sepoliafaucet.com/
   - https://www.infura.io/faucet/sepolia
3. Use this wallet's private key as `OFFICER_PRIVATE_KEY`

### 4. Deploy Smart Contract

Compile the contract:
```bash
npm run compile
```

Deploy to Sepolia:
```bash
npm run deploy:sepolia
```

Copy the contract address from the output and add it to `.env.local`:
```env
WASTE_COIN_CONTRACT_ADDRESS=0x...
```

### 5. Run the Application

Development mode:
```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## 📖 Usage Guide

### For Users

1. **Register**: Go to `/auth` and create an account (role: User)
2. **Auto Wallet**: A wallet is created automatically for you
3. **Submit Waste**: Go to dashboard and submit waste details
4. **Wait for Approval**: An officer will review your submission
5. **Receive Coins**: WST tokens are minted to your wallet

### For Officers

1. **Register**: Create an account with role: Officer
2. **Review Submissions**: See all pending waste submissions
3. **Approve**: Click approve to mint coins to users
4. **Blockchain Transaction**: Coins are minted via smart contract

## 🏗️ Project Structure

```
project1/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── register/route.ts
│   │   │   └── login/route.ts
│   │   ├── waste/
│   │   │   ├── submit/route.ts
│   │   │   ├── pending/route.ts
│   │   │   └── approve/route.ts
│   │   ├── wallet/
│   │   │   └── balance/route.ts
│   │   └── transactions/
│   │       └── history/route.ts
│   ├── auth/
│   │   └── page.tsx
│   ├── dashboard/
│   │   └── page.tsx
│   ├── officer/
│   │   └── page.tsx
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── contracts/
│   └── WasteCoin.sol
├── lib/
│   ├── mongodb.ts
│   ├── auth.ts
│   ├── wallet.ts
│   ├── blockchain.ts
│   └── auth-middleware.ts
├── models/
│   └── types.ts
├── scripts/
│   └── deploy.js
├── hardhat.config.js
├── next.config.js
├── tsconfig.json
└── package.json
```

## 🔐 Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Tokens**: Secure token-based authentication
- **Private Key Encryption**: AES-256 encryption for wallet keys
- **Role-Based Access**: User and Officer roles with middleware
- **Environment Variables**: Sensitive data in .env files

## 🪙 Coin Calculation

Default rates (coins per kg):
- Plastic: 2 WST/kg
- Paper: 1 WST/kg
- Metal: 5 WST/kg
- Glass: 3 WST/kg
- Organic: 1 WST/kg
- Electronic: 10 WST/kg

## 📊 Database Collections

### users
- email, password_hash, role, wallet_address

### wallets
- user_id, address, encrypted_private_key, encryption_iv

### waste_submissions
- user_id, waste_type, weight_kg, status, coin_amount, blockchain_tx_hash

### transactions
- user_id, type, amount, blockchain_tx_hash, status

## 🔗 Blockchain Explorer

View transactions on Sepolia Etherscan:
```
https://sepolia.etherscan.io/address/YOUR_CONTRACT_ADDRESS
```

## 🐛 Troubleshooting

### Contract deployment fails
- Ensure you have enough Sepolia ETH
- Check RPC URL is correct
- Verify private key format (should start with 0x)

### MongoDB connection error
- Check connection string format
- Verify network access in MongoDB Atlas
- Ensure database user has correct permissions

### JWT errors
- Verify JWT_SECRET is set
- Check token expiration
- Clear localStorage and login again

## 📝 License

MIT

## 👥 Roles

- **User**: Submit waste and earn coins
- **Officer**: Review and approve submissions

## 🌐 Deployment

For production deployment:
1. Deploy smart contract to mainnet or Polygon
2. Update environment variables
3. Deploy Next.js app to Vercel/Netlify
4. Configure MongoDB production cluster

---

Built with ❤️ for a sustainable future
