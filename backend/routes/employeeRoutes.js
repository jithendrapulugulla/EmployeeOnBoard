import express from 'express';
import JoiningRequest from '../models/JoiningRequest.js';
import { protect, employee } from '../middleware/authMiddleware.js';
import { uploadJoiningDocuments } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// @route   GET /api/employee/joining-request
// @desc    Get employee's joining request
// @access  Private/Employee
router.get('/joining-request', protect, employee, async (req, res) => {
  try {
    const joiningRequest = await JoiningRequest.findOne({ email: req.user.email });

    if (!joiningRequest) {
      return res.status(404).json({ message: 'Joining request not found' });
    }

    res.json(joiningRequest);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/employee/submit-joining-form
// @desc    Submit joining form with documents
// @access  Private/Employee
router.post('/submit-joining-form', protect, employee, uploadJoiningDocuments, async (req, res) => {
  try {
    const {
      dateOfBirth,
      address,
      city,
      state,
      pincode,
      emergencyContactName,
      emergencyContactPhone,
      emergencyContactRelation,
      selfDescription,
      bankAccountNumber,
      bankName,
      bankIFSC,
    } = req.body;

    // Validate required fields
    if (!dateOfBirth || !address || !city || !state || !pincode || 
        !emergencyContactName || !emergencyContactPhone || !emergencyContactRelation ||
        !selfDescription || !bankAccountNumber || !bankName || !bankIFSC) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Validate uploaded files
    if (!req.files || !req.files.profilePhoto || !req.files.educationalCertificates || 
        !req.files.idProof || !req.files.addressProof) {
      return res.status(400).json({ message: 'Please upload all required documents' });
    }

    // Find joining request
    const joiningRequest = await JoiningRequest.findOne({ email: req.user.email });

    if (!joiningRequest) {
      return res.status(404).json({ message: 'Joining request not found' });
    }

    if (joiningRequest.status === 'submitted' || joiningRequest.status === 'approved') {
      return res.status(400).json({ message: 'Joining form already submitted' });
    }

    // Update joining request with form data and file paths
    joiningRequest.dateOfBirth = dateOfBirth;
    joiningRequest.address = address;
    joiningRequest.city = city;
    joiningRequest.state = state;
    joiningRequest.pincode = pincode;
    joiningRequest.emergencyContactName = emergencyContactName;
    joiningRequest.emergencyContactPhone = emergencyContactPhone;
    joiningRequest.emergencyContactRelation = emergencyContactRelation;
    joiningRequest.selfDescription = selfDescription;
    joiningRequest.bankAccountNumber = bankAccountNumber;
    joiningRequest.bankName = bankName;
    joiningRequest.bankIFSC = bankIFSC;

    // Store file paths
    joiningRequest.profilePhoto = req.files.profilePhoto[0].filename;
    joiningRequest.educationalCertificates = req.files.educationalCertificates.map(file => file.filename);
    joiningRequest.idProof = req.files.idProof[0].filename;
    joiningRequest.addressProof = req.files.addressProof[0].filename;

    joiningRequest.status = 'submitted';
    joiningRequest.submittedAt = new Date();

    await joiningRequest.save();

    res.json({ message: 'Joining form submitted successfully', joiningRequest });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
