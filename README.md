# WasteCoin - Digital Reward System

A simplified blockchain-based application where officers can reward users with WasteCoin (WST) tokens.

## Features

### For Users
- 👁️ **View Balance** - Check your WasteCoin balance in real-time
- 🔐 **Secure Wallet** - Automatic Ethereum wallet generation
- 📊 **Simple Dashboard** - Clean interface showing your coin balance

### For Officers
- 👥 **User Management** - View all registered users
- 💰 **Add Coins** - Directly reward users with coins
- 📈 **Track Activity** - Monitor total users in the system

## Tech Stack

- **Frontend**: Next.js 16 (React 19, TypeScript)
- **Backend**: Next.js API Routes
- **Database**: MongoDB Atlas
- **Authentication**: JWT (JSON Web Tokens)
- **Blockchain**: Ethereum (Sepolia Testnet) - Optional
- **Styling**: CSS Modules

## Prerequisites

- Node.js 18+ 
- MongoDB Atlas account
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd project1
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Copy `.env.example` to `.env.local` and update:
   ```bash
   cp .env.example .env.local
   ```

   Required variables:
   ```env
   # MongoDB Atlas
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/waste-coin-db?retryWrites=true&w=majority

   # JWT Secret (generate a random string)
   JWT_SECRET=your-super-secret-jwt-key-change-this

   # Encryption Secret (32-byte hex string)
   ENCRYPTION_SECRET=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef

   # Next.js
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Set up MongoDB Atlas**
   - Create a cluster at [MongoDB Atlas](https://cloud.mongodb.com/)
   - Create a database user
   - Add your IP to Network Access (or allow 0.0.0.0/0 for development)
   - Copy the connection string to `MONGODB_URI`

5. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000)

## Usage

### Register as User
1. Go to http://localhost:3000/auth
2. Fill in email and password
3. Select **"User (Submit Waste)"** role
4. Click "Create Account"
5. You'll be redirected to `/dashboard` showing your balance

### Register as Officer
1. Go to http://localhost:3000/auth
2. Fill in email and password
3. Select **"Officer (Approve Waste)"** role
4. Click "Create Account"
5. You'll be redirected to `/officer` dashboard

### Add Coins (Officer Only)
1. Login as officer
2. Select a user from the dropdown
3. Enter coin amount
4. Click "Add Coins"
5. User's balance will be updated immediately

## Project Structure

```
project1/
├── app/
│   ├── api/              # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   ├── officer/      # Officer-only endpoints
│   │   ├── users/        # User management
│   │   └── wallet/       # Balance queries
│   ├── auth/             # Auth page
│   ├── dashboard/        # User dashboard
│   └── officer/          # Officer dashboard
├── lib/
│   ├── auth.ts           # JWT utilities
│   ├── mongodb.ts        # Database connection
│   └── wallet.ts         # Wallet generation
├── models/
│   └── types.ts          # TypeScript interfaces
└── .env.local            # Environment variables
```

## Database Collections

### `users`
Stores user accounts with email, password hash, role, and wallet address.

### `wallets`
Stores encrypted private keys for user wallets.

### `transactions`
Records all coin transactions (mint, transfer, exchange).

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login user |
| GET | `/api/wallet/balance` | User | Get coin balance |
| GET | `/api/users/list` | Officer | Get all users |
| POST | `/api/officer/add-coins` | Officer | Add coins to user |

## Security Features

- ✅ Password hashing with bcrypt
- ✅ JWT-based authentication
- ✅ Role-based access control
- ✅ Encrypted private key storage
- ✅ Input validation
- ✅ MongoDB injection protection

## Development

### Run development server
```bash
npm run dev
```

### Build for production
```bash
npm run build
npm start
```

### Lint code
```bash
npm run lint
```

## Troubleshooting

### MongoDB Connection Error
- Check your MongoDB Atlas credentials
- Verify IP whitelist in Network Access
- Ensure connection string includes database name

### Balance Not Updating
- Refresh the page
- Check if transaction was created in MongoDB
- Verify officer added coins successfully

### Authentication Issues
- Clear localStorage and login again
- Check JWT_SECRET in `.env.local`
- Verify token expiration

## Future Enhancements

- [ ] Deploy smart contract to Sepolia testnet
- [ ] Integrate blockchain transactions
- [ ] Add transaction history page
- [ ] Implement coin transfer between users
- [ ] Add email notifications
- [ ] Create admin panel for system management

## License

MIT

## Support

For issues or questions, please open an issue in the repository.

---

**Built with ❤️ using Next.js and MongoDB**
