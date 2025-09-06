import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    walletAddress: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    username: {
      type: String,
      trim: true,
      maxlength: 50,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    bio: {
      type: String,
      maxlength: 500,
    },
    avatar: {
      type: String, // IPFS hash or URL
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    socialLinks: {
      twitter: String,
      instagram: String,
      website: String,
    },
    stats: {
      totalMinted: {
        type: Number,
        default: 0,
      },
      totalSold: {
        type: Number,
        default: 0,
      },
      totalEarned: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

userSchema.index({ walletAddress: 1 });
userSchema.index({ username: 1 });

export default mongoose.model('User', userSchema);
