import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import Candidate from '../models/Candidate.js';
import JoiningRequest from '../models/JoiningRequest.js';
import Employee from '../models/Employee.js';

dotenv.config();

const cleanupData = async () => {
  try {
    await connectDB();

    console.log('Starting cleanup...');

    // Delete all employees
    const deletedEmployees = await Employee.deleteMany({});
    console.log(`Deleted ${deletedEmployees.deletedCount} employees`);

    // Delete all joining requests
    const deletedJoining = await JoiningRequest.deleteMany({});
    console.log(`Deleted ${deletedJoining.deletedCount} joining requests`);

    // Delete all candidates
    const deletedCandidates = await Candidate.deleteMany({});
    console.log(`Deleted ${deletedCandidates.deletedCount} candidates`);

    // Delete all users except admin
    const deletedUsers = await User.deleteMany({ 
      role: { $ne: 'admin' } 
    });
    console.log(`Deleted ${deletedUsers.deletedCount} employee users (kept admin)`);

    console.log('\n✅ Cleanup completed successfully!');
    console.log('Admin user preserved.');
    
    process.exit();
  } catch (error) {
    console.error('Error during cleanup:', error);
    process.exit(1);
  }
};

cleanupData();
