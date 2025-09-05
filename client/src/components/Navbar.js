import React from 'react';
import { Link } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';

const Navbar = () => {
  const { account, isConnected, connectWallet, disconnectWallet, loading } =
    useWeb3();

  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-effect">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="text-white text-xl font-bold">
              🎵 AudioNFT
            </Link>
          </div>

          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link
                to="/"
                className="text-white hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Home
              </Link>
              <Link
                to="/marketplace"
                className="text-white hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Marketplace
              </Link>
              <Link
                to="/mint"
                className="text-white hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Mint
              </Link>
              {isConnected && (
                <Link
                  to="/profile"
                  className="text-white hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Profile
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center">
            {isConnected ? (
              <div className="flex items-center space-x-2">
                <span className="text-white text-sm">
                  {formatAddress(account)}
                </span>
                <button
                  onClick={disconnectWallet}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                disabled={loading}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                {loading ? 'Connecting...' : 'Connect Wallet'}
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
