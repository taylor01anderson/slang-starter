import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../context/Web3Context';

const Marketplace = () => {
  const { isConnected } = useWeb3();
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  // Mock NFT data
  const mockNFTs = [
    {
      id: 1,
      name: 'Synthwave Dreams',
      artist: 'CyberSounds',
      price: '0.5',
      image: '🎵',
      duration: '3:45',
      genre: 'Electronic',
      description: 'A nostalgic synthwave journey through neon-lit streets',
    },
    {
      id: 2,
      name: 'Jazz Midnight',
      artist: 'SmoothVibes',
      price: '0.8',
      image: '🎷',
      duration: '4:12',
      genre: 'Jazz',
      description: 'Smooth jazz for those late night moods',
    },
    {
      id: 3,
      name: 'Electronic Pulse',
      artist: 'BeatMaster',
      price: '0.3',
      image: '🎛️',
      duration: '2:58',
      genre: 'Electronic',
      description: 'High-energy electronic beats to get you moving',
    },
    {
      id: 4,
      name: 'Acoustic Serenity',
      artist: 'StringSoul',
      price: '0.6',
      image: '🎸',
      duration: '5:23',
      genre: 'Acoustic',
      description: 'Peaceful acoustic melodies for relaxation',
    },
    {
      id: 5,
      name: 'Hip Hop Flow',
      artist: 'RhymeTime',
      price: '0.4',
      image: '🎤',
      duration: '3:18',
      genre: 'Hip Hop',
      description: 'Fresh beats with smooth lyrical flow',
    },
    {
      id: 6,
      name: 'Ambient Space',
      artist: 'CosmicWaves',
      price: '0.7',
      image: '🌌',
      duration: '6:45',
      genre: 'Ambient',
      description: 'Ethereal sounds from another dimension',
    },
  ];

  useEffect(() => {
    // Simulate loading NFTs
    setTimeout(() => {
      setNfts(mockNFTs);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredNFTs =
    filter === 'all'
      ? nfts
      : nfts.filter((nft) => nft.genre.toLowerCase() === filter.toLowerCase());

  const handleBuy = (nft) => {
    if (!isConnected) {
      alert('Please connect your wallet to purchase NFTs');
      return;
    }

    // Here you would implement the actual purchase logic
    alert(`Purchasing ${nft.name} for ${nft.price} ETH`);
  };

  const genres = [
    'all',
    'electronic',
    'jazz',
    'acoustic',
    'hip hop',
    'ambient',
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-effect rounded-2xl p-8">
          <div className="text-white text-xl">Loading marketplace...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            🎵 Audio NFT Marketplace
          </h1>
          <p className="text-gray-300 text-lg">
            Discover and collect unique audio NFTs from talented artists
          </p>
        </div>

        {/* Filter */}
        <div className="glass-effect rounded-xl p-6 mb-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {genres.map((genre) => (
              <button
                key={genre}
                onClick={() => setFilter(genre)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === genre
                    ? 'bg-primary text-white'
                    : 'bg-white bg-opacity-20 text-gray-300 hover:bg-opacity-30'
                }`}
              >
                {genre.charAt(0).toUpperCase() + genre.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* NFT Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNFTs.map((nft) => (
            <div
              key={nft.id}
              className="glass-effect rounded-xl p-6 hover:shadow-xl transition-shadow"
            >
              <div className="text-center mb-4">
                <div className="text-6xl mb-2">{nft.image}</div>
                <h3 className="text-xl font-bold text-white">{nft.name}</h3>
                <p className="text-gray-300">by {nft.artist}</p>
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
                <div className="text-gray-300 text-xs">{nft.description}</div>
              </div>

              <div className="border-t border-gray-400 pt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-300">Price:</span>
                  <span className="text-xl font-bold text-white">
                    {nft.price} ETH
                  </span>
                </div>

                <button
                  onClick={() => handleBuy(nft)}
                  className="w-full bg-gradient-to-r from-primary to-secondary hover:from-green-800 hover:to-green-600 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  {isConnected ? 'Buy Now' : 'Connect Wallet'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredNFTs.length === 0 && (
          <div className="text-center py-12">
            <div className="glass-effect rounded-xl p-8">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-xl text-white mb-2">No NFTs Found</h3>
              <p className="text-gray-300">
                No audio NFTs match your current filter. Try selecting a
                different genre.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Marketplace;
