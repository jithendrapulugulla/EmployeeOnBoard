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
    address: '',
    city: '',
    state: '',
    pincode: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: '',
    selfDescription: '',
    bankAccountNumber: '',
    bankName: '',
    bankIFSC: '',
  });

  const [files, setFiles] = useState({
    profilePhoto: null,
    educationalCertificates: [],
    idProof: null,
    addressProof: null,
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const { name, files: selectedFiles } = e.target;
    
    if (name === 'educationalCertificates') {
      setFiles({ ...files, [name]: Array.from(selectedFiles) });
    } else {
      setFiles({ ...files, [name]: selectedFiles[0] });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Create FormData
      const submitData = new FormData();
      
      // Append form fields
      Object.keys(formData).forEach(key => {
        submitData.append(key, formData[key]);
      });

      // Append files
      if (files.profilePhoto) {
        submitData.append('profilePhoto', files.profilePhoto);
      }
      if (files.idProof) {
        submitData.append('idProof', files.idProof);
      }
      if (files.addressProof) {
        submitData.append('addressProof', files.addressProof);
      }
      if (files.educationalCertificates.length > 0) {
        files.educationalCertificates.forEach(file => {
          submitData.append('educationalCertificates', file);
        });
      }

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
        {/* Personal Information */}
        <h4 style={{ marginTop: '24px', marginBottom: '16px', borderBottom: '2px solid #f0f0f0', paddingBottom: '8px' }}>
          Personal Information
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
          <label>Address *</label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
            placeholder="Enter your complete address"
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
          <div className="form-group">
            <label>City *</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>State *</label>
            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Pincode *</label>
            <input
              type="text"
              name="pincode"
              value={formData.pincode}
              onChange={handleChange}
              required
              pattern="[0-9]{6}"
              placeholder="6-digit pincode"
            />
          </div>
        </div>

        {/* Emergency Contact */}
        <h4 style={{ marginTop: '24px', marginBottom: '16px', borderBottom: '2px solid #f0f0f0', paddingBottom: '8px' }}>
          Emergency Contact
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

        {/* Bank Details */}
        <h4 style={{ marginTop: '24px', marginBottom: '16px', borderBottom: '2px solid #f0f0f0', paddingBottom: '8px' }}>
          Bank Details
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

        {/* Profile */}
        <h4 style={{ marginTop: '24px', marginBottom: '16px', borderBottom: '2px solid #f0f0f0', paddingBottom: '8px' }}>
          Profile
        </h4>

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

        {/* Documents */}
        <h4 style={{ marginTop: '24px', marginBottom: '16px', borderBottom: '2px solid #f0f0f0', paddingBottom: '8px' }}>
          Document Uploads
        </h4>

        <div className="form-group">
          <label>Educational Certificates * (PDF/JPG/PNG, max 5 files)</label>
          <input
            type="file"
            name="educationalCertificates"
            onChange={handleFileChange}
            accept=".pdf,.jpg,.jpeg,.png"
            multiple
            required
          />
          <small style={{ color: '#666' }}>Upload degree certificates, mark sheets, etc.</small>
        </div>

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
