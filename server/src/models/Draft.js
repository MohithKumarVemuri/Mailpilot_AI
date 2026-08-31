import mongoose from 'mongoose';

const draftSchema = new mongoose.Schema(
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
    subject: {
      type: String,
      default: ''
    },
    recipient: {
      type: String,
      default: ''
    },
    tone: {
      type: String,
      enum: ['Professional', 'Friendly', 'Formal', 'Concise'],
      default: 'Professional'
    },
    instruction: {
      type: String,
      default: ''
    },
    generatedText: {
      type: String,
      default: ''
    },
    editedText: {
      type: String,
      default: ''
    },
    wasSent: {
      type: Boolean,
      default: false
    },
    sentAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

export const DraftModel = mongoose.models.Draft || mongoose.model('Draft', draftSchema);
