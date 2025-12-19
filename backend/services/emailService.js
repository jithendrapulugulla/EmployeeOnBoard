import nodemailer from 'nodemailer';

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

// Send offer letter email
export const sendOfferEmail = async (candidate, offerToken) => {
  try {
    const transporter = createTransporter();
    
    const acceptLink = `${process.env.CLIENT_URL}/accept-offer/${offerToken}`;
    
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: candidate.email,
      subject: 'Job Offer - Welcome to Our Team!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Congratulations ${candidate.fullName}!</h2>
          <p>We are pleased to offer you the position of <strong>${candidate.position}</strong> in the <strong>${candidate.practice}</strong> department.</p>
          
          <p>Please click the button below to accept this offer:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${acceptLink}" 
               style="background-color: #4CAF50; color: white; padding: 14px 28px; 
                      text-decoration: none; border-radius: 4px; display: inline-block;">
              Accept Offer
            </a>
          </div>
          
          <p><strong>Note:</strong> This link will expire in 7 days.</p>
          
          <p>If you have any questions, please don't hesitate to contact us.</p>
          
          <p>Best regards,<br/>HR Team</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Offer email sent to ${candidate.email}`);
  } catch (error) {
    console.error('Error sending offer email:', error);
    throw new Error('Failed to send offer email');
  }
};

// Send joining details and credentials
export const sendJoiningDetailsEmail = async (candidate, temporaryPassword) => {
  try {
    const transporter = createTransporter();
    
    const loginLink = `${process.env.CLIENT_URL}/login`;
    
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: candidate.email,
      subject: 'Joining Details & Login Credentials',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome ${candidate.fullName}!</h2>
          <p>Thank you for accepting our offer. Here are your login credentials to complete the joining process:</p>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 4px; margin: 20px 0;">
            <p><strong>Email:</strong> ${candidate.email}</p>
            <p><strong>Temporary Password:</strong> ${temporaryPassword}</p>
          </div>
          
          <p>Please login using the credentials above and complete your joining form by uploading the required documents:</p>
          <ul>
            <li>Educational Certificates</li>
            <li>ID Proof (Aadhar/PAN/Passport)</li>
            <li>Address Proof</li>
            <li>Profile Photo</li>
          </ul>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${loginLink}" 
               style="background-color: #2196F3; color: white; padding: 14px 28px; 
                      text-decoration: none; border-radius: 4px; display: inline-block;">
              Login Now
            </a>
          </div>
          
          <p><strong>Important:</strong> Please change your password after your first login.</p>
          
          <p>Best regards,<br/>HR Team</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Joining details email sent to ${candidate.email}`);
  } catch (error) {
    console.error('Error sending joining details email:', error);
    throw new Error('Failed to send joining details email');
  }
};

// Send welcome email to all employees
export const sendWelcomeEmailToAll = async (newEmployee, allActiveEmployees) => {
  try {
    const transporter = createTransporter();
    
    const photoUrl = `${process.env.SERVER_URL}/uploads/${newEmployee.profilePhoto}`;
    
    // Filter out the new employee from the recipient list
    const recipients = allActiveEmployees
      .filter(emp => emp.email !== newEmployee.email)
      .map(emp => emp.email);

    if (recipients.length === 0) {
      console.log('No active employees to send welcome email to');
      return;
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      bcc: recipients, // Using BCC to protect privacy
      subject: `Welcome Our New Team Member - ${newEmployee.fullName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome Our New Team Member!</h2>
          
          <div style="text-align: center; margin: 20px 0;">
            <img src="${photoUrl}" alt="${newEmployee.fullName}" 
                 style="width: 150px; height: 150px; border-radius: 50%; object-fit: cover; border: 3px solid #4CAF50;" />
          </div>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 4px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #333;">${newEmployee.fullName}</h3>
            <p><strong>Position:</strong> ${newEmployee.position}</p>
            <p><strong>Practice/Department:</strong> ${newEmployee.practice}</p>
            <p><strong>Employee ID:</strong> ${newEmployee.employeeId}</p>
          </div>
          
          <div style="background-color: #e3f2fd; padding: 15px; border-left: 4px solid #2196F3; margin: 20px 0;">
            <h4 style="margin-top: 0;">About ${newEmployee.fullName.split(' ')[0]}</h4>
            <p style="margin-bottom: 0;">${newEmployee.selfDescription}</p>
          </div>
          
          <p>Please join us in welcoming ${newEmployee.fullName.split(' ')[0]} to our team!</p>
          
          <p>Best regards,<br/>HR Team</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Welcome email sent to ${recipients.length} employees`);
  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw new Error('Failed to send welcome email');
  }
};

// Send approval/rejection email to candidate
export const sendReviewEmail = async (candidateEmail, candidateName, status, remarks) => {
  try {
    const transporter = createTransporter();
    
    const isApproved = status === 'approved';
    const subject = isApproved ? 'Congratulations! Your Joining Request is Approved' : 'Update on Your Joining Request';
    
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: candidateEmail,
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Hello ${candidateName},</h2>
          
          ${isApproved ? `
            <p>Great news! Your joining request has been <strong style="color: #4CAF50;">APPROVED</strong>.</p>
            <p>Your employee account has been created and you can now access the employee portal with your existing credentials.</p>
          ` : `
            <p>We have reviewed your joining request and it requires some updates.</p>
            <p><strong>Status:</strong> <span style="color: #f44336;">Requires Revision</span></p>
          `}
          
          ${remarks ? `
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 4px; margin: 20px 0;">
              <h4 style="margin-top: 0;">HR Comments:</h4>
              <p style="margin-bottom: 0;">${remarks}</p>
            </div>
          ` : ''}
          
          <p>If you have any questions, please contact HR.</p>
          
          <p>Best regards,<br/>HR Team</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Review email sent to ${candidateEmail}`);
  } catch (error) {
    console.error('Error sending review email:', error);
    throw new Error('Failed to send review email');
  }
};
