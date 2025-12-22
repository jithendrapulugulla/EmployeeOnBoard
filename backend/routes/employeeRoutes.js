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
    console.log('=== Joining Form Submission ===');
    console.log('Body keys:', Object.keys(req.body));
    console.log('Files keys:', req.files ? Object.keys(req.files) : 'No files');
    
    const {
      dateOfBirth,
      presentAddress,
      presentCity,
      presentState,
      presentPincode,
      permanentAddress,
      permanentCity,
      permanentState,
      permanentPincode,
      emergencyContactName,
      emergencyContactPhone,
      emergencyContactRelation,
      selfDescription,
      bankAccountNumber,
      bankName,
      bankIFSC,
      uan,
      tenthGrade,
      interGrade,
      btechGrade,
      experience: experienceJson,
    } = req.body;

    // Validate required fields
    if (!dateOfBirth || !presentAddress || !presentCity || !presentState || !presentPincode ||
        !permanentAddress || !permanentCity || !permanentState || !permanentPincode ||
        !emergencyContactName || !emergencyContactPhone || !emergencyContactRelation ||
        !selfDescription || !bankAccountNumber || !bankName || !bankIFSC ||
        !tenthGrade || !interGrade || !btechGrade) {
      const missing = [];
      if (!dateOfBirth) missing.push('dateOfBirth');
      if (!presentAddress) missing.push('presentAddress');
      if (!presentCity) missing.push('presentCity');
      if (!presentState) missing.push('presentState');
      if (!presentPincode) missing.push('presentPincode');
      if (!permanentAddress) missing.push('permanentAddress');
      if (!permanentCity) missing.push('permanentCity');
      if (!permanentState) missing.push('permanentState');
      if (!permanentPincode) missing.push('permanentPincode');
      if (!emergencyContactName) missing.push('emergencyContactName');
      if (!emergencyContactPhone) missing.push('emergencyContactPhone');
      if (!emergencyContactRelation) missing.push('emergencyContactRelation');
      if (!selfDescription) missing.push('selfDescription');
      if (!bankAccountNumber) missing.push('bankAccountNumber');
      if (!bankName) missing.push('bankName');
      if (!bankIFSC) missing.push('bankIFSC');
      if (!tenthGrade) missing.push('tenthGrade');
      if (!interGrade) missing.push('interGrade');
      if (!btechGrade) missing.push('btechGrade');
      console.log('Missing required fields:', missing);
      return res.status(400).json({ message: 'Please provide all required fields. Missing: ' + missing.join(', ') });
    }

    // Validate uploaded files
    if (!req.files || !req.files.profilePhoto || 
        !req.files.idProof || !req.files.addressProof || !req.files.tenthDocument ||
        !req.files.interDocument || !req.files.btechDocument) {
      const missingFiles = [];
      if (!req.files || !req.files.profilePhoto) missingFiles.push('profilePhoto');
      if (!req.files || !req.files.idProof) missingFiles.push('idProof');
      if (!req.files || !req.files.addressProof) missingFiles.push('addressProof');
      if (!req.files || !req.files.tenthDocument) missingFiles.push('tenthDocument');
      if (!req.files || !req.files.interDocument) missingFiles.push('interDocument');
      if (!req.files || !req.files.btechDocument) missingFiles.push('btechDocument');
      console.log('Missing files:', missingFiles);
      return res.status(400).json({ message: 'Please upload all required documents. Missing: ' + missingFiles.join(', ') });
    }

    // Parse experience array
    let experienceArr = [];
    try {
      if (experienceJson) {
        experienceArr = JSON.parse(experienceJson);
        // Ensure it's an array
        if (!Array.isArray(experienceArr)) {
          experienceArr = [];
        }
      }
    } catch (e) {
      console.error('Experience parse error:', e, 'Experience data:', experienceJson);
      return res.status(400).json({ message: 'Invalid experience data format' });
    }

    // Validate experience entries
    if (experienceArr && experienceArr.length > 0) {
      for (let i = 0; i < experienceArr.length; i++) {
        const exp = experienceArr[i];
        if (!exp.companyName || exp.companyName.trim() === '') {
          return res.status(400).json({ message: `Company name is required for company ${i + 1}` });
        }
        if (!exp.years || exp.years === '') {
          return res.status(400).json({ message: `Years are required for company ${i + 1}` });
        }
        // Check file for each experience
        if (!req.files || !req.files[`experienceCertificate_${i}`]) {
          return res.status(400).json({ message: `Please upload certificate for company ${i + 1}` });
        }
      }
      // If there is experience, UAN is required
      if (!uan || uan.trim() === '') {
        return res.status(400).json({ message: 'UAN (EPFO) number is required when you have work experience' });
      }
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
    joiningRequest.presentAddress = presentAddress;
    joiningRequest.presentCity = presentCity;
    joiningRequest.presentState = presentState;
    joiningRequest.presentPincode = presentPincode;
    joiningRequest.permanentAddress = permanentAddress;
    joiningRequest.permanentCity = permanentCity;
    joiningRequest.permanentState = permanentState;
    joiningRequest.permanentPincode = permanentPincode;
    joiningRequest.emergencyContactName = emergencyContactName;
    joiningRequest.emergencyContactPhone = emergencyContactPhone;
    joiningRequest.emergencyContactRelation = emergencyContactRelation;
    joiningRequest.selfDescription = selfDescription;
    
    // Ensure UAN is a string, not an array
    let uanValue = uan || '';
    console.log('UAN received:', uan, 'Type:', typeof uan, 'isArray:', Array.isArray(uan));
    if (Array.isArray(uanValue)) {
      uanValue = uanValue[0] || '';
      console.log('Extracted from array:', uanValue);
    }
    
    joiningRequest.bankDetails = {
      accountNumber: bankAccountNumber,
      bankName: bankName,
      ifsc: bankIFSC,
      uan: String(uanValue).trim(),
    };
    // Store education grades and documents
    joiningRequest.tenthGrade = tenthGrade;
    joiningRequest.tenthDocument = req.files.tenthDocument[0].filename;
    joiningRequest.interGrade = interGrade;
    joiningRequest.interDocument = req.files.interDocument[0].filename;
    joiningRequest.btechGrade = btechGrade;
    joiningRequest.btechDocument = req.files.btechDocument[0].filename;

    // Store experience array
    joiningRequest.experience = experienceArr.map((exp, i) => ({
      companyName: exp.companyName,
      years: exp.years,
      certificate: req.files[`experienceCertificate_${i}`][0].filename,
    }));

    // Store file paths
    joiningRequest.profilePhoto = req.files.profilePhoto[0].filename;
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
