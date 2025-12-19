# Employee Onboarding Application

A full-stack Employee Onboarding Application built with React.js, Node.js, Express.js, and MongoDB. The system supports two roles: **Admin (HR)** and **Employee**, with features for candidate management, offer letters, document uploads, and automated employee creation.

## 🚀 Features

### Admin Features
- ✅ Admin login with secure authentication
- ✅ Create candidates and define their practice/department
- ✅ Send offer letters via email with secure token links
- ✅ Send joining details and credentials to candidates
- ✅ Review joining submissions with document verification
- ✅ Approve/reject submissions with remarks
- ✅ Auto-generate Employee ID and credentials
- ✅ Send company-wide welcome emails with new employee details
- ✅ Dashboard with statistics and insights

### Employee Features
- ✅ Login with credentials sent by HR
- ✅ Complete joining form in a single submission
- ✅ Upload educational certificates, ID proof, address proof
- ✅ Upload profile photo and self-description
- ✅ Pre-filled practice/department (read-only)
- ✅ Track submission status

### Public Features
- ✅ Accept offer via secure token link
- ✅ Email verification and confirmation

### Security Features
- ✅ JWT-based authentication
- ✅ Role-based access control
- ✅ Bcrypt password hashing
- ✅ Secure token generation for offers
- ✅ File validation (PDF/JPG/PNG, max 5MB)
- ✅ Protected API routes

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager

## 🛠️ Installation

### 1. Clone or Navigate to the Project

```bash
cd "d:\OneDrive - WinWire\Documents\Employee OnBoard"
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
copy .env.example .env
```

### 3. Configure Backend Environment Variables

Edit `backend/.env` file with your configurations:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/employee-onboarding

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# Email Configuration (Gmail Example)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
EMAIL_FROM=noreply@company.com

# Admin Seed Configuration
ADMIN_EMAIL=21jr1a05d0@gmail.com
ADMIN_PASSWORD=Admin@WW2025

# Application URL
CLIENT_URL=http://localhost:3000
SERVER_URL=http://localhost:5000
```

**Important Email Setup:**
- For Gmail, you need to create an [App Password](https://support.google.com/accounts/answer/185833)
- Enable 2-factor authentication on your Gmail account
- Generate an app-specific password and use it in `EMAIL_PASSWORD`

### 4. Seed Admin User

```bash
npm run seed
```

This will create the admin user with:
- **Email**: 21jr1a05d0@gmail.com
- **Password**: Admin@WW2025 (or whatever you set in .env)

### 5. Start Backend Server

```bash
# Development mode with auto-reload
npm run dev

# Or production mode
npm start
```

Backend will run on `http://localhost:5000`

### 6. Frontend Setup

Open a new terminal:

```bash
cd frontend

# Install dependencies
npm install
```

### 7. Start Frontend

```bash
npm start
```

Frontend will run on `http://localhost:3000`

## 📱 Usage Guide

### Admin Workflow

1. **Login**
   - Navigate to `http://localhost:3000/login`
   - Email: `21jr1a05d0@gmail.com`
   - Password: `Admin@WW2025`

2. **Create Candidate**
   - Go to Admin Dashboard
   - Click "Add Candidate"
   - Fill in candidate details (name, email, phone, practice, position)
   - Submit

3. **Send Offer Letter**
   - In Candidates tab, click "Send Offer"
   - Offer email will be sent with a secure link
   - Link expires in 7 days

4. **After Candidate Accepts Offer**
   - Click "Send Joining Details"
   - System creates employee account
   - Credentials are emailed to candidate

5. **Review Joining Submission**
   - Go to "Joining Requests" tab
   - Click "Review" on submitted requests
   - View all documents and details
   - Approve or Reject with remarks

6. **On Approval**
   - System auto-generates Employee ID (e.g., EMP00001)
   - Password auto-generated: first 3 letters + "@WW2025"
   - Employee account activated
   - Welcome email sent to all employees

### Employee Workflow

1. **Accept Offer**
   - Click link in offer email
   - Click "Accept Offer" button

2. **Login**
   - Use credentials received via email
   - Email: your-email@example.com
   - Password: (first 3 letters of name)@WW2025

3. **Complete Joining Form**
   - Fill personal information
   - Add emergency contact details
   - Enter bank details
   - Upload profile photo
   - Write self-description
   - Upload documents:
     - Educational certificates (up to 5 files)
     - ID proof (Aadhar/PAN/Passport)
     - Address proof
   - Submit form

4. **Wait for Review**
   - HR will review your submission
   - You'll receive email notification

5. **After Approval**
   - Account activated
   - Welcome email sent to all employees

## 🗂️ Project Structure

```
Employee OnBoard/
├── backend/
│   ├── config/
│   │   └── db.js                 # Database connection
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT & role-based auth
│   │   ├── errorMiddleware.js    # Error handling
│   │   └── uploadMiddleware.js   # File upload with Multer
│   ├── models/
│   │   ├── User.js               # User model
│   │   ├── Candidate.js          # Candidate model
│   │   ├── JoiningRequest.js     # Joining request model
│   │   └── Employee.js           # Employee model
│   ├── routes/
│   │   ├── authRoutes.js         # Authentication routes
│   │   ├── adminRoutes.js        # Admin routes
│   │   ├── employeeRoutes.js     # Employee routes
│   │   └── publicRoutes.js       # Public routes
│   ├── services/
│   │   └── emailService.js       # Email service with Nodemailer
│   ├── utils/
│   │   └── tokenUtils.js         # JWT utilities
│   ├── seed/
│   │   └── seedAdmin.js          # Admin seed script
│   ├── uploads/                  # Uploaded files directory
│   ├── .env                      # Environment variables
│   ├── .env.example              # Environment template
│   ├── package.json
│   └── server.js                 # Express server
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.js         # Navigation bar
    │   │   └── PrivateRoute.js   # Protected route component
    │   ├── context/
    │   │   └── AuthContext.js    # Authentication context
    │   ├── pages/
    │   │   ├── Login.js          # Login page
    │   │   ├── AcceptOffer.js    # Offer acceptance page
    │   │   ├── admin/
    │   │   │   └── AdminDashboard.js
    │   │   └── employee/
    │   │       └── EmployeeDashboard.js
    │   ├── services/
    │   │   └── api.js            # API service layer
    │   ├── App.js                # Main app component
    │   ├── index.js              # React entry point
    │   └── index.css             # Global styles
    └── package.json
```

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user (Protected)

### Admin Routes (Protected, Admin Only)
- `POST /api/admin/candidates` - Create candidate
- `GET /api/admin/candidates` - Get all candidates
- `POST /api/admin/candidates/:id/send-offer` - Send offer letter
- `POST /api/admin/candidates/:id/send-joining-details` - Send joining details
- `GET /api/admin/joining-requests` - Get all joining requests
- `GET /api/admin/joining-requests/:id` - Get joining request details
- `POST /api/admin/joining-requests/:id/review` - Review joining request
- `GET /api/admin/employees` - Get all employees
- `GET /api/admin/dashboard-stats` - Get dashboard statistics

### Employee Routes (Protected, Employee Only)
- `GET /api/employee/joining-request` - Get own joining request
- `POST /api/employee/submit-joining-form` - Submit joining form with files

### Public Routes
- `GET /api/public/verify-offer/:token` - Verify offer token
- `POST /api/public/accept-offer/:token` - Accept offer

## 📧 Email Templates

The application sends automated emails for:

1. **Offer Letter Email**
   - Includes accept offer button with secure link
   - Expires in 7 days

2. **Joining Details Email**
   - Contains login credentials
   - Lists required documents
   - Login link

3. **Welcome Email**
   - Sent to all active employees
   - Includes new employee's photo, name, practice, and description

4. **Review Email**
   - Approval or rejection notification
   - HR remarks/feedback

## 🔒 Security Best Practices

1. **Environment Variables**: Never commit `.env` file to version control
2. **JWT Secret**: Use a strong, random secret key in production
3. **Email Passwords**: Use app-specific passwords, not your main password
4. **File Upload**: Files are validated for type and size
5. **Password Hashing**: All passwords hashed with bcrypt
6. **Token Expiry**: Offer tokens expire after 7 days
7. **Role-Based Access**: Routes protected by role middleware

## 🐛 Troubleshooting

### Email Not Sending
- Check EMAIL_USER and EMAIL_PASSWORD in .env
- For Gmail, enable 2FA and create app-specific password
- Check SMTP settings for your email provider

### MongoDB Connection Error
- Ensure MongoDB is running: `mongod`
- Check MONGODB_URI in .env
- Verify MongoDB is accessible on specified port

### File Upload Issues
- Check uploads folder exists in backend
- Verify file size is under 5MB
- Ensure file type is PDF/JPG/PNG

### Login Issues
- Run seed script to create admin user
- Check credentials match .env configuration
- Clear browser cache and localStorage

## 📝 Default Credentials

### Admin
- **Email**: 21jr1a05d0@gmail.com
- **Password**: Admin@WW2025 (configurable in .env)

### Employee
- Credentials are auto-generated and sent via email
- Password format: First 3 letters of name + "@WW2025"

## 🚀 Production Deployment

Before deploying to production:

1. Change `NODE_ENV` to `production`
2. Use strong `JWT_SECRET`
3. Use production MongoDB database
4. Configure proper email service
5. Set up HTTPS
6. Enable CORS only for your domain
7. Set up proper logging
8. Configure file storage (consider AWS S3)

## 📄 License

This project is created for educational/organizational purposes.

## 👥 Support

For issues or questions:
- Contact HR team
- Email: 21jr1a05d0@gmail.com

---

**Built with ❤️ using MERN Stack**
