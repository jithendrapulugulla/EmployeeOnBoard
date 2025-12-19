import express from 'express';
import Candidate from '../models/Candidate.js';

const router = express.Router();

// @route   POST /api/public/accept-offer/:token
// @desc    Accept offer via token
// @access  Public
router.post('/accept-offer/:token', async (req, res) => {
  try {
    const { token } = req.params;

    // Find candidate with this token
    const candidate = await Candidate.findOne({
      offerToken: token,
      offerTokenExpiry: { $gt: Date.now() },
    });

    if (!candidate) {
      return res.status(400).json({ message: 'Invalid or expired offer link' });
    }

    if (candidate.offerAccepted) {
      return res.status(400).json({ message: 'Offer already accepted' });
    }

    // Mark offer as accepted
    candidate.offerAccepted = true;
    candidate.offerAcceptedDate = new Date();
    await candidate.save();

    res.json({ 
      message: 'Offer accepted successfully! You will receive joining details via email shortly.',
      candidate: {
        fullName: candidate.fullName,
        position: candidate.position,
        practice: candidate.practice,
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/public/verify-offer/:token
// @desc    Verify offer token
// @access  Public
router.get('/verify-offer/:token', async (req, res) => {
  try {
    const { token } = req.params;

    const candidate = await Candidate.findOne({
      offerToken: token,
      offerTokenExpiry: { $gt: Date.now() },
    });

    if (!candidate) {
      return res.status(400).json({ message: 'Invalid or expired offer link' });
    }

    res.json({
      valid: true,
      candidate: {
        fullName: candidate.fullName,
        position: candidate.position,
        practice: candidate.practice,
        offerAccepted: candidate.offerAccepted,
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
