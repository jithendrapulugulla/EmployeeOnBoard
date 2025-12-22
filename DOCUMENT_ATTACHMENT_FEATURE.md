# Document Attachment Feature - Implementation Complete

## Overview
Admins can now upload custom PDF documents when sending offer and joining detail emails to candidates. This replaces the auto-generated PDF system per user requirements.

## Implementation Summary

### Backend Changes

#### 1. Email Service (`backend/services/emailService.js`)
- ✅ Updated `sendOfferEmail()` to accept optional `attachmentPath` parameter
- ✅ Updated `sendJoiningDetailsEmail()` to accept optional `attachmentPath` parameter
- ✅ Both functions attach the document if path is provided
- ✅ Removed all auto-PDF generation code (html-pdf-node)
- ✅ Email templates mention documents sent separately by HR

#### 2. Upload Middleware (`backend/middleware/uploadMiddleware.js`)
- ✅ Added `uploadDocumentAttachment` middleware for single file upload
- ✅ Supports PDF, JPG, JPEG, PNG files
- ✅ Max file size: 5MB
- ✅ Uses multer for reliable file handling

#### 3. Admin Routes (`backend/routes/adminRoutes.js`)
- ✅ `/candidates/:id/send-offer` route:
  - Uses `uploadDocumentAttachment` middleware
  - Extracts `req.file.path` if document uploaded
  - Passes `attachmentPath` to `sendOfferEmail()`
  
- ✅ `/candidates/:id/send-joining-details` route:
  - Uses `uploadDocumentAttachment` middleware
  - Extracts `req.file.path` if document uploaded
  - Passes `attachmentPath` to `sendJoiningDetailsEmail()`

### Frontend Changes

#### 1. API Service (`frontend/src/services/api.js`)
- ✅ `adminAPI.sendOffer(id, document = null)`:
  - Creates FormData
  - Appends document if provided
  - Sets multipart/form-data headers
  - Optional document parameter

- ✅ `adminAPI.sendJoiningDetails(id, document = null)`:
  - Same implementation as sendOffer
  - Handles optional document upload

#### 2. Modal Components (NEW)

##### SendOfferModal (`frontend/src/components/SendOfferModal.js`)
- ✅ File input for PDF/JPG/PNG files
- ✅ File validation (type and size)
- ✅ Displays selected filename
- ✅ "Send Offer" button calls `adminAPI.sendOffer()` with document
- ✅ "Cancel" button closes modal
- ✅ Loading state during submission
- ✅ Success/error message display
- ✅ WinWire branding (colors #124B84, styling)

##### SendJoiningDetailsModal (`frontend/src/components/SendJoiningDetailsModal.js`)
- ✅ Same features as SendOfferModal
- ✅ Calls `adminAPI.sendJoiningDetails()` instead
- ✅ Consistent UI/UX

#### 3. Admin Dashboard (`frontend/src/pages/admin/AdminDashboard.js`)
- ✅ Added state for `showOfferModal`, `showJoiningModal`, `selectedCandidate`
- ✅ Imported both modal components
- ✅ `handleSendOffer(candidate)` opens SendOfferModal with selected candidate
- ✅ `handleSendJoiningDetails(candidate)` opens SendJoiningDetailsModal with selected candidate
- ✅ Updated button onClick handlers to pass candidate object
- ✅ Modals rendered conditionally with proper props
- ✅ On success, modals close and candidates list refreshes

## User Workflow

### Sending Offer Letter
1. Admin clicks "Send Offer" button on candidate row
2. SendOfferModal appears with file upload input
3. Admin optionally selects a custom offer letter PDF
4. Admin clicks "Send Offer" button in modal
5. Document uploaded via FormData (if selected)
6. Email sent with attachment (if document provided)
7. Modal closes, success message shown
8. Candidates list refreshes

### Sending Joining Details
1. Admin clicks "Send Joining Details" button on accepted candidate
2. SendJoiningDetailsModal appears with file upload input
3. Admin optionally selects a custom joining details PDF
4. Admin clicks "Send Joining Details" button in modal
5. Document uploaded via FormData (if selected)
6. Temporary password generated and email sent with attachment (if document provided)
7. Modal closes, success message shown
8. Candidates list refreshes

## File Handling

### Upload Path
- Files stored in: `backend/uploads/`
- Multer configured with file validation
- Automatic cleanup handled by upload middleware

### Supported Formats
- PDF (.pdf)
- JPEG (.jpg, .jpeg)
- PNG (.png)

### File Constraints
- Maximum size: 5MB
- Validated on both frontend and backend

## Email Features

### Offer Email
- Includes candidate name and position
- Contains accept offer button (link valid 7 days)
- Optional attached PDF (if uploaded)
- Professional HTML formatting

### Joining Details Email
- Includes temporary password
- Contains login button
- Lists documents needed from employee
- Optional attached PDF (if uploaded)
- Professional HTML formatting

## Error Handling

### Frontend (Modal Level)
- File type validation with user feedback
- File size validation with user feedback
- Submission error handling with messages
- Network error handling

### Backend (Route Level)
- Candidate existence validation
- Offer/joining status validation
- Attachment handling with try-catch
- Graceful email failure handling

## Security Considerations

✅ Multer file filter restricts file types
✅ File size limit enforced (5MB)
✅ Admin authentication required (protect middleware)
✅ Admin authorization required (admin middleware)
✅ File stored with timestamp in filename
✅ FormData ensures secure multipart upload

## Testing Checklist

- [ ] Upload PDF document with offer email
- [ ] Upload JPEG document with offer email
- [ ] Upload PNG document with offer email
- [ ] Send offer without document (optional flow)
- [ ] Send joining details with document
- [ ] Send joining details without document
- [ ] Test file size limit (>5MB rejected)
- [ ] Test invalid file type rejection
- [ ] Verify email received with attachment
- [ ] Verify temporary password generated correctly
- [ ] Verify candidate status updated (offerSent, joiningDetailsSent)
- [ ] Verify modal closes on success
- [ ] Verify error messages display correctly

## Deployment Notes

1. Ensure `backend/uploads/` directory exists
2. Check upload middleware multer config
3. Verify email credentials in .env
4. Test email service with attachment support
5. Ensure file permissions allow writing to uploads folder
6. Consider cleanup strategy for old uploaded files

## Related Files Modified

### Backend
- `backend/services/emailService.js` - Email attachment support
- `backend/middleware/uploadMiddleware.js` - Document attachment handler
- `backend/routes/adminRoutes.js` - Route handlers updated

### Frontend
- `frontend/src/services/api.js` - API methods for document upload
- `frontend/src/components/SendOfferModal.js` - NEW
- `frontend/src/components/SendJoiningDetailsModal.js` - NEW
- `frontend/src/pages/admin/AdminDashboard.js` - Modal integration

## Removed/No Longer Used

- Auto-generated PDF generation (html-pdf-node library)
- `generateOfferLetterPdf()` function
- `generateJoiningDetailsPdf()` function
- HTML templates in `backend/documents/` (not currently used)

## Next Steps

1. Test the implementation thoroughly
2. Collect any user feedback on UX
3. Consider adding document preview before sending
4. Consider storing document references in database
5. Consider audit trail for sent documents
