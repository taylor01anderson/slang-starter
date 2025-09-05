import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useWeb3 } from '../context/Web3Context';
import toast from 'react-hot-toast';

const Mint = () => {
  const { isConnected, account } = useWeb3();
  const [audioFile, setAudioFile] = useState(null);
  const [metadata, setMetadata] = useState({
    name: '',
    description: '',
    artist: '',
    genre: '',
    duration: '',
  });
  const [isUploading, setIsUploading] = useState(false);
  const [isMinting, setIsMinting] = useState(false);

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file && file.type.startsWith('audio/')) {
      setAudioFile(file);

      // Get audio duration
      const audio = new Audio();
      audio.onloadedmetadata = () => {
        const duration = Math.floor(audio.duration);
        const minutes = Math.floor(duration / 60);
        const seconds = duration % 60;
        setMetadata((prev) => ({
          ...prev,
          duration: `${minutes}:${seconds.toString().padStart(2, '0')}`,
        }));
      };
      audio.src = URL.createObjectURL(file);

      toast.success('Audio file uploaded successfully!');
    } else {
      toast.error('Please upload a valid audio file');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'audio/*': ['.mp3', '.wav', '.ogg', '.m4a', '.flac'],
    },
    multiple: false,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setMetadata((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleMint = async () => {
    if (!audioFile) {
      toast.error('Please upload an audio file');
      return;
    }

    if (!metadata.name || !metadata.description || !metadata.artist) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsMinting(true);

      // Here you would integrate with IPFS and your smart contract
      // For now, we'll simulate the process
      toast.success('Minting process started...');

      // Simulate IPFS upload
      setTimeout(() => {
        toast.success('Audio uploaded to IPFS!');
      }, 2000);

      // Simulate minting
      setTimeout(() => {
        toast.success('NFT minted successfully!');
        setIsMinting(false);

        // Reset form
        setAudioFile(null);
        setMetadata({
          name: '',
          description: '',
          artist: '',
          genre: '',
          duration: '',
        });
      }, 5000);
    } catch (error) {
      console.error('Minting error:', error);
      toast.error('Failed to mint NFT');
      setIsMinting(false);
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
            Please connect your wallet to mint audio NFTs
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="glass-effect rounded-2xl p-8">
          <h1 className="text-3xl font-bold text-white mb-8 text-center">
            Mint Your Audio NFT
          </h1>

          {/* File Upload */}
          <div className="mb-8">
            <label className="block text-white text-sm font-medium mb-2">
              Upload Audio File *
            </label>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? 'border-secondary bg-green-100 bg-opacity-10'
                  : 'border-gray-400 hover:border-secondary'
              }`}
            >
              <input {...getInputProps()} />
              {audioFile ? (
                <div className="text-white">
                  <div className="text-4xl mb-2">🎵</div>
                  <p className="font-medium">{audioFile.name}</p>
                  <p className="text-sm text-gray-300">
                    {(audioFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              ) : (
                <div className="text-gray-300">
                  <div className="text-4xl mb-2">🎧</div>
                  <p>Drag & drop an audio file here, or click to select</p>
                  <p className="text-sm mt-2">
                    Supports MP3, WAV, OGG, M4A, FLAC
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Audio Preview */}
          {audioFile && (
            <div className="mb-8">
              <label className="block text-white text-sm font-medium mb-2">
                Preview
              </label>
              <audio
                controls
                className="w-full audio-player"
                src={URL.createObjectURL(audioFile)}
              />
            </div>
          )}

          {/* Metadata Form */}
          <div className="space-y-6">
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                NFT Name *
              </label>
              <input
                type="text"
                name="name"
                value={metadata.name}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-lg bg-white bg-opacity-20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-secondary"
                placeholder="My Awesome Track"
              />
            </div>

            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={metadata.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-2 rounded-lg bg-white bg-opacity-20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-secondary"
                placeholder="Describe your audio NFT..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Artist Name *
                </label>
                <input
                  type="text"
                  name="artist"
                  value={metadata.artist}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg bg-white bg-opacity-20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-secondary"
                  placeholder="Artist Name"
                />
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Genre
                </label>
                <input
                  type="text"
                  name="genre"
                  value={metadata.genre}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg bg-white bg-opacity-20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-secondary"
                  placeholder="Electronic, Jazz, Rock..."
                />
              </div>
            </div>

            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Duration
              </label>
              <input
                type="text"
                name="duration"
                value={metadata.duration}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-lg bg-white bg-opacity-20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-secondary"
                placeholder="3:45"
                readOnly
              />
            </div>
          </div>

          {/* Mint Button */}
          <div className="mt-8">
            <button
              onClick={handleMint}
              disabled={isMinting || !audioFile}
              className="w-full bg-gradient-to-r from-primary to-secondary hover:from-green-800 hover:to-green-600 disabled:from-gray-500 disabled:to-gray-600 text-white py-3 px-6 rounded-lg font-medium transition-colors"
            >
              {isMinting ? 'Minting...' : 'Mint Audio NFT'}
            </button>
          </div>

          <div className="mt-4 text-center text-sm text-gray-300">
            Connected as: {account}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Mint;
