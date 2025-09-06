import mongoose from 'mongoose';

const nftSchema = new mongoose.Schema(
  {
    tokenId: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    artist: {
      type: String,
      required: true,
      trim: true,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    metadata: {
      genre: String,
      duration: String, // in format "mm:ss"
      bpm: Number,
      key: String,
      tags: [String],
    },
    files: {
      audio: {
        ipfsHash: {
          type: String,
          required: true,
        },
        originalName: String,
        size: Number,
        mimeType: String,
      },
      cover: {
        ipfsHash: String,
        originalName: String,
        size: Number,
        mimeType: String,
      },
    },
    blockchain: {
      contractAddress: {
        type: String,
        required: true,
      },
      tokenId: {
        type: String,
        required: true,
      },
      network: {
        type: String,
        default: 'ethereum',
      },
      transactionHash: String,
    },
    pricing: {
      currentPrice: {
        type: Number,
        default: 0,
      },
      currency: {
        type: String,
        default: 'ETH',
      },
      isForSale: {
        type: Boolean,
        default: false,
      },
      saleType: {
        type: String,
        enum: ['fixed', 'auction'],
        default: 'fixed',
      },
    },
    sales: [
      {
        from: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        to: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        price: Number,
        currency: String,
        transactionHash: String,
        soldAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    stats: {
      views: {
        type: Number,
        default: 0,
      },
      likes: {
        type: Number,
        default: 0,
      },
      plays: {
        type: Number,
        default: 0,
      },
    },
    status: {
      type: String,
      enum: ['draft', 'minting', 'minted', 'listed', 'sold'],
      default: 'draft',
    },
  },
  {
    timestamps: true,
  }
);

nftSchema.index({ tokenId: 1 });
nftSchema.index({ creator: 1 });
nftSchema.index({ owner: 1 });
nftSchema.index({ 'pricing.isForSale': 1 });
nftSchema.index({ status: 1 });
nftSchema.index({ 'metadata.genre': 1 });

export default mongoose.model('NFT', nftSchema);
