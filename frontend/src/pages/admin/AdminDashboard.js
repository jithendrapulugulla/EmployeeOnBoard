import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [joiningRequests, setJoiningRequests] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [activeTab, setActiveTab] = useState('candidates');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, candidatesRes, joiningRes, employeesRes] = await Promise.all([
        adminAPI.getDashboardStats(),
        adminAPI.getCandidates(),
        adminAPI.getJoiningRequests(),
        adminAPI.getEmployees(),
      ]);

      setStats(statsRes.data);
      setCandidates(candidatesRes.data);
      setJoiningRequests(joiningRes.data);
      setEmployees(employeesRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="container">
      <h2>Admin Dashboard</h2>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>{stats?.totalCandidates || 0}</h3>
          <p>Total Candidates</p>
        </div>
        <div className="stat-card">
          <h3>{stats?.offersAccepted || 0}</h3>
          <p>Offers Accepted</p>
        </div>
        <div className="stat-card">
          <h3>{stats?.pendingJoining || 0}</h3>
          <p>Pending Reviews</p>
        </div>
        <div className="stat-card">
          <h3>{stats?.totalEmployees || 0}</h3>
          <p>Total Employees</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="card">
        <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', borderBottom: '2px solid #f0f0f0' }}>
          <button
            onClick={() => setActiveTab('candidates')}
            style={{
              padding: '12px 24px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'candidates' ? '2px solid #4CAF50' : 'none',
              fontWeight: activeTab === 'candidates' ? 'bold' : 'normal',
              cursor: 'pointer',
            }}
          >
            Candidates
          </button>
          <button
            onClick={() => setActiveTab('joining')}
            style={{
              padding: '12px 24px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'joining' ? '2px solid #4CAF50' : 'none',
              fontWeight: activeTab === 'joining' ? 'bold' : 'normal',
              cursor: 'pointer',
            }}
          >
            Joining Requests
          </button>
          <button
            onClick={() => setActiveTab('employees')}
            style={{
              padding: '12px 24px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'employees' ? '2px solid #4CAF50' : 'none',
              fontWeight: activeTab === 'employees' ? 'bold' : 'normal',
              cursor: 'pointer',
            }}
          >
            Employees
          </button>
        </div>

        {activeTab === 'candidates' && (
          <CandidatesTab candidates={candidates} onRefresh={fetchData} setShowModal={setShowModal} />
        )}
        {activeTab === 'joining' && (
          <JoiningRequestsTab joiningRequests={joiningRequests} onRefresh={fetchData} />
        )}
        {activeTab === 'employees' && (
          <EmployeesTab employees={employees} />
        )}
      </div>

      {showModal && <CreateCandidateModal onClose={() => setShowModal(false)} onSuccess={fetchData} />}
    </div>
  );
};

const CandidatesTab = ({ candidates, onRefresh, setShowModal }) => {
  const handleSendOffer = async (id) => {
    if (window.confirm('Send offer letter to this candidate?')) {
      try {
        await adminAPI.sendOffer(id);
        alert('Offer letter sent successfully!');
        onRefresh();
      } catch (error) {
        alert(error.response?.data?.message || 'Error sending offer');
      }
    }
  };

  const handleSendJoiningDetails = async (id) => {
    if (window.confirm('Send joining details and credentials to this candidate?')) {
      try {
        await adminAPI.sendJoiningDetails(id);
        alert('Joining details sent successfully!');
        onRefresh();
      } catch (error) {
        alert(error.response?.data?.message || 'Error sending joining details');
      }
    }
  };

  return (
    <>
      <button onClick={() => setShowModal(true)} className="btn btn-primary" style={{ marginBottom: '16px' }}>
        Add Candidate
      </button>
      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Practice</th>
            <th>Position</th>
            <th>Offer Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {candidates.map((candidate) => (
            <tr key={candidate._id}>
              <td>{candidate.fullName}</td>
              <td>{candidate.email}</td>
              <td>{candidate.practice}</td>
              <td>{candidate.position}</td>
              <td>
                {candidate.offerAccepted ? (
                  <span className="badge badge-success">Accepted</span>
                ) : candidate.offerSent ? (
                  <span className="badge badge-warning">Sent</span>
                ) : (
                  <span className="badge badge-info">Not Sent</span>
                )}
              </td>
              <td>
                {!candidate.offerSent && (
                  <button onClick={() => handleSendOffer(candidate._id)} className="btn btn-secondary" style={{ marginRight: '8px', fontSize: '12px', padding: '6px 12px' }}>
                    Send Offer
                  </button>
                )}
                {candidate.offerAccepted && !candidate.joiningDetailsSent && (
                  <button onClick={() => handleSendJoiningDetails(candidate._id)} className="btn btn-primary" style={{ fontSize: '12px', padding: '6px 12px' }}>
                    Send Joining Details
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};

const JoiningRequestsTab = ({ joiningRequests, onRefresh }) => {
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);

  const handleReview = (request) => {
    setSelectedRequest(request);
    setShowReviewModal(true);
  };

  return (
    <>
      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Practice</th>
            <th>Status</th>
            <th>Submitted</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {joiningRequests.map((request) => (
            <tr key={request._id}>
              <td>{request.fullName}</td>
              <td>{request.email}</td>
              <td>{request.practice}</td>
              <td>
                {request.status === 'submitted' && <span className="badge badge-warning">Pending Review</span>}
                {request.status === 'approved' && <span className="badge badge-success">Approved</span>}
                {request.status === 'rejected' && <span className="badge badge-danger">Rejected</span>}
                {request.status === 'pending' && <span className="badge badge-info">Not Submitted</span>}
              </td>
              <td>{request.submittedAt ? new Date(request.submittedAt).toLocaleDateString() : '-'}</td>
              <td>
                {request.status === 'submitted' && (
                  <button onClick={() => handleReview(request)} className="btn btn-secondary" style={{ fontSize: '12px', padding: '6px 12px' }}>
                    Review
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {showReviewModal && (
        <ReviewModal request={selectedRequest} onClose={() => setShowReviewModal(false)} onSuccess={onRefresh} />
      )}
    </>
  );
};

const EmployeesTab = ({ employees }) => {
  return (
    <table className="table">
      <thead>
        <tr>
          <th>Employee ID</th>
          <th>Name</th>
          <th>Email</th>
          <th>Practice</th>
          <th>Position</th>
          <th>Joining Date</th>
        </tr>
      </thead>
      <tbody>
        {employees.map((employee) => (
          <tr key={employee._id}>
            <td>{employee.employeeId}</td>
            <td>{employee.fullName}</td>
            <td>{employee.email}</td>
            <td>{employee.practice}</td>
            <td>{employee.position}</td>
            <td>{new Date(employee.joiningDate).toLocaleDateString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const CreateCandidateModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    practice: '',
    position: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await adminAPI.createCandidate(formData);
      alert('Candidate created successfully!');
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating candidate');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Add New Candidate</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name *</label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Phone *</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Practice/Department *</label>
            <input
              type="text"
              value={formData.practice}
              onChange={(e) => setFormData({ ...formData, practice: e.target.value })}
              required
              placeholder="e.g., Engineering, HR, Sales"
            />
          </div>
          <div className="form-group">
            <label>Position *</label>
            <input
              type="text"
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              required
              placeholder="e.g., Software Engineer, HR Manager"
            />
          </div>
          {error && <div className="error">{error}</div>}
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn" style={{ background: '#ccc' }}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Candidate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ReviewModal = ({ request, onClose, onSuccess }) => {
  const [status, setStatus] = useState('approved');
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await adminAPI.reviewJoiningRequest(request._id, { status, remarks });
      alert(`Joining request ${status} successfully!`);
      onSuccess();
      onClose();
    } catch (error) {
      alert(error.response?.data?.message || 'Error reviewing request');
    } finally {
      setLoading(false);
    }
  };

  const viewDocument = (filename) => {
    window.open(`http://localhost:5000/uploads/${filename}`, '_blank');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px' }}>
        <h2>Review Joining Request</h2>
        
        {/* Basic Information */}
        <div style={{ marginBottom: '20px', background: '#f5f5f5', padding: '15px', borderRadius: '4px' }}>
          <h3 style={{ marginTop: 0, fontSize: '18px' }}>Basic Information</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <p><strong>Name:</strong> {request.fullName}</p>
            <p><strong>Email:</strong> {request.email}</p>
            <p><strong>Phone:</strong> {request.phone}</p>
            <p><strong>Practice:</strong> {request.practice}</p>
            <p><strong>Position:</strong> {request.position}</p>
            <p><strong>Date of Birth:</strong> {request.dateOfBirth ? new Date(request.dateOfBirth).toLocaleDateString() : '-'}</p>
          </div>
        </div>

        {/* Address Information */}
        {request.address && (
          <div style={{ marginBottom: '20px', background: '#f5f5f5', padding: '15px', borderRadius: '4px' }}>
            <h3 style={{ marginTop: 0, fontSize: '18px' }}>Address Information</h3>
            <p><strong>Address:</strong> {request.address}</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              <p><strong>City:</strong> {request.city}</p>
              <p><strong>State:</strong> {request.state}</p>
              <p><strong>Pincode:</strong> {request.pincode}</p>
            </div>
          </div>
        )}

        {/* Emergency Contact */}
        {request.emergencyContactName && (
          <div style={{ marginBottom: '20px', background: '#f5f5f5', padding: '15px', borderRadius: '4px' }}>
            <h3 style={{ marginTop: 0, fontSize: '18px' }}>Emergency Contact</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              <p><strong>Name:</strong> {request.emergencyContactName}</p>
              <p><strong>Phone:</strong> {request.emergencyContactPhone}</p>
              <p><strong>Relation:</strong> {request.emergencyContactRelation}</p>
            </div>
          </div>
        )}

        {/* Bank Details */}
        {request.bankAccountNumber && (
          <div style={{ marginBottom: '20px', background: '#f5f5f5', padding: '15px', borderRadius: '4px' }}>
            <h3 style={{ marginTop: 0, fontSize: '18px' }}>Bank Details</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <p><strong>Account Number:</strong> {request.bankAccountNumber}</p>
              <p><strong>Bank Name:</strong> {request.bankName}</p>
              <p><strong>IFSC Code:</strong> {request.bankIFSC}</p>
            </div>
          </div>
        )}

        {/* Profile */}
        {request.profilePhoto && (
          <div style={{ marginBottom: '20px', background: '#f5f5f5', padding: '15px', borderRadius: '4px' }}>
            <h3 style={{ marginTop: 0, fontSize: '18px' }}>Profile</h3>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
              <img 
                src={`http://localhost:5000/uploads/${request.profilePhoto}`} 
                alt="Profile" 
                style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #4CAF50' }}
              />
              <div style={{ flex: 1 }}>
                <p><strong>Self Description:</strong></p>
                <p style={{ background: 'white', padding: '10px', borderRadius: '4px' }}>{request.selfDescription}</p>
              </div>
            </div>
          </div>
        )}

        {/* Uploaded Documents */}
        <div style={{ marginBottom: '20px', background: '#e3f2fd', padding: '15px', borderRadius: '4px' }}>
          <h3 style={{ marginTop: 0, fontSize: '18px', color: '#1976d2' }}>Uploaded Documents</h3>
          
          {request.educationalCertificates && request.educationalCertificates.length > 0 && (
            <div style={{ marginBottom: '12px' }}>
              <p><strong>Educational Certificates:</strong></p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {request.educationalCertificates.map((cert, index) => (
                  <button 
                    key={index}
                    onClick={() => viewDocument(cert)}
                    className="btn btn-secondary"
                    style={{ fontSize: '12px', padding: '6px 12px' }}
                  >
                    📄 Certificate {index + 1}
                  </button>
                ))}
              </div>
            </div>
          )}

          {request.idProof && (
            <div style={{ marginBottom: '12px' }}>
              <p><strong>ID Proof:</strong></p>
              <button 
                onClick={() => viewDocument(request.idProof)}
                className="btn btn-secondary"
                style={{ fontSize: '12px', padding: '6px 12px' }}
              >
                📄 View ID Proof
              </button>
            </div>
          )}

          {request.addressProof && (
            <div style={{ marginBottom: '12px' }}>
              <p><strong>Address Proof:</strong></p>
              <button 
                onClick={() => viewDocument(request.addressProof)}
                className="btn btn-secondary"
                style={{ fontSize: '12px', padding: '6px 12px' }}
              >
                📄 View Address Proof
              </button>
            </div>
          )}
        </div>

        {/* Review Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Decision *</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} required>
              <option value="approved">Approve</option>
              <option value="rejected">Reject</option>
            </select>
          </div>
          <div className="form-group">
            <label>Remarks</label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Add any comments or feedback..."
            />
          </div>
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn" style={{ background: '#ccc' }}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminDashboard;
