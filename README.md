# 🎵 Audio NFT Marketplace - MERN Stack

A full-stack MERN (MongoDB, Express.js, React, Node.js) application for minting, trading, and managing audio NFTs on the blockchain.

## ✨ Features

- **🎧 Audio NFT Minting**: Upload and mint unique audio files as NFTs
- **🏪 Marketplace**: Browse, search, and purchase audio NFTs
- **💼 Wallet Integration**: MetaMask integration for blockchain interactions
- **📱 Responsive Design**: Beautiful, modern UI with Tailwind CSS
- **🔗 IPFS Storage**: Decentralized storage for audio files and metadata
- **💎 Smart Contracts**: Secure Ethereum smart contracts for NFT operations
- **👤 User Profiles**: Manage your NFT collection and sales
- **💰 Royalty System**: Automatic royalty distribution to creators

## 🏗️ Architecture

```
audio-nft-mern/
├── client/                 # React frontend
├── server/                 # Express.js backend API
├── contracts/              # Ethereum smart contracts
└── package.json           # Root package configuration
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- MetaMask browser extension
- Git

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd audio-nft-mern
   ```

2. **Install all dependencies**

   ```bash
   npm run install-all
   ```

3. **Set up environment variables**

   **Backend (.env in /server)**

   ```bash
   cp server/.env.example server/.env
   ```

   Edit `server/.env` with your configuration:

   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/audionft
   CLIENT_URL=http://localhost:3000
   JWT_SECRET=your_jwt_secret_key_here
   IPFS_PROJECT_ID=your_infura_ipfs_project_id
   IPFS_PROJECT_SECRET=your_infura_ipfs_project_secret
   ```

   **Contracts (.env in /contracts)**

   ```bash
   cp contracts/.env.example contracts/.env
   ```

   Edit `contracts/.env` with your blockchain configuration:

   ```env
   PRIVATE_KEY=your_private_key_here
   GOERLI_RPC_URL=https://goerli.infura.io/v3/your_infura_project_id
   ETHERSCAN_API_KEY=your_etherscan_api_key
   ```

4. **Start MongoDB**

   ```bash
   # If using local MongoDB
   mongod

   # Or use MongoDB Cloud Atlas connection string in .env
   ```

5. **Deploy Smart Contracts (Optional - for local development)**

   ```bash
   cd contracts
   npx hardhat node  # Start local blockchain

   # In another terminal
   npm run deploy:localhost
   ```

6. **Start the development servers**

   ```bash
   # From root directory
   npm run dev
   ```

   This will start:

   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 📁 Project Structure

### Frontend (React)

```
client/
├── public/
├── src/
│   ├── components/         # Reusable components
│   │   └── Navbar.js
│   ├── pages/             # Page components
│   │   ├── Home.js
│   │   ├── Mint.js
│   │   ├── Marketplace.js
│   │   └── Profile.js
│   ├── context/           # React Context providers
│   │   └── Web3Context.js
│   ├── App.js
│   ├── index.js
│   └── index.css
├── package.json
├── tailwind.config.js
└── postcss.config.js
```

### Backend (Express.js)

```
server/
├── models/                # MongoDB schemas
│   ├── User.js
│   └── NFT.js
├── routes/                # API routes
│   ├── auth.js
│   ├── nfts.js
│   ├── marketplace.js
│   └── upload.js
├── server.js              # Main server file
├── package.json
└── .env.example
```

### Smart Contracts (Solidity)

```
contracts/
├── contracts/             # Solidity contracts
│   ├── AudioNFT.sol
│   └── AudioNFTMarketplace.sol
├── scripts/               # Deployment scripts
│   └── deploy.js
├── hardhat.config.js
├── package.json
└── .env.example
```

## 🔧 Available Scripts

### Root Directory

```bash
npm run dev                # Start both frontend and backend
npm run install-all        # Install all dependencies
npm run client            # Start only frontend
npm run server            # Start only backend
npm run build             # Build frontend for production
```

### Frontend (/client)

```bash
npm start                 # Start development server
npm run build             # Build for production
npm test                  # Run tests
```

### Backend (/server)

```bash
npm start                 # Start production server
npm run dev               # Start with nodemon (development)
```

### Contracts (/contracts)

```bash
npm run compile           # Compile smart contracts
npm run test              # Run contract tests
npm run deploy:localhost  # Deploy to local network
npm run deploy:testnet    # Deploy to Goerli testnet
npm run deploy:mainnet    # Deploy to Ethereum mainnet
```

## 🌐 API Endpoints

### Authentication

- `POST /api/auth/login` - Authenticate with wallet
- `GET /api/auth/me` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### NFTs

- `GET /api/nfts` - Get all NFTs (with filtering)
- `GET /api/nfts/:id` - Get single NFT
- `POST /api/nfts` - Create new NFT
- `PUT /api/nfts/:id/list` - List NFT for sale
- `PUT /api/nfts/:id/unlist` - Remove NFT from sale

### Marketplace

- `GET /api/marketplace/featured` - Get featured NFTs
- `GET /api/marketplace/trending` - Get trending NFTs
- `GET /api/marketplace/search` - Search NFTs
- `GET /api/marketplace/stats` - Get marketplace statistics

### File Upload

- `POST /api/upload/audio` - Upload audio file to IPFS
- `POST /api/upload/cover` - Upload cover image to IPFS
- `POST /api/upload/metadata` - Upload metadata to IPFS

## 🎨 UI Components

The application features a modern, responsive design with:

- **Glass morphism effects** for a modern aesthetic
- **Gradient backgrounds** for visual appeal
- **Audio player integration** for previewing tracks
- **Drag & drop file uploads** for easy audio uploading
- **Responsive grid layouts** for NFT displays
- **Loading states and animations** for better UX

## 🔐 Smart Contract Features

### AudioNFT Contract

- ERC-721 compliant NFT contract
- IPFS metadata storage
- Creator royalty system
- Platform fee management
- Secure minting functionality

### AudioNFTMarketplace Contract

- Fixed price listings
- Offer/bid system
- Automatic royalty distribution
- Platform fee collection
- Secure fund handling

## 🌍 Blockchain Integration

The application supports:

- **Ethereum Mainnet** for production
- **Goerli Testnet** for testing
- **Local Hardhat Network** for development

### MetaMask Integration

- Wallet connection/disconnection
- Network switching
- Transaction signing
- Account management

## 📝 Environment Setup

### Required Services

1. **MongoDB**: Database for user profiles and NFT metadata
2. **IPFS (Infura)**: Decentralized storage for audio files
3. **Ethereum Node (Infura)**: Blockchain connectivity
4. **MetaMask**: Wallet for user interactions

### Configuration

Create the following environment files:

**server/.env**

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/audionft
CLIENT_URL=http://localhost:3000
JWT_SECRET=your_strong_jwt_secret
IPFS_PROJECT_ID=your_infura_ipfs_project_id
IPFS_PROJECT_SECRET=your_infura_ipfs_secret
```

**contracts/.env**

```env
PRIVATE_KEY=your_ethereum_private_key
GOERLI_RPC_URL=https://goerli.infura.io/v3/your_infura_key
MAINNET_RPC_URL=https://mainnet.infura.io/v3/your_infura_key
ETHERSCAN_API_KEY=your_etherscan_api_key
```

## 🚀 Deployment

### Frontend (Vercel/Netlify)

1. Build the React app: `cd client && npm run build`
2. Deploy the `build` folder to your hosting platform
3. Configure environment variables in your hosting dashboard

### Backend (Heroku/Railway)

1. Deploy the `server` directory
2. Configure environment variables
3. Ensure MongoDB connection is configured

### Smart Contracts

1. Deploy to your chosen network: `npm run deploy:testnet`
2. Update frontend with contract addresses
3. Verify contracts on Etherscan

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenZeppelin for secure smart contract libraries
- React team for the amazing frontend framework
- MetaMask for wallet integration
- IPFS for decentralized storage
- Tailwind CSS for beautiful styling

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-repo/issues) page
2. Create a new issue with detailed description
3. Join our community discussions

---

**Happy minting! 🎵✨**
