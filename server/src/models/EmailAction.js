import mongoose from 'mongoose';

const emailActionSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    gmailThreadId: {
      type: String,
      required: true,
      index: true
    },
    actionType: {
      type: String,
      enum: ['summarize', 'generate_reply', 'send', 'classify', 'extract_actions', 'daily_digest'],
      required: true
    },
    aiProvider: {
      type: String,
      enum: ['gemini', 'fallback'],
      required: true,
      default: 'fallback'
    },
    status: {
      type: String,
      enum: ['PENDING', 'COMPLETED', 'FAILED', 'RETRIED'],
      default: 'PENDING'
    },
    inputLength: {
      type: Number,
      default: 0
    },
    output: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    error: {
      type: String,
      default: null
    },
    durationMs: {
      type: Number,
      default: 0
    },
    retryCount: {
      type: Number,
      default: 0
    },
    meta: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

export const EmailActionModel = mongoose.models.EmailAction || mongoose.model('EmailAction', emailActionSchema);
