import express from 'express';
import crypto from 'crypto';
import Candidate from '../models/Candidate.js';
import User from '../models/User.js';
import JoiningRequest from '../models/JoiningRequest.js';
import Employee from '../models/Employee.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { sendOfferEmail, sendJoiningDetailsEmail, sendReviewEmail, sendWelcomeEmailToAll } from '../services/emailService.js';

const router = express.Router();

// @route   POST /api/admin/candidates
// @desc    Create a new candidate
// @access  Private/Admin
router.post('/candidates', protect, admin, async (req, res) => {
  try {
    const { fullName, email, phone, practice, position } = req.body;

    // Validate input
    if (!fullName || !email || !phone || !practice || !position) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Check if candidate already exists
    const candidateExists = await Candidate.findOne({ email });
    if (candidateExists) {
      return res.status(400).json({ message: 'Candidate already exists' });
    }

    // Create candidate
    const candidate = await Candidate.create({
      fullName,
      email,
      phone,
      practice,
      position,
      createdBy: req.user._id,
    });

    res.status(201).json(candidate);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/candidates
// @desc    Get all candidates
// @access  Private/Admin
router.get('/candidates', protect, admin, async (req, res) => {
  try {
    const candidates = await Candidate.find().sort({ createdAt: -1 });
    res.json(candidates);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/admin/candidates/:id/send-offer
// @desc    Send offer letter to candidate
// @access  Private/Admin
router.post('/candidates/:id/send-offer', protect, admin, async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);

    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    if (candidate.offerSent) {
      return res.status(400).json({ message: 'Offer already sent to this candidate' });
    }

    // Generate secure token
    const offerToken = crypto.randomBytes(32).toString('hex');
    const offerTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Update candidate
    candidate.offerSent = true;
    candidate.offerToken = offerToken;
    candidate.offerTokenExpiry = offerTokenExpiry;
    candidate.offerSentDate = new Date();
    await candidate.save();

    // Send email asynchronously
    setImmediate(async () => {
      try {
        await sendOfferEmail(candidate, offerToken);
      } catch (emailError) {
        console.error('Error sending offer email:', emailError);
      }
    });

    res.json({ message: 'Offer letter sent successfully', candidate });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/admin/candidates/:id/send-joining-details
// @desc    Send joining details and credentials to candidate
// @access  Private/Admin
router.post('/candidates/:id/send-joining-details', protect, admin, async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);

    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    if (!candidate.offerAccepted) {
      return res.status(400).json({ message: 'Candidate has not accepted the offer yet' });
    }

    if (candidate.joiningDetailsSent) {
      return res.status(400).json({ message: 'Joining details already sent' });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email: candidate.email });
    if (userExists) {
      return res.status(400).json({ message: 'User account already exists for this candidate' });
    }

    // Generate temporary password: first 3 letters + @WW2025
    const tempPassword = candidate.fullName.substring(0, 3) + '@WW2025';

    // Create user account for employee
    const user = await User.create({
      email: candidate.email,
      password: tempPassword,
      role: 'employee',
      fullName: candidate.fullName,
      practice: candidate.practice,
      isActive: false, // Will be activated after joining form submission
    });

    // Create joining request
    await JoiningRequest.create({
      candidateId: candidate._id,
      fullName: candidate.fullName,
      email: candidate.email,
      phone: candidate.phone,
      practice: candidate.practice,
      position: candidate.position,
      status: 'pending',
    });

    // Update candidate
    candidate.joiningDetailsSent = true;
    candidate.joiningDetailsSentDate = new Date();
    await candidate.save();

    // Send email asynchronously
    setImmediate(async () => {
      try {
        await sendJoiningDetailsEmail(candidate, tempPassword);
      } catch (emailError) {
        console.error('Error sending joining details email:', emailError);
      }
    });

    res.json({ message: 'Joining details sent successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/joining-requests
// @desc    Get all joining requests
// @access  Private/Admin
router.get('/joining-requests', protect, admin, async (req, res) => {
  try {
    const joiningRequests = await JoiningRequest.find()
      .populate('candidateId')
      .sort({ createdAt: -1 });
    res.json(joiningRequests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/joining-requests/:id
// @desc    Get joining request details
// @access  Private/Admin
router.get('/joining-requests/:id', protect, admin, async (req, res) => {
  try {
    const joiningRequest = await JoiningRequest.findById(req.params.id).populate('candidateId');
    
    if (!joiningRequest) {
      return res.status(404).json({ message: 'Joining request not found' });
    }

    res.json(joiningRequest);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/admin/joining-requests/:id/review
// @desc    Approve or reject joining request
// @access  Private/Admin
router.post('/joining-requests/:id/review', protect, admin, async (req, res) => {
  try {
    const { status, remarks } = req.body;

    if (!status || !['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const joiningRequest = await JoiningRequest.findById(req.params.id);

    if (!joiningRequest) {
      return res.status(404).json({ message: 'Joining request not found' });
    }

    if (joiningRequest.status !== 'submitted') {
      return res.status(400).json({ message: 'Can only review submitted requests' });
    }

    // Update joining request
    joiningRequest.status = status;
    joiningRequest.reviewRemarks = remarks;
    joiningRequest.reviewedBy = req.user._id;
    joiningRequest.reviewedAt = new Date();
    await joiningRequest.save();

    // If approved, create employee record
    if (status === 'approved') {
      // Generate employee ID
      const employeeCount = await Employee.countDocuments();
      const employeeId = `EMP${String(employeeCount + 1).padStart(5, '0')}`;

      // Get user account
      const user = await User.findOne({ email: joiningRequest.email });
      
      if (!user) {
        return res.status(404).json({ message: 'User account not found' });
      }

      // Auto-generate password: first 3 letters + @WW2025
      const autoPassword = joiningRequest.fullName.substring(0, 3) + '@WW2025';
      user.password = autoPassword;
      user.isActive = true;
      user.employeeId = employeeId;
      await user.save();

      // Create employee record
      const employee = await Employee.create({
        employeeId,
        userId: user._id,
        candidateId: joiningRequest.candidateId,
        joiningRequestId: joiningRequest._id,
        fullName: joiningRequest.fullName,
        email: joiningRequest.email,
        phone: joiningRequest.phone,
        practice: joiningRequest.practice,
        position: joiningRequest.position,
        dateOfBirth: joiningRequest.dateOfBirth,
        address: joiningRequest.address,
        city: joiningRequest.city,
        state: joiningRequest.state,
        pincode: joiningRequest.pincode,
        profilePhoto: joiningRequest.profilePhoto,
        selfDescription: joiningRequest.selfDescription,
      });

      // Send welcome email to all active employees (except new joiner)
      setImmediate(async () => {
        try {
          const allActiveEmployees = await Employee.find({ isActive: true }).select('email');
          await sendWelcomeEmailToAll(employee, allActiveEmployees);
        } catch (emailError) {
          console.error('Error sending welcome email:', emailError);
        }
      });
    }

    // Send review email to candidate
    setImmediate(async () => {
      try {
        await sendReviewEmail(joiningRequest.email, joiningRequest.fullName, status, remarks);
      } catch (emailError) {
        console.error('Error sending review email:', emailError);
      }
    });

    res.json({ message: `Joining request ${status} successfully`, joiningRequest });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/employees
// @desc    Get all employees
// @access  Private/Admin
router.get('/employees', protect, admin, async (req, res) => {
  try {
    const employees = await Employee.find().sort({ createdAt: -1 });
    res.json(employees);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/dashboard-stats
// @desc    Get dashboard statistics
// @access  Private/Admin
router.get('/dashboard-stats', protect, admin, async (req, res) => {
  try {
    const totalCandidates = await Candidate.countDocuments();
    const offersAccepted = await Candidate.countDocuments({ offerAccepted: true });
    const pendingJoining = await JoiningRequest.countDocuments({ status: 'submitted' });
    const totalEmployees = await Employee.countDocuments();

    res.json({
      totalCandidates,
      offersAccepted,
      pendingJoining,
      totalEmployees,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
