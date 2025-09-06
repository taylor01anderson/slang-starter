import mongoose from 'mongoose';

const nftSchema = new mongoose.Schema({
  tokenId: {
    type: Number,
    unique: true,
    sparse: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    maxlength: 1000
  },
  audioUrl: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String
  },
  metadataUrl: {
    type: String
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'ETH'
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  contractAddress: {
    type: String
  },
  isListed: {
    type: Boolean,
    default: true
  },
  category: {
    type: String,
    enum: ['music', 'podcast', 'soundeffect', 'other'],
    default: 'music'
  },
  duration: {
    type: Number // in seconds
  },
  fileSize: {
    type: Number // in bytes
  },
  mimeType: {
    type: String
  },
  royalty: {
    type: Number,
    min: 0,
    max: 10,
    default: 2.5
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

nftSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('NFT', nftSchema);
