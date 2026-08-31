import mongoose from 'mongoose';

const integrationSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },
    provider: {
      type: String,
      default: 'gmail'
    },
    isConnected: {
      type: Boolean,
      default: false
    },
    email: {
      type: String,
      default: ''
    },
    displayName: {
      type: String,
      default: ''
    },
    scopes: {
      type: [String],
      default: []
    },
    encryptedAccessToken: {
      type: String,
      default: null
    },
    encryptedRefreshToken: {
      type: String,
      default: null
    },
    tokenType: {
      type: String,
      default: 'Bearer'
    },
    expiresAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

export const IntegrationModel = mongoose.models.Integration || mongoose.model('Integration', integrationSchema);
