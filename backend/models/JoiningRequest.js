import mongoose from 'mongoose';

const joiningRequestSchema = new mongoose.Schema({
  candidateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Candidate',
    required: true,
  },
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
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
  // Personal Information
  dateOfBirth: {
    type: Date,
  },
  address: {
    type: String,
  },
  city: {
    type: String,
  },
  state: {
    type: String,
  },
  pincode: {
    type: String,
  },
  emergencyContactName: {
    type: String,
  },
  emergencyContactPhone: {
    type: String,
  },
  emergencyContactRelation: {
    type: String,
  },
  // Profile
  profilePhoto: {
    type: String,
  },
  selfDescription: {
    type: String,
  },
  // Documents
  educationalCertificates: [{
    type: String,
  }],
  idProof: {
    type: String,
  },
  addressProof: {
    type: String,
  },
  // Bank Details
  bankAccountNumber: {
    type: String,
  },
  bankName: {
    type: String,
  },
  bankIFSC: {
    type: String,
  },
  // Status
  status: {
    type: String,
    enum: ['pending', 'submitted', 'approved', 'rejected'],
    default: 'pending',
  },
  submittedAt: {
    type: Date,
  },
  reviewedAt: {
    type: Date,
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  reviewRemarks: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const JoiningRequest = mongoose.model('JoiningRequest', joiningRequestSchema);

export default JoiningRequest;
