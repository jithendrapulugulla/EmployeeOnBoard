import mongoose from 'mongoose';

const candidateSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  phone: {
    type: String,
    required: true,
  },
  practice: {
    type: String,
    required: true,
  },
  position: {
    type: String,
    required: true,
  },
  offerSent: {
    type: Boolean,
    default: false,
  },
  offerAccepted: {
    type: Boolean,
    default: false,
  },
  offerToken: {
    type: String,
  },
  offerTokenExpiry: {
    type: Date,
  },
  offerSentDate: {
    type: Date,
  },
  offerAcceptedDate: {
    type: Date,
  },
  joiningDetailsSent: {
    type: Boolean,
    default: false,
  },
  joiningDetailsSentDate: {
    type: Date,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Candidate = mongoose.model('Candidate', candidateSchema);

export default Candidate;
