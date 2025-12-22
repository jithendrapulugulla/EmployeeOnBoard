# Document Attachment Feature - Setup & Testing Guide

## Quick Start

### Prerequisites
- Backend running on `http://localhost:5000`
- Frontend running on `http://localhost:3000`
- MongoDB database connected
- Email service configured with SMTP credentials

### Feature Location
Navigate to **Admin Dashboard > Candidates Tab**

## Testing Steps

### Test 1: Send Offer with Document

**Steps:**
1. Go to Admin Dashboard > Candidates tab
2. Find a candidate with status "Offer Not Sent"
3. Click "Send Offer" button
4. In the modal, click the file input
5. Select a PDF, JPG, or PNG file
6. Verify filename appears below input
7. Click "Send Offer" button
8. Wait for success message
9. Modal should close automatically
10. Verify email received with attachment

**Expected Result:**
- ✅ Modal appears with file upload
- ✅ Selected filename displays
- ✅ File uploads successfully
- ✅ Email sent with PDF attachment
- ✅ Candidate status changed to "Offer Sent"

### Test 2: Send Offer Without Document

**Steps:**
1. Go to Admin Dashboard > Candidates tab
2. Find another candidate with status "Offer Not Sent"
3. Click "Send Offer" button
4. Leave file input empty
5. Click "Send Offer" button
6. Wait for success message
7. Modal should close

**Expected Result:**
- ✅ Email sent without attachment
- ✅ Candidate status changed to "Offer Sent"
- ✅ No attachment errors in console

### Test 3: Send Joining Details with Document

**Steps:**
1. Go to Admin Dashboard > Candidates tab
2. Find a candidate with status "Offer Accepted" and "Joining Details Not Sent"
3. Click "Send Joining Details" button
4. In the modal, select a PDF file
5. Click "Send Joining Details" button
6. Wait for success message
7. Verify email received

**Expected Result:**
- ✅ Modal appears
- ✅ File uploads successfully
- ✅ Email sent with attachment and temporary password
- ✅ Candidate status changed to "Joining Details Sent"
- ✅ New User account created for employee

### Test 4: File Validation

**Test 4a: Invalid File Type**
1. Open Send Offer modal
2. Try to select a .txt or .doc file
3. Verify error message appears

**Test 4b: File Too Large**
1. Open Send Offer modal
2. Try to select a file > 5MB
3. Verify error message appears: "File size must be less than 5MB"

**Expected Result:**
- ✅ Only PDF, JPG, PNG accepted
- ✅ File size limit enforced
- ✅ Error messages display correctly

### Test 5: Error Handling

**Test 5a: Network Error**
1. Open Send Offer modal
2. Disconnect internet connection
3. Click "Send Offer"
4. Verify error message displays
5. Modal remains open for retry

**Test 5b: Duplicate Send**
1. Send offer to a candidate
2. Try to send offer again to same candidate
3. Verify error: "Offer already sent to this candidate"

**Expected Result:**
- ✅ Network errors handled gracefully
- ✅ Duplicate send prevented
- ✅ Error messages are helpful

## API Endpoints

### Send Offer with Document
```
POST /api/admin/candidates/:id/send-offer
Content-Type: multipart/form-data

Body:
- document (file, optional)

Response:
{
  "message": "Offer sent successfully"
}
```

### Send Joining Details with Document
```
POST /api/admin/candidates/:id/send-joining-details
Content-Type: multipart/form-data

Body:
- document (file, optional)

Response:
{
  "message": "Joining details sent successfully"
}
```

## File Upload Details

### Upload Directory
- Location: `backend/uploads/`
- Files stored with timestamp prefix
- Example: `1234567890_Offer_Letter.pdf`

### File Constraints
- Accepted types: PDF, JPG, JPEG, PNG
- Maximum size: 5MB
- Validated on both frontend and backend

### Multer Configuration
```javascript
// backend/middleware/uploadMiddleware.js
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});
```

## Email Configuration

### SMTP Setup Required
In `backend/.env`:
```
SMTP_HOST=your-smtp-host
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@example.com
SMTP_PASS=your-password
EMAIL_FROM=noreply@winwire.com
CLIENT_URL=http://localhost:3000
```

### Email Contents

**Offer Email:**
- Recipient: candidate.email
- Subject: "Job Offer - Welcome to Our Team!"
- Contains: Position, practice, accept button
- Attachment: Optional (if document uploaded)

**Joining Details Email:**
- Recipient: candidate.email
- Subject: "Joining Details & Login Credentials"
- Contains: Temporary password, login button, required documents list
- Attachment: Optional (if document uploaded)

## Troubleshooting

### Issue: File input not appearing
- **Solution**: Check if modals are imported in AdminDashboard.js
- **Check**: `import SendOfferModal from '../../components/SendOfferModal'`

### Issue: Document not attached to email
- **Solution**: Verify `uploadMiddleware.js` has `uploadDocumentAttachment` middleware
- **Check**: Route includes `uploadDocumentAttachment` as middleware
- **Check**: Email service receives `attachmentPath` parameter

### Issue: "File size must be less than 5MB" error
- **Solution**: Select a smaller file (< 5MB)
- **Note**: Frontend validates before upload; backend validates on receipt

### Issue: File not storing properly
- **Solution**: Ensure `backend/uploads/` directory exists
- **Command**: `mkdir -p backend/uploads`
- **Permissions**: Check write permissions on uploads folder

### Issue: Email not sent with attachment
- **Check Console**: Look for email service errors
- **Check**: SMTP credentials in .env file
- **Check**: Email service receiving attachmentPath correctly
- **Test**: Try sending without document first

## Performance Considerations

1. **File Upload**: Large files (up to 5MB) may take time to upload
2. **Email Sending**: Async operation runs in background, doesn't block response
3. **Database**: Candidate status updated before email sent
4. **Cleanup**: Old files in uploads/ should be cleaned up periodically

## Security Notes

✅ File type validated (PDF, JPG, PNG only)
✅ File size limited (5MB max)
✅ Authentication required (JWT token)
✅ Authorization required (admin role)
✅ FormData ensures secure multipart upload
✅ File stored with timestamp in filename
✅ Path traversal prevented by multer

## Support

For issues or questions:
1. Check browser console for errors
2. Check backend server logs for email errors
3. Verify all environment variables are set
4. Ensure database connection is active
5. Test email service separately if needed
