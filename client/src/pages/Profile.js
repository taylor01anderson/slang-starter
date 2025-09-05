import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../context/Web3Context';

const Profile = () => {
  const { account, isConnected } = useWeb3();
  const [userNFTs, setUserNFTs] = useState([]);
  const [stats, setStats] = useState({
    totalNFTs: 0,
    totalValue: 0,
    totalSales: 0,
  });
  const [loading, setLoading] = useState(true);

  // Mock user NFTs
  const mockUserNFTs = [
    {
      id: 1,
      name: 'My First Beat',
      artist: 'You',
      price: '0.2',
      image: '🎵',
      duration: '2:34',
      genre: 'Hip Hop',
      status: 'listed',
      description: 'My very first audio NFT creation',
    },
    {
      id: 2,
      name: 'Chill Vibes',
      artist: 'You',
      price: '0.4',
      image: '🎧',
      duration: '4:15',
      genre: 'Lofi',
      status: 'sold',
      description: 'Relaxing lofi beats for studying',
    },
    {
      id: 3,
      name: 'Energy Boost',
      artist: 'You',
      price: '0.3',
      image: '⚡',
      duration: '3:22',
      genre: 'Electronic',
      status: 'draft',
      description: 'High energy electronic music',
    },
  ];

  useEffect(() => {
    if (isConnected) {
      // Simulate loading user data
      setTimeout(() => {
        setUserNFTs(mockUserNFTs);
        setStats({
          totalNFTs: mockUserNFTs.length,
          totalValue: mockUserNFTs.reduce(
            (sum, nft) => sum + parseFloat(nft.price),
            0
          ),
          totalSales: mockUserNFTs.filter((nft) => nft.status === 'sold')
            .length,
        });
        setLoading(false);
      }, 1000);
    }
  }, [isConnected]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'listed':
        return 'bg-green-500';
      case 'sold':
        return 'bg-blue-500';
      case 'draft':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'listed':
        return 'Listed';
      case 'sold':
        return 'Sold';
      case 'draft':
        return 'Draft';
      default:
        return 'Unknown';
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="glass-effect rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Connect Your Wallet
          </h2>
          <p className="text-gray-300">
            Please connect your wallet to view your profile
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-effect rounded-2xl p-8">
          <div className="text-white text-xl">Loading profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Profile Header */}
        <div className="glass-effect rounded-2xl p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="w-24 h-24 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center text-4xl">
              👤
            </div>

            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-white mb-2">
                Your Profile
              </h1>
              <p className="text-gray-300 text-sm mb-4">
                {account.slice(0, 6)}...{account.slice(-4)}
              </p>

              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">
                    {stats.totalNFTs}
                  </div>
                  <div className="text-sm text-gray-300">Total NFTs</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">
                    {stats.totalValue.toFixed(1)} ETH
                  </div>
                  <div className="text-sm text-gray-300">Total Value</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">
                    {stats.totalSales}
                  </div>
                  <div className="text-sm text-gray-300">Sales</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* User NFTs */}
        <div className="glass-effect rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6">
            Your Audio NFTs
          </h2>

          {userNFTs.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🎵</div>
              <h3 className="text-xl text-white mb-2">No NFTs Yet</h3>
              <p className="text-gray-300 mb-4">
                You haven't minted any audio NFTs yet. Start creating!
              </p>
              <a
                href="/mint"
                className="bg-primary hover:bg-green-800 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Mint Your First NFT
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userNFTs.map((nft) => (
                <div
                  key={nft.id}
                  className="bg-white bg-opacity-10 rounded-xl p-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="text-center">
                      <div className="text-4xl mb-2">{nft.image}</div>
                      <h3 className="text-lg font-bold text-white">
                        {nft.name}
                      </h3>
                      <p className="text-gray-300 text-sm">by {nft.artist}</p>
                    </div>

                    <span
                      className={`px-2 py-1 rounded-full text-xs text-white ${getStatusColor(
                        nft.status
                      )}`}
                    >
                      {getStatusText(nft.status)}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4 text-sm">
                    <div className="flex justify-between text-gray-300">
                      <span>Duration:</span>
                      <span>{nft.duration}</span>
                    </div>
                    <div className="flex justify-between text-gray-300">
                      <span>Genre:</span>
                      <span>{nft.genre}</span>
                    </div>
                    <div className="flex justify-between text-gray-300">
                      <span>Price:</span>
                      <span>{nft.price} ETH</span>
                    </div>
                  </div>

                  <div className="text-gray-300 text-xs mb-4">
                    {nft.description}
                  </div>

                  <div className="flex gap-2">
                    {nft.status === 'draft' && (
                      <button className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors">
                        List for Sale
                      </button>
                    )}

                    {nft.status === 'listed' && (
                      <button className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors">
                        Remove Listing
                      </button>
                    )}

                    <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors">
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
