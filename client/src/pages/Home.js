import React from 'react';
import { Link } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';

const Home = () => {
  const { isConnected } = useWeb3();

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-4xl mx-auto text-center">
        <div className="glass-effect rounded-2xl p-8 md:p-12">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Slang Starter
          </h1>
          <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
            Create, mint, and trade your sound in an NFT on the blockchain.
            Claim your slang.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/marketplace"
              className="bg-primary hover:bg-green-800 text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors w-full sm:w-auto"
            >
              Explore Marketplace
            </Link>

            {isConnected ? (
              <Link
                to="/mint"
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors w-full sm:w-auto"
              >
                Mint Audio NFT
              </Link>
            ) : (
              <Link
                to="/connect"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors w-full sm:w-auto"
              >
                Connect Wallet
              </Link>
            )}
          </div>
          <div className="text-gray-300 text-sm pt-4">
            Connect your wallet to mint NFTs
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-effect rounded-xl p-6">
              <div className="text-4xl mb-4">🎧</div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Upload Audio
              </h3>
              <p className="text-green-100 text-sm">
                Upload your unique audio files and transform them into NFTs
              </p>
            </div>

            <div className="glass-effect rounded-xl p-6">
              <div className="text-4xl mb-4">🔗</div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Mint on Blockchain
              </h3>
              <p className="text-green-100 text-sm">
                Secure your audio as an NFT with immutable blockchain technology
              </p>
            </div>

            <div className="glass-effect rounded-xl p-6">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Trade & Earn
              </h3>
              <p className="text-green-100 text-sm">
                List your audio NFTs on the marketplace and earn from sales
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
