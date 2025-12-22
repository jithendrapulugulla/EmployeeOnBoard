import React, { useState, useEffect } from 'react';
import { employeeAPI } from '../../services/api';

const EmployeeDashboard = () => {
  const [joiningRequest, setJoiningRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchJoiningRequest();
  }, []);

  const fetchJoiningRequest = async () => {
    try {
      const response = await employeeAPI.getJoiningRequest();
      setJoiningRequest(response.data);
      
      // Show form if status is pending
      if (response.data.status === 'pending') {
        setShowForm(true);
      }
    } catch (error) {
      console.error('Error fetching joining request:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!joiningRequest) {
    return (
      <div className="container">
        <div className="card">
          <h2>No Joining Request Found</h2>
          <p>Please contact HR for assistance.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h2>Employee Dashboard</h2>

      {joiningRequest.status === 'pending' && showForm && (
        <JoiningForm joiningRequest={joiningRequest} onSuccess={fetchJoiningRequest} />
      )}

      {joiningRequest.status === 'submitted' && (
        <div className="card">
          <h3>Joining Form Submitted</h3>
          <p>Your joining form has been submitted successfully and is under review by HR.</p>
          <p>You will be notified once your submission is reviewed.</p>
        </div>
      )}

      {joiningRequest.status === 'approved' && (
        <div className="card">
          <h3 style={{ color: '#4CAF50' }}>Welcome to the Team! 🎉</h3>
          <p>Your joining request has been approved. Welcome aboard!</p>
          {joiningRequest.reviewRemarks && (
            <div style={{ background: '#f5f5f5', padding: '12px', borderRadius: '4px', marginTop: '12px' }}>
              <strong>HR Comments:</strong>
              <p>{joiningRequest.reviewRemarks}</p>
            </div>
          )}
        </div>
      )}

      {joiningRequest.status === 'rejected' && (
        <div className="card">
          <h3 style={{ color: '#f44336' }}>Revision Required</h3>
          <p>Your joining request requires some updates. Please review the comments below:</p>
          {joiningRequest.reviewRemarks && (
            <div style={{ background: '#ffebee', padding: '12px', borderRadius: '4px', marginTop: '12px' }}>
              <strong>HR Comments:</strong>
              <p>{joiningRequest.reviewRemarks}</p>
            </div>
          )}
          <button onClick={() => setShowForm(true)} className="btn btn-primary" style={{ marginTop: '16px' }}>
            Update Submission
          </button>
        </div>
      )}
    </div>
  );
};

const JoiningForm = ({ joiningRequest, onSuccess }) => {
  const [formData, setFormData] = useState({
    dateOfBirth: '',
    presentAddress: '',
    presentCity: '',
    presentState: '',
    presentPincode: '',
    permanentAddress: '',
    permanentCity: '',
    permanentState: '',
    permanentPincode: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: '',
    selfDescription: '',
    bankAccountNumber: '',
    bankName: '',
    bankIFSC: '',
    uan: '', // UAN - only if experience exists
    tenthGrade: '',
    interGrade: '',
    btechGrade: '',
  });

  const [files, setFiles] = useState({
    profilePhoto: null,
    idProof: null,
    addressProof: null,
    tenthDocument: null,
    interDocument: null,
    btechDocument: null,
  });

  // Experience array state - initialize as empty and let useEffect populate it
  const [experience, setExperience] = useState(null);

  // Load existing data on mount
  useEffect(() => {
    // Initialize experience on mount - start with empty array (optional)
    if (joiningRequest?.experience && Array.isArray(joiningRequest.experience) && joiningRequest.experience.length > 0) {
      const experienceArray = joiningRequest.experience.map(exp => ({
        companyName: exp.companyName || '',
        years: exp.years || '',
        certificate: null // Files can't be reloaded, user will need to reupload
      }));
      setExperience(experienceArray);
    } else {
      // Start with empty array (no experience entries)
      setExperience([]);
    }
    
    if (joiningRequest) {
      // Set form data
      if (joiningRequest.dateOfBirth) setFormData(prev => ({ ...prev, dateOfBirth: joiningRequest.dateOfBirth.split('T')[0] }));
      // New address fields
      if (joiningRequest.presentAddress) setFormData(prev => ({ ...prev, presentAddress: joiningRequest.presentAddress }));
      if (joiningRequest.presentCity) setFormData(prev => ({ ...prev, presentCity: joiningRequest.presentCity }));
      if (joiningRequest.presentState) setFormData(prev => ({ ...prev, presentState: joiningRequest.presentState }));
      if (joiningRequest.presentPincode) setFormData(prev => ({ ...prev, presentPincode: joiningRequest.presentPincode }));
      if (joiningRequest.permanentAddress) setFormData(prev => ({ ...prev, permanentAddress: joiningRequest.permanentAddress }));
      if (joiningRequest.permanentCity) setFormData(prev => ({ ...prev, permanentCity: joiningRequest.permanentCity }));
      if (joiningRequest.permanentState) setFormData(prev => ({ ...prev, permanentState: joiningRequest.permanentState }));
      if (joiningRequest.permanentPincode) setFormData(prev => ({ ...prev, permanentPincode: joiningRequest.permanentPincode }));
      // Fallback to old address field for backwards compatibility
      if (joiningRequest.address && !joiningRequest.presentAddress) setFormData(prev => ({ ...prev, presentAddress: joiningRequest.address }));
      if (joiningRequest.city && !joiningRequest.presentCity) setFormData(prev => ({ ...prev, presentCity: joiningRequest.city }));
      if (joiningRequest.state && !joiningRequest.presentState) setFormData(prev => ({ ...prev, presentState: joiningRequest.state }));
      if (joiningRequest.pincode && !joiningRequest.presentPincode) setFormData(prev => ({ ...prev, presentPincode: joiningRequest.pincode }));
      if (joiningRequest.emergencyContactName) setFormData(prev => ({ ...prev, emergencyContactName: joiningRequest.emergencyContactName }));
      if (joiningRequest.emergencyContactPhone) setFormData(prev => ({ ...prev, emergencyContactPhone: joiningRequest.emergencyContactPhone }));
      if (joiningRequest.emergencyContactRelation) setFormData(prev => ({ ...prev, emergencyContactRelation: joiningRequest.emergencyContactRelation }));
      if (joiningRequest.selfDescription) setFormData(prev => ({ ...prev, selfDescription: joiningRequest.selfDescription }));
      if (joiningRequest.bankAccountNumber) setFormData(prev => ({ ...prev, bankAccountNumber: joiningRequest.bankAccountNumber }));
      if (joiningRequest.bankName) setFormData(prev => ({ ...prev, bankName: joiningRequest.bankName }));
      if (joiningRequest.bankIFSC) setFormData(prev => ({ ...prev, bankIFSC: joiningRequest.bankIFSC }));
      if (joiningRequest.bankDetails?.uan) setFormData(prev => ({ ...prev, uan: joiningRequest.bankDetails.uan }));
      if (joiningRequest.tenthGrade) setFormData(prev => ({ ...prev, tenthGrade: joiningRequest.tenthGrade }));
      if (joiningRequest.interGrade) setFormData(prev => ({ ...prev, interGrade: joiningRequest.interGrade }));
      if (joiningRequest.btechGrade) setFormData(prev => ({ ...prev, btechGrade: joiningRequest.btechGrade }));
    }
  }, [joiningRequest]);

  // Handle experience file change
  const handleExperienceFileChange = (idx, e) => {
    const updated = [...experience];
    updated[idx].certificate = e.target.files[0];
    setExperience(updated);
  };

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const { name, files: selectedFiles } = e.target;
    setFiles({ ...files, [name]: selectedFiles[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // Validate experience only if user added companies
      const hasExperience = experience && experience.length > 0 && experience.some(exp => exp.companyName);
      
      if (hasExperience) {
        // Validate that all filled experience fields are complete
        for (let i = 0; i < experience.length; i++) {
          if (experience[i].companyName || experience[i].years || experience[i].certificate) {
            // If any field is filled, all must be filled
            if (!experience[i].companyName || !experience[i].years || !experience[i].certificate) {
              setError('All experience fields are required for each company entry.');
              setLoading(false);
              return;
            }
          }
        }
      }

      // Validate UAN if experience exists
      if (hasExperience && !formData.uan) {
        setError('UAN (EPFO) number is required when you have work experience.');
        setLoading(false);
        return;
      }

      // Create FormData
      const submitData = new FormData();
      // Append form fields
      submitData.append('dateOfBirth', formData.dateOfBirth);
      submitData.append('presentAddress', formData.presentAddress);
      submitData.append('presentCity', formData.presentCity);
      submitData.append('presentState', formData.presentState);
      submitData.append('presentPincode', formData.presentPincode);
      submitData.append('permanentAddress', formData.permanentAddress);
      submitData.append('permanentCity', formData.permanentCity);
      submitData.append('permanentState', formData.permanentState);
      submitData.append('permanentPincode', formData.permanentPincode);
      submitData.append('emergencyContactName', formData.emergencyContactName);
      submitData.append('emergencyContactPhone', formData.emergencyContactPhone);
      submitData.append('emergencyContactRelation', formData.emergencyContactRelation);
      submitData.append('selfDescription', formData.selfDescription);
      submitData.append('bankAccountNumber', formData.bankAccountNumber);
      submitData.append('bankName', formData.bankName);
      submitData.append('bankIFSC', formData.bankIFSC);
      submitData.append('tenthGrade', formData.tenthGrade);
      submitData.append('interGrade', formData.interGrade);
      submitData.append('btechGrade', formData.btechGrade);
      // Append UAN separately (not in formData iteration)
      submitData.append('uan', formData.uan || '');
      // Append files
      if (files.profilePhoto) submitData.append('profilePhoto', files.profilePhoto);
      if (files.idProof) submitData.append('idProof', files.idProof);
      if (files.addressProof) submitData.append('addressProof', files.addressProof);
      if (files.tenthDocument) submitData.append('tenthDocument', files.tenthDocument);
      if (files.interDocument) submitData.append('interDocument', files.interDocument);
      if (files.btechDocument) submitData.append('btechDocument', files.btechDocument);
      // Experience array as JSON - ensure years is a number
      const experienceData = experience.map(e => ({
        companyName: String(e.companyName).trim(),
        years: parseFloat(e.years) || 0
      }));
      submitData.append('experience', JSON.stringify(experienceData));
      // Experience certificates
      experience.forEach((exp, idx) => {
        if (exp.certificate) {
          submitData.append(`experienceCertificate_${idx}`, exp.certificate);
        }
      });
      await employeeAPI.submitJoiningForm(submitData);
      alert('Joining form submitted successfully!');
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Error submitting form');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h3>Complete Your Joining Details</h3>
      <p style={{ color: '#666', marginBottom: '24px' }}>
        Please fill in all required information and upload the necessary documents.
      </p>

      <form onSubmit={handleSubmit}>
        {/* SECTION 1: Profile */}
        <h4 style={{ marginTop: '24px', marginBottom: '16px', borderBottom: '2px solid #f0f0f0', paddingBottom: '8px' }}>
          🎯 Profile
        </h4>

        <div className="form-group">
          <label>Practice/Department (Read-only)</label>
          <input type="text" value={joiningRequest.practice} disabled />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="form-group">
            <label>Date of Birth *</label>
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input type="text" value={joiningRequest.phone} disabled />
          </div>
        </div>

        <div className="form-group">
          <label>Profile Photo * (JPG/PNG, max 5MB)</label>
          <input
            type="file"
            name="profilePhoto"
            onChange={handleFileChange}
            accept=".jpg,.jpeg,.png"
            required
          />
        </div>

        <div className="form-group">
          <label>Self Description * (Tell us about yourself)</label>
          <textarea
            name="selfDescription"
            value={formData.selfDescription}
            onChange={handleChange}
            required
            placeholder="Introduce yourself - your background, interests, hobbies, etc."
            rows="4"
          />
        </div>

        {/* SECTION 2: Address */}
        <h4 style={{ marginTop: '24px', marginBottom: '16px', borderBottom: '2px solid #f0f0f0', paddingBottom: '8px', color: '#1976d2' }}>
          📍 Present Address *
        </h4>

        <div className="form-group">
          <label>Present Address *</label>
          <textarea
            name="presentAddress"
            value={formData.presentAddress}
            onChange={handleChange}
            required
            placeholder="Enter your current residential address"
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
          <div className="form-group">
            <label>City *</label>
            <input
              type="text"
              name="presentCity"
              value={formData.presentCity}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>State *</label>
            <input
              type="text"
              name="presentState"
              value={formData.presentState}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Pincode *</label>
            <input
              type="text"
              name="presentPincode"
              value={formData.presentPincode}
              onChange={handleChange}
              required
              pattern="[0-9]{6}"
              placeholder="6-digit pincode"
            />
          </div>
        </div>

        <h4 style={{ marginTop: '24px', marginBottom: '16px', borderBottom: '2px solid #f0f0f0', paddingBottom: '8px', color: '#1976d2' }}>
          🏠 Permanent Address *
        </h4>

        <div className="form-group">
          <label>Permanent Address *</label>
          <textarea
            name="permanentAddress"
            value={formData.permanentAddress}
            onChange={handleChange}
            required
            placeholder="Enter your permanent residential address"
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
          <div className="form-group">
            <label>City *</label>
            <input
              type="text"
              name="permanentCity"
              value={formData.permanentCity}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>State *</label>
            <input
              type="text"
              name="permanentState"
              value={formData.permanentState}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Pincode *</label>
            <input
              type="text"
              name="permanentPincode"
              value={formData.permanentPincode}
              onChange={handleChange}
              required
              pattern="[0-9]{6}"
              placeholder="6-digit pincode"
            />
          </div>
        </div>

        {/* SECTION 3: Emergency Contact */}
        <h4 style={{ marginTop: '24px', marginBottom: '16px', borderBottom: '2px solid #f0f0f0', paddingBottom: '8px' }}>
          🆘 Emergency Contact
        </h4>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
          <div className="form-group">
            <label>Name *</label>
            <input
              type="text"
              name="emergencyContactName"
              value={formData.emergencyContactName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Phone *</label>
            <input
              type="tel"
              name="emergencyContactPhone"
              value={formData.emergencyContactPhone}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Relation *</label>
            <input
              type="text"
              name="emergencyContactRelation"
              value={formData.emergencyContactRelation}
              onChange={handleChange}
              required
              placeholder="e.g., Father, Mother, Spouse"
            />
          </div>
        </div>

        {/* SECTION 4: Education Details */}
        <h4 style={{ marginTop: '24px', marginBottom: '16px', borderBottom: '2px solid #f0f0f0', paddingBottom: '8px' }}>
          📚 Education Details & Grades
        </h4>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="form-group">
            <label>10th Grade/Marks * (e.g., 85.5%)</label>
            <input
              type="text"
              name="tenthGrade"
              value={formData.tenthGrade}
              onChange={handleChange}
              required
              placeholder="e.g., 85.5% or 8.5/10"
            />
          </div>
          <div className="form-group">
            <label>10th Grade Certificate * (PDF/JPG/PNG)</label>
            <input
              type="file"
              name="tenthDocument"
              onChange={handleFileChange}
              accept=".pdf,.jpg,.jpeg,.png"
              required
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="form-group">
            <label>Intermediate/12th Grade/Marks * (e.g., 88%)</label>
            <input
              type="text"
              name="interGrade"
              value={formData.interGrade}
              onChange={handleChange}
              required
              placeholder="e.g., 88% or 8.8/10"
            />
          </div>
          <div className="form-group">
            <label>Intermediate Certificate * (PDF/JPG/PNG)</label>
            <input
              type="file"
              name="interDocument"
              onChange={handleFileChange}
              accept=".pdf,.jpg,.jpeg,.png"
              required
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="form-group">
            <label>B.Tech/Degree Grade/CGPA * (e.g., 7.8/10)</label>
            <input
              type="text"
              name="btechGrade"
              value={formData.btechGrade}
              onChange={handleChange}
              required
              placeholder="e.g., 7.8/10 or 78%"
            />
          </div>
          <div className="form-group">
            <label>B.Tech/Degree Certificate * (PDF/JPG/PNG)</label>
            <input
              type="file"
              name="btechDocument"
              onChange={handleFileChange}
              accept=".pdf,.jpg,.jpeg,.png"
              required
            />
          </div>
        </div>

        {/* SECTION 5: Professional Experience - Optional */}
        <h4 style={{ marginTop: '24px', marginBottom: '16px', borderBottom: '2px solid #f0f0f0', paddingBottom: '8px', color: '#1976d2' }}>
          💼 Professional Experience <span style={{ color: '#666', fontWeight: 'normal', fontSize: '14px' }}>(Optional)</span>
        </h4>
        
        {experience && experience.length === 0 ? (
          <div style={{ padding: '16px', background: '#e3f2fd', borderRadius: '6px', marginBottom: '16px', border: '1px dashed #1976d2' }}>
            <p style={{ margin: '0 0 12px 0', color: '#1565c0', fontWeight: '500' }}>No work experience added yet.</p>
            <button type="button" className="btn btn-primary" onClick={() => setExperience([{ companyName: '', years: '', certificate: null }])}>
              + Add Work Experience
            </button>
          </div>
        ) : (
          <>
            {experience && experience.map((exp, idx) => (
              <div key={idx} style={{ border: '1px solid #eee', padding: '16px', borderRadius: '6px', marginBottom: '12px', background: '#fafbfc' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label>Company Name *</label>
                    <input type="text" value={exp.companyName || ''} onChange={e => {
                      const updated = [...experience];
                      updated[idx].companyName = e.target.value;
                      setExperience(updated);
                    }} placeholder="e.g., ABC Pvt Ltd" />
                  </div>
                  <div className="form-group">
                    <label>Years in Company *</label>
                    <input type="number" min="0" step="0.1" value={exp.years || ''} onChange={e => {
                      const updated = [...experience];
                      updated[idx].years = e.target.value;
                      setExperience(updated);
                    }} placeholder="e.g., 2.5" />
                  </div>
                  <div className="form-group">
                    <label>Experience/Relieving Letter *</label>
                    <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => handleExperienceFileChange(idx, e)} />
                  </div>
                </div>
                <button type="button" className="btn btn-danger" style={{ marginTop: '8px' }} onClick={() => {
                  setExperience(experience.filter((_, i) => i !== idx));
                }}>Remove Company</button>
              </div>
            ))}
            {experience && <button type="button" className="btn btn-secondary" style={{ marginBottom: '16px' }} onClick={() => setExperience([...experience, { companyName: '', years: '', certificate: null }])}>+ Add Another Company</button>}
          </>
        )}

        {/* SECTION 6: Bank Details */}
        <h4 style={{ marginTop: '24px', marginBottom: '16px', borderBottom: '2px solid #f0f0f0', paddingBottom: '8px' }}>
          🏦 Bank Details
        </h4>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="form-group">
            <label>Account Number *</label>
            <input
              type="text"
              name="bankAccountNumber"
              value={formData.bankAccountNumber}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Bank Name *</label>
            <input
              type="text"
              name="bankName"
              value={formData.bankName}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>IFSC Code *</label>
          <input
            type="text"
            name="bankIFSC"
            value={formData.bankIFSC}
            onChange={handleChange}
            required
            pattern="[A-Z]{4}0[A-Z0-9]{6}"
            placeholder="e.g., SBIN0001234"
          />
        </div>

        {/* Conditional UAN Field - Only if experience exists */}
        {experience && experience.length > 0 && experience.some(e => e.companyName && e.years) && (
          <div style={{ marginTop: '16px', padding: '12px', background: '#f5f5f5', borderRadius: '4px', marginBottom: '16px' }}>
            <div className="form-group">
              <label>UAN (EPFO) Number * (12-digit)</label>
              <input
                type="text"
                name="uan"
                value={formData.uan}
                onChange={handleChange}
                required
                placeholder="e.g., 123456789012"
                pattern="[0-9]{12}"
                maxLength="12"
              />
              <small style={{ color: '#666' }}>Enter your 12-digit UAN (Unique Account Number) from EPFO</small>
            </div>
          </div>
        )}

        {/* SECTION 7: Document Uploads */}
        <h4 style={{ marginTop: '24px', marginBottom: '16px', borderBottom: '2px solid #f0f0f0', paddingBottom: '8px' }}>
          📄 Document Uploads
        </h4>

        <div className="form-group">
          <label>ID Proof * (Aadhar/PAN/Passport - PDF/JPG/PNG)</label>
          <input
            type="file"
            name="idProof"
            onChange={handleFileChange}
            accept=".pdf,.jpg,.jpeg,.png"
            required
          />
        </div>

        <div className="form-group">
          <label>Address Proof * (PDF/JPG/PNG)</label>
          <input
            type="file"
            name="addressProof"
            onChange={handleFileChange}
            accept=".pdf,.jpg,.jpeg,.png"
            required
          />
          <small style={{ color: '#666' }}>Utility bill, rental agreement, etc.</small>
        </div>

        {error && <div className="error">{error}</div>}

        <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Joining Form'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EmployeeDashboard;
