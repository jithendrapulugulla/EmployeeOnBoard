import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import * as XLSX from 'xlsx';
import SendOfferModal from '../../components/SendOfferModal';
import SendJoiningDetailsModal from '../../components/SendJoiningDetailsModal';

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
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [showJoiningModal, setShowJoiningModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [searchName, setSearchName] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const handleSendOffer = (candidate) => {
    setSelectedCandidate(candidate);
    setShowOfferModal(true);
  };

  const handleSendJoiningDetails = (candidate) => {
    setSelectedCandidate(candidate);
    setShowJoiningModal(true);
  };

  // Filter candidates
  const filteredCandidates = candidates.filter(candidate => {
    const nameMatch = candidate.fullName.toLowerCase().includes(searchName.toLowerCase());
    
    let statusMatch = true;
    if (filterStatus !== 'all') {
      if (filterStatus === 'accepted') {
        statusMatch = candidate.offerAccepted;
      } else if (filterStatus === 'sent') {
        statusMatch = candidate.offerSent && !candidate.offerAccepted;
      } else if (filterStatus === 'not-sent') {
        statusMatch = !candidate.offerSent;
      }
    }
    
    return nameMatch && statusMatch;
  });

  return (
    <>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <button onClick={() => setShowModal(true)} className="btn btn-primary">
          Add Candidate
        </button>
        <button onClick={() => setShowBulkModal(true)} className="btn btn-primary" style={{ background: '#124B84' }}>
          📊 Bulk Upload (Excel)
        </button>
      </div>

      {/* Filter Section */}
      <div style={{ background: '#f8f9fa', padding: '16px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #e0e0e0' }}>
        <h4 style={{ marginTop: 0, marginBottom: '12px', fontSize: '14px', fontWeight: '600', color: '#333' }}>🔍 Filters</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '12px', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ fontSize: '12px', fontWeight: '600', marginBottom: '6px', color: '#333' }}>Search by Name</label>
            <input 
              type="text" 
              placeholder="Type candidate name..." 
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              style={{ padding: '10px', border: '1px solid #e0e0e0', borderRadius: '6px', fontSize: '14px' }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ fontSize: '12px', fontWeight: '600', marginBottom: '6px', color: '#333' }}>Offer Status</label>
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{ padding: '10px', border: '1px solid #e0e0e0', borderRadius: '6px', fontSize: '14px', background: 'white' }}
            >
              <option value="all">All Status</option>
              <option value="not-sent">Not Sent</option>
              <option value="sent">Sent</option>
              <option value="accepted">Accepted</option>
            </select>
          </div>
          <button 
            onClick={() => { setSearchName(''); setFilterStatus('all'); }}
            style={{ padding: '10px 16px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}
          >
            Clear Filters
          </button>
        </div>
        <p style={{ margin: '12px 0 0 0', fontSize: '12px', color: '#666' }}>Showing {filteredCandidates.length} of {candidates.length} candidates</p>
      </div>

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
          {filteredCandidates.length > 0 ? (
            filteredCandidates.map((candidate) => (
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
                    <button onClick={() => handleSendOffer(candidate)} className="btn btn-secondary" style={{ marginRight: '8px', fontSize: '12px', padding: '6px 12px' }}>
                      Send Offer
                    </button>
                  )}
                  {candidate.offerAccepted && !candidate.joiningDetailsSent && (
                    <button onClick={() => handleSendJoiningDetails(candidate)} className="btn btn-primary" style={{ fontSize: '12px', padding: '6px 12px' }}>
                      Send Joining Details
                    </button>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                No candidates found matching your filters
              </td>
            </tr>
          )}
        </tbody>
      </table>
      {showBulkModal && (
        <BulkUploadModal onClose={() => setShowBulkModal(false)} onSuccess={onRefresh} />
      )}
      {showOfferModal && selectedCandidate && (
        <SendOfferModal candidate={selectedCandidate} onClose={() => setShowOfferModal(false)} onSuccess={() => { onRefresh(); setShowOfferModal(false); }} />
      )}
      {showJoiningModal && selectedCandidate && (
        <SendJoiningDetailsModal candidate={selectedCandidate} onClose={() => setShowJoiningModal(false)} onSuccess={() => { onRefresh(); setShowJoiningModal(false); }} />
      )}
    </>
  );
};

const JoiningRequestsTab = ({ joiningRequests, onRefresh }) => {
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [searchName, setSearchName] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const handleReview = (request) => {
    setSelectedRequest(request);
    setShowReviewModal(true);
  };

  // Filter joining requests
  const filteredRequests = joiningRequests.filter(request => {
    const nameMatch = request.fullName.toLowerCase().includes(searchName.toLowerCase());
    
    let statusMatch = true;
    if (filterStatus !== 'all') {
      statusMatch = request.status === filterStatus;
    }
    
    return nameMatch && statusMatch;
  });

  return (
    <>
      {/* Filter Section */}
      <div style={{ background: '#f8f9fa', padding: '16px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #e0e0e0' }}>
        <h4 style={{ marginTop: 0, marginBottom: '12px', fontSize: '14px', fontWeight: '600', color: '#333' }}>🔍 Filters</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '12px', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ fontSize: '12px', fontWeight: '600', marginBottom: '6px', color: '#333' }}>Search by Name</label>
            <input 
              type="text" 
              placeholder="Type employee name..." 
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              style={{ padding: '10px', border: '1px solid #e0e0e0', borderRadius: '6px', fontSize: '14px' }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ fontSize: '12px', fontWeight: '600', marginBottom: '6px', color: '#333' }}>Status</label>
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{ padding: '10px', border: '1px solid #e0e0e0', borderRadius: '6px', fontSize: '14px', background: 'white' }}
            >
              <option value="all">All Status</option>
              <option value="pending">Not Submitted</option>
              <option value="submitted">Pending Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <button 
            onClick={() => { setSearchName(''); setFilterStatus('all'); }}
            style={{ padding: '10px 16px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}
          >
            Clear Filters
          </button>
        </div>
        <p style={{ margin: '12px 0 0 0', fontSize: '12px', color: '#666' }}>Showing {filteredRequests.length} of {joiningRequests.length} requests</p>
      </div>

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
          {filteredRequests.length > 0 ? (
            filteredRequests.map((request) => (
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
            ))
          ) : (
            <tr>
              <td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                No requests found matching your filters
              </td>
            </tr>
          )}
        </tbody>
      </table>
      {showReviewModal && (
        <ReviewModal request={selectedRequest} onClose={() => setShowReviewModal(false)} onSuccess={onRefresh} />
      )}
    </>
  );
};

const EmployeesTab = ({ employees }) => {
  const [searchName, setSearchName] = useState('');

  // Filter employees
  const filteredEmployees = employees.filter(employee => {
    return employee.fullName.toLowerCase().includes(searchName.toLowerCase());
  });

  return (
    <>
      {/* Filter Section */}
      <div style={{ background: '#f8f9fa', padding: '16px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #e0e0e0' }}>
        <h4 style={{ marginTop: 0, marginBottom: '12px', fontSize: '14px', fontWeight: '600', color: '#333' }}>🔍 Filters</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '12px', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ fontSize: '12px', fontWeight: '600', marginBottom: '6px', color: '#333' }}>Search by Name</label>
            <input 
              type="text" 
              placeholder="Type employee name..." 
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              style={{ padding: '10px', border: '1px solid #e0e0e0', borderRadius: '6px', fontSize: '14px' }}
            />
          </div>
          <button 
            onClick={() => setSearchName('')}
            style={{ padding: '10px 16px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}
          >
            Clear Filter
          </button>
        </div>
        <p style={{ margin: '12px 0 0 0', fontSize: '12px', color: '#666' }}>Showing {filteredEmployees.length} of {employees.length} employees</p>
      </div>

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
          {filteredEmployees.length > 0 ? (
            filteredEmployees.map((employee) => (
              <tr key={employee._id}>
                <td>{employee.employeeId}</td>
                <td>{employee.fullName}</td>
                <td>{employee.email}</td>
                <td>{employee.practice}</td>
                <td>{employee.position}</td>
                <td>{new Date(employee.joiningDate).toLocaleDateString()}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                No employees found matching your search
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </>
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
  const [isEditMode, setIsEditMode] = useState(false);
  const [editData, setEditData] = useState({
    dateOfBirth: request.dateOfBirth ? request.dateOfBirth.split('T')[0] : '',
    address: request.address || '',
    city: request.city || '',
    state: request.state || '',
    pincode: request.pincode || '',
    emergencyContactName: request.emergencyContactName || '',
    emergencyContactPhone: request.emergencyContactPhone || '',
    emergencyContactRelation: request.emergencyContactRelation || '',
    selfDescription: request.selfDescription || '',
    bankAccountNumber: request.bankAccountNumber || '',
    bankName: request.bankName || '',
    bankIFSC: request.bankIFSC || '',
    tenthGrade: request.tenthGrade || '',
    interGrade: request.interGrade || '',
    btechGrade: request.btechGrade || '',
    experience: request.experience || [],
    uan: request.bankDetails?.uan || '',
  });
  const [editFiles, setEditFiles] = useState({
    tenthDocument: null,
    interDocument: null,
    btechDocument: null,
    idProof: null,
    addressProof: null,
  });
  const [editLoading, setEditLoading] = useState(false);

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData({ ...editData, [name]: value });
  };

  const handleEditFileChange = (e) => {
    const { name, files } = e.target;
    setEditFiles({ ...editFiles, [name]: files[0] });
  };

  const handleSaveEdits = async () => {
    setEditLoading(true);
    try {
      // Create FormData for file uploads
      const formData = new FormData();
      
      // Add text fields
      Object.keys(editData).forEach(key => {
        formData.append(key, editData[key]);
      });

      // Add files
      Object.keys(editFiles).forEach(key => {
        if (editFiles[key]) {
          formData.append(key, editFiles[key]);
        }
      });

      await adminAPI.editJoiningDetails(request._id, formData);
      alert('Details updated successfully!');
      setIsEditMode(false);
      onSuccess();
    } catch (error) {
      alert(error.response?.data?.message || 'Error updating details');
    } finally {
      setEditLoading(false);
    }
  };

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
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '900px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>{isEditMode ? 'Edit Joining Details' : 'Review Joining Request'}</h2>
          {!isEditMode && (
            <button 
              onClick={() => setIsEditMode(true)}
              style={{ background: '#2196F3', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}
            >
              ✏️ Edit Details
            </button>
          )}
        </div>

        {isEditMode ? (
          // Edit Mode
          <>
            {/* Edit Personal Information */}
            <div style={{ marginBottom: '24px', background: '#f8f9fa', padding: '20px', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
              <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '18px', fontWeight: '600', color: '#124B84', borderBottom: '2px solid #124B84', paddingBottom: '10px' }}>👤 Edit Personal Information</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <label style={{ fontSize: '12px', fontWeight: '600', marginBottom: '4px', color: '#333' }}>Date of Birth</label>
                  <input 
                    type="date" 
                    name="dateOfBirth" 
                    value={editData.dateOfBirth}
                    onChange={handleEditChange}
                    style={{ padding: '8px', border: '1px solid #e0e0e0', borderRadius: '4px', fontSize: '14px' }}
                  />
                </div>
              </div>
            </div>

            {/* Edit Address Information */}
            <div style={{ marginBottom: '24px', background: '#f8f9fa', padding: '20px', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
              <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '18px', fontWeight: '600', color: '#124B84', borderBottom: '2px solid #124B84', paddingBottom: '10px' }}>📍 Edit Address Information</h3>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '12px', fontWeight: '600', marginBottom: '4px', display: 'block', color: '#333' }}>Full Address</label>
                <textarea 
                  name="address" 
                  value={editData.address}
                  onChange={handleEditChange}
                  style={{ padding: '8px', border: '1px solid #e0e0e0', borderRadius: '4px', fontSize: '14px', width: '100%', minHeight: '60px' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <label style={{ fontSize: '12px', fontWeight: '600', marginBottom: '4px', color: '#333' }}>City</label>
                  <input 
                    type="text" 
                    name="city" 
                    value={editData.city}
                    onChange={handleEditChange}
                    style={{ padding: '8px', border: '1px solid #e0e0e0', borderRadius: '4px', fontSize: '14px' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <label style={{ fontSize: '12px', fontWeight: '600', marginBottom: '4px', color: '#333' }}>State</label>
                  <input 
                    type="text" 
                    name="state" 
                    value={editData.state}
                    onChange={handleEditChange}
                    style={{ padding: '8px', border: '1px solid #e0e0e0', borderRadius: '4px', fontSize: '14px' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <label style={{ fontSize: '12px', fontWeight: '600', marginBottom: '4px', color: '#333' }}>Pincode</label>
                  <input 
                    type="text" 
                    name="pincode" 
                    value={editData.pincode}
                    onChange={handleEditChange}
                    style={{ padding: '8px', border: '1px solid #e0e0e0', borderRadius: '4px', fontSize: '14px' }}
                  />
                </div>
              </div>
            </div>

            {/* Edit Emergency Contact */}
            <div style={{ marginBottom: '24px', background: '#f8f9fa', padding: '20px', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
              <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '18px', fontWeight: '600', color: '#124B84', borderBottom: '2px solid #124B84', paddingBottom: '10px' }}>🆘 Edit Emergency Contact</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <label style={{ fontSize: '12px', fontWeight: '600', marginBottom: '4px', color: '#333' }}>Name</label>
                  <input 
                    type="text" 
                    name="emergencyContactName" 
                    value={editData.emergencyContactName}
                    onChange={handleEditChange}
                    style={{ padding: '8px', border: '1px solid #e0e0e0', borderRadius: '4px', fontSize: '14px' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <label style={{ fontSize: '12px', fontWeight: '600', marginBottom: '4px', color: '#333' }}>Phone</label>
                  <input 
                    type="tel" 
                    name="emergencyContactPhone" 
                    value={editData.emergencyContactPhone}
                    onChange={handleEditChange}
                    style={{ padding: '8px', border: '1px solid #e0e0e0', borderRadius: '4px', fontSize: '14px' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <label style={{ fontSize: '12px', fontWeight: '600', marginBottom: '4px', color: '#333' }}>Relation</label>
                  <input 
                    type="text" 
                    name="emergencyContactRelation" 
                    value={editData.emergencyContactRelation}
                    onChange={handleEditChange}
                    style={{ padding: '8px', border: '1px solid #e0e0e0', borderRadius: '4px', fontSize: '14px' }}
                  />
                </div>
              </div>
            </div>

            {/* Edit Bank Details */}
            <div style={{ marginBottom: '24px', background: '#f8f9fa', padding: '20px', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
              <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '18px', fontWeight: '600', color: '#124B84', borderBottom: '2px solid #124B84', paddingBottom: '10px' }}>🏦 Edit Bank Details</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <label style={{ fontSize: '12px', fontWeight: '600', marginBottom: '4px', color: '#333' }}>Account Number</label>
                  <input 
                    type="text" 
                    name="bankAccountNumber" 
                    value={editData.bankAccountNumber}
                    onChange={handleEditChange}
                    style={{ padding: '8px', border: '1px solid #e0e0e0', borderRadius: '4px', fontSize: '14px' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <label style={{ fontSize: '12px', fontWeight: '600', marginBottom: '4px', color: '#333' }}>Bank Name</label>
                  <input 
                    type="text" 
                    name="bankName" 
                    value={editData.bankName}
                    onChange={handleEditChange}
                    style={{ padding: '8px', border: '1px solid #e0e0e0', borderRadius: '4px', fontSize: '14px' }}
                  />
                </div>
              </div>
              <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column' }}>
                <label style={{ fontSize: '12px', fontWeight: '600', marginBottom: '4px', color: '#333' }}>IFSC Code</label>
                <input 
                  type="text" 
                  name="bankIFSC" 
                  value={editData.bankIFSC}
                  onChange={handleEditChange}
                  style={{ padding: '8px', border: '1px solid #e0e0e0', borderRadius: '4px', fontSize: '14px', maxWidth: '50%' }}
                />
              </div>
            </div>

            {/* Edit Education Details */}
            <div style={{ marginBottom: '24px', background: '#fff8f0', padding: '20px', borderRadius: '8px', border: '2px solid #ff9800' }}>
              <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '18px', fontWeight: '600', color: '#ff6f00', borderBottom: '2px solid #ff9800', paddingBottom: '10px' }}>📚 Edit Education Details</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <label style={{ fontSize: '12px', fontWeight: '600', marginBottom: '4px', color: '#333' }}>10th Grade/Marks</label>
                  <input 
                    type="text" 
                    name="tenthGrade" 
                    value={editData.tenthGrade}
                    onChange={handleEditChange}
                    style={{ padding: '8px', border: '1px solid #e0e0e0', borderRadius: '4px', fontSize: '14px' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <label style={{ fontSize: '12px', fontWeight: '600', marginBottom: '4px', color: '#333' }}>10th Certificate (Optional)</label>
                  <input 
                    type="file" 
                    name="tenthDocument" 
                    onChange={handleEditFileChange}
                    accept=".pdf,.jpg,.jpeg,.png"
                    style={{ padding: '6px', border: '1px solid #e0e0e0', borderRadius: '4px', fontSize: '12px' }}
                  />
                  {request.tenthDocument && <small style={{ color: '#666', marginTop: '4px' }}>Current: {request.tenthDocument}</small>}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <label style={{ fontSize: '12px', fontWeight: '600', marginBottom: '4px', color: '#333' }}>Intermediate/12th Grade/Marks</label>
                  <input 
                    type="text" 
                    name="interGrade" 
                    value={editData.interGrade}
                    onChange={handleEditChange}
                    style={{ padding: '8px', border: '1px solid #e0e0e0', borderRadius: '4px', fontSize: '14px' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <label style={{ fontSize: '12px', fontWeight: '600', marginBottom: '4px', color: '#333' }}>Intermediate Certificate (Optional)</label>
                  <input 
                    type="file" 
                    name="interDocument" 
                    onChange={handleEditFileChange}
                    accept=".pdf,.jpg,.jpeg,.png"
                    style={{ padding: '6px', border: '1px solid #e0e0e0', borderRadius: '4px', fontSize: '12px' }}
                  />
                  {request.interDocument && <small style={{ color: '#666', marginTop: '4px' }}>Current: {request.interDocument}</small>}
                </div>
              </div>

              <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column' }}>
                <label style={{ fontSize: '12px', fontWeight: '600', marginBottom: '4px', color: '#333' }}>B.Tech/Degree CGPA</label>
                <input 
                  type="text" 
                  name="btechGrade" 
                  value={editData.btechGrade}
                  onChange={handleEditChange}
                  style={{ padding: '8px', border: '1px solid #e0e0e0', borderRadius: '4px', fontSize: '14px', maxWidth: '50%' }}
                />
              </div>

              <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <label style={{ fontSize: '12px', fontWeight: '600', marginBottom: '4px', color: '#333' }}>B.Tech/Degree Certificate (Optional)</label>
                  <input 
                    type="file" 
                    name="btechDocument" 
                    onChange={handleEditFileChange}
                    accept=".pdf,.jpg,.jpeg,.png"
                    style={{ padding: '6px', border: '1px solid #e0e0e0', borderRadius: '4px', fontSize: '12px' }}
                  />
                  {request.btechDocument && <small style={{ color: '#666', marginTop: '4px' }}>Current: {request.btechDocument}</small>}
                </div>
              </div>

              <div style={{ marginTop: '16px' }}>
                <label style={{ fontSize: '12px', fontWeight: '600', marginBottom: '4px', display: 'block', color: '#333' }}>Self Description</label>
                <textarea 
                  name="selfDescription" 
                  value={editData.selfDescription}
                  onChange={handleEditChange}
                  style={{ padding: '8px', border: '1px solid #e0e0e0', borderRadius: '4px', fontSize: '14px', width: '100%', minHeight: '80px' }}
                />
              </div>
            </div>

            {/* Edit Experience */}
            <div style={{ marginBottom: '24px', background: '#f0f7ff', padding: '20px', borderRadius: '8px', border: '2px solid #2196F3' }}>
              <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '18px', fontWeight: '600', color: '#1565c0', borderBottom: '2px solid #2196F3', paddingBottom: '10px' }}>💼 Edit Professional Experience</h3>
              
              {editData.experience && Array.isArray(editData.experience) && editData.experience.length > 0 ? (
                <>
                  {editData.experience.map((exp, idx) => (
                    <div key={idx} style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #bbdefb', background: '#ffffff', padding: '12px', borderRadius: '4px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <label style={{ fontSize: '12px', fontWeight: '600', marginBottom: '4px', color: '#333' }}>Company Name</label>
                          <input 
                            type="text"
                            value={exp.companyName || ''}
                            disabled
                            style={{ padding: '8px', border: '1px solid #e0e0e0', borderRadius: '4px', fontSize: '14px', background: '#f5f5f5' }}
                          />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <label style={{ fontSize: '12px', fontWeight: '600', marginBottom: '4px', color: '#333' }}>Years in Company</label>
                          <input 
                            type="number"
                            value={exp.years || ''}
                            disabled
                            min="0"
                            step="0.1"
                            style={{ padding: '8px', border: '1px solid #e0e0e0', borderRadius: '4px', fontSize: '14px', background: '#f5f5f5' }}
                          />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <label style={{ fontSize: '12px', fontWeight: '600', marginBottom: '4px', color: '#333' }}>Certificate</label>
                          <input 
                            type="text"
                            value={exp.certificate || 'Not uploaded'}
                            disabled
                            style={{ padding: '8px', border: '1px solid #e0e0e0', borderRadius: '4px', fontSize: '12px', background: '#f5f5f5' }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {editData.experience.some(e => e.companyName && e.years) && (
                    <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #bbdefb' }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <label style={{ fontSize: '12px', fontWeight: '600', marginBottom: '4px', color: '#333' }}>UAN (EPFO) Number</label>
                        <input 
                          type="text" 
                          name="uan" 
                          value={editData.uan}
                          onChange={handleEditChange}
                          style={{ padding: '8px', border: '1px solid #e0e0e0', borderRadius: '4px', fontSize: '14px' }}
                          placeholder="12-digit UAN"
                          pattern="[0-9]{12}"
                          maxLength="12"
                        />
                        <small style={{ color: '#666', marginTop: '4px' }}>From EPFO records</small>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <p style={{ color: '#0d47a1', fontStyle: 'italic', margin: 0, fontSize: '14px' }}>ℹ️ No prior work experience</p>
              )}
            </div>

            {/* Edit Documents */}
            <div style={{ marginBottom: '24px', background: '#e8f5ff', padding: '20px', borderRadius: '8px', border: '2px solid #03a9f4' }}>
              <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '18px', fontWeight: '600', color: '#01579b', borderBottom: '2px solid #03a9f4', paddingBottom: '10px' }}>📄 Edit Documents</h3>
              
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '12px', fontWeight: '600', marginBottom: '4px', display: 'block', color: '#333' }}>ID Proof (Optional)</label>
                <input 
                  type="file" 
                  name="idProof" 
                  onChange={handleEditFileChange}
                  accept=".pdf,.jpg,.jpeg,.png"
                  style={{ padding: '6px', border: '1px solid #e0e0e0', borderRadius: '4px', fontSize: '12px', width: '100%' }}
                />
                {request.idProof && <small style={{ color: '#666', marginTop: '4px', display: 'block' }}>Current: {request.idProof}</small>}
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', marginBottom: '4px', display: 'block', color: '#333' }}>Address Proof (Optional)</label>
                <input 
                  type="file" 
                  name="addressProof" 
                  onChange={handleEditFileChange}
                  accept=".pdf,.jpg,.jpeg,.png"
                  style={{ padding: '6px', border: '1px solid #e0e0e0', borderRadius: '4px', fontSize: '12px', width: '100%' }}
                />
                {request.addressProof && <small style={{ color: '#666', marginTop: '4px', display: 'block' }}>Current: {request.addressProof}</small>}
              </div>
            </div>

            {/* Save/Cancel Buttons */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
              <button 
                type="button" 
                onClick={() => setIsEditMode(false)}
                style={{ background: '#ccc', padding: '10px 20px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={handleSaveEdits}
                disabled={editLoading}
                style={{ background: '#4CAF50', color: 'white', padding: '10px 24px', border: 'none', borderRadius: '6px', cursor: editLoading ? 'not-allowed' : 'pointer', fontSize: '14px', fontWeight: '600', opacity: editLoading ? 0.6 : 1 }}
              >
                {editLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </>
        ) : (
          <>
        {/* SECTION 1: Profile */}
        {request.profilePhoto && (
          <div style={{ marginBottom: '24px', background: '#f8f9fa', padding: '20px', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
            <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '18px', fontWeight: '600', color: '#124B84', borderBottom: '2px solid #124B84', paddingBottom: '10px' }}>🎯 Profile</h3>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
              <div style={{ flex: '0 0 auto' }}>
                <img 
                  src={`http://localhost:5000/uploads/${request.profilePhoto}`} 
                  alt="Profile" 
                  style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #4CAF50', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#666', fontWeight: '500' }}>Self Description</p>
                <p style={{ background: 'white', padding: '12px', borderRadius: '6px', border: '1px solid #e0e0e0', margin: 0, fontSize: '14px', color: '#333', lineHeight: '1.5' }}>{request.selfDescription}</p>
              </div>
            </div>
          </div>
        )}

        {/* Basic Information */}
        <div style={{ marginBottom: '24px', background: '#f8f9fa', padding: '20px', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
          <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '18px', fontWeight: '600', color: '#124B84', borderBottom: '2px solid #124B84', paddingBottom: '10px' }}>👤 Basic Information</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 20px' }}>
            <div style={{ padding: '8px 0', borderBottom: '1px solid #e8e8e8' }}>
              <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#666', fontWeight: '500' }}>Name</p>
              <p style={{ margin: 0, fontSize: '15px', color: '#333', fontWeight: '600' }}>{request.fullName}</p>
            </div>
            <div style={{ padding: '8px 0', borderBottom: '1px solid #e8e8e8' }}>
              <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#666', fontWeight: '500' }}>Email</p>
              <p style={{ margin: 0, fontSize: '15px', color: '#333', fontWeight: '600' }}>{request.email}</p>
            </div>
            <div style={{ padding: '8px 0', borderBottom: '1px solid #e8e8e8' }}>
              <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#666', fontWeight: '500' }}>Phone</p>
              <p style={{ margin: 0, fontSize: '15px', color: '#333', fontWeight: '600' }}>{request.phone}</p>
            </div>
            <div style={{ padding: '8px 0', borderBottom: '1px solid #e8e8e8' }}>
              <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#666', fontWeight: '500' }}>Practice/Department</p>
              <p style={{ margin: 0, fontSize: '15px', color: '#333', fontWeight: '600' }}>{request.practice}</p>
            </div>
            <div style={{ padding: '8px 0', borderBottom: '1px solid #e8e8e8' }}>
              <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#666', fontWeight: '500' }}>Position</p>
              <p style={{ margin: 0, fontSize: '15px', color: '#333', fontWeight: '600' }}>{request.position}</p>
            </div>
            <div style={{ padding: '8px 0', borderBottom: '1px solid #e8e8e8' }}>
              <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#666', fontWeight: '500' }}>Date of Birth</p>
              <p style={{ margin: 0, fontSize: '15px', color: '#333', fontWeight: '600' }}>{request.dateOfBirth ? new Date(request.dateOfBirth).toLocaleDateString() : '-'}</p>
            </div>
          </div>
        </div>

        {/* SECTION 2: Address */}
        {/* Present Address */}
        {request.presentAddress && (
          <div style={{ marginBottom: '24px', background: '#f8f9fa', padding: '20px', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
            <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '18px', fontWeight: '600', color: '#124B84', borderBottom: '2px solid #124B84', paddingBottom: '10px' }}>📍 Present Address</h3>
            <div style={{ marginBottom: '16px', padding: '8px 0', borderBottom: '1px solid #e8e8e8' }}>
              <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#666', fontWeight: '500' }}>Full Address</p>
              <p style={{ margin: 0, fontSize: '15px', color: '#333' }}>{request.presentAddress}</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px 20px' }}>
              <div style={{ padding: '8px 0', borderBottom: '1px solid #e8e8e8' }}>
                <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#666', fontWeight: '500' }}>City</p>
                <p style={{ margin: 0, fontSize: '15px', color: '#333', fontWeight: '600' }}>{request.presentCity}</p>
              </div>
              <div style={{ padding: '8px 0', borderBottom: '1px solid #e8e8e8' }}>
                <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#666', fontWeight: '500' }}>State</p>
                <p style={{ margin: 0, fontSize: '15px', color: '#333', fontWeight: '600' }}>{request.presentState}</p>
              </div>
              <div style={{ padding: '8px 0', borderBottom: '1px solid #e8e8e8' }}>
                <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#666', fontWeight: '500' }}>Pincode</p>
                <p style={{ margin: 0, fontSize: '15px', color: '#333', fontWeight: '600' }}>{request.presentPincode}</p>
              </div>
            </div>
          </div>
        )}

        {/* Permanent Address */}
        {request.permanentAddress && (
          <div style={{ marginBottom: '24px', background: '#f8f9fa', padding: '20px', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
            <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '18px', fontWeight: '600', color: '#124B84', borderBottom: '2px solid #124B84', paddingBottom: '10px' }}>🏠 Permanent Address</h3>
            <div style={{ marginBottom: '16px', padding: '8px 0', borderBottom: '1px solid #e8e8e8' }}>
              <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#666', fontWeight: '500' }}>Full Address</p>
              <p style={{ margin: 0, fontSize: '15px', color: '#333' }}>{request.permanentAddress}</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px 20px' }}>
              <div style={{ padding: '8px 0', borderBottom: '1px solid #e8e8e8' }}>
                <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#666', fontWeight: '500' }}>City</p>
                <p style={{ margin: 0, fontSize: '15px', color: '#333', fontWeight: '600' }}>{request.permanentCity}</p>
              </div>
              <div style={{ padding: '8px 0', borderBottom: '1px solid #e8e8e8' }}>
                <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#666', fontWeight: '500' }}>State</p>
                <p style={{ margin: 0, fontSize: '15px', color: '#333', fontWeight: '600' }}>{request.permanentState}</p>
              </div>
              <div style={{ padding: '8px 0', borderBottom: '1px solid #e8e8e8' }}>
                <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#666', fontWeight: '500' }}>Pincode</p>
                <p style={{ margin: 0, fontSize: '15px', color: '#333', fontWeight: '600' }}>{request.permanentPincode}</p>
              </div>
            </div>
          </div>
        )}

        {/* Fallback to old address format */}
        {request.address && !request.presentAddress && (
          <div style={{ marginBottom: '24px', background: '#f8f9fa', padding: '20px', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
            <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '18px', fontWeight: '600', color: '#124B84', borderBottom: '2px solid #124B84', paddingBottom: '10px' }}>📍 Address Information</h3>
            <div style={{ marginBottom: '16px', padding: '8px 0', borderBottom: '1px solid #e8e8e8' }}>
              <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#666', fontWeight: '500' }}>Full Address</p>
              <p style={{ margin: 0, fontSize: '15px', color: '#333' }}>{request.address}</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px 20px' }}>
              <div style={{ padding: '8px 0', borderBottom: '1px solid #e8e8e8' }}>
                <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#666', fontWeight: '500' }}>City</p>
                <p style={{ margin: 0, fontSize: '15px', color: '#333', fontWeight: '600' }}>{request.city}</p>
              </div>
              <div style={{ padding: '8px 0', borderBottom: '1px solid #e8e8e8' }}>
                <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#666', fontWeight: '500' }}>State</p>
                <p style={{ margin: 0, fontSize: '15px', color: '#333', fontWeight: '600' }}>{request.state}</p>
              </div>
              <div style={{ padding: '8px 0', borderBottom: '1px solid #e8e8e8' }}>
                <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#666', fontWeight: '500' }}>Pincode</p>
                <p style={{ margin: 0, fontSize: '15px', color: '#333', fontWeight: '600' }}>{request.pincode}</p>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 3: Emergency Contact */}
        {request.emergencyContactName && (
          <div style={{ marginBottom: '24px', background: '#f8f9fa', padding: '20px', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
            <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '18px', fontWeight: '600', color: '#124B84', borderBottom: '2px solid #124B84', paddingBottom: '10px' }}>🆘 Emergency Contact</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px 20px' }}>
              <div style={{ padding: '8px 0', borderBottom: '1px solid #e8e8e8' }}>
                <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#666', fontWeight: '500' }}>Name</p>
                <p style={{ margin: 0, fontSize: '15px', color: '#333', fontWeight: '600' }}>{request.emergencyContactName}</p>
              </div>
              <div style={{ padding: '8px 0', borderBottom: '1px solid #e8e8e8' }}>
                <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#666', fontWeight: '500' }}>Phone</p>
                <p style={{ margin: 0, fontSize: '15px', color: '#333', fontWeight: '600' }}>{request.emergencyContactPhone}</p>
              </div>
              <div style={{ padding: '8px 0', borderBottom: '1px solid #e8e8e8' }}>
                <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#666', fontWeight: '500' }}>Relation</p>
                <p style={{ margin: 0, fontSize: '15px', color: '#333', fontWeight: '600' }}>{request.emergencyContactRelation}</p>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 4: Education Details */}
        <div style={{ marginBottom: '24px', background: '#fff8f0', padding: '20px', borderRadius: '8px', border: '2px solid #ff9800' }}>
          <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '18px', fontWeight: '600', color: '#ff6f00', borderBottom: '2px solid #ff9800', paddingBottom: '10px' }}>📚 Education Details</h3>
          
          {request.tenthGrade && (
            <div style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #ffe0b2' }}>
              <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#e65100', fontWeight: '500' }}>10th Grade/Marks</p>
              <p style={{ margin: '0 0 12px 0', fontSize: '15px', color: '#333', fontWeight: '600' }}>{request.tenthGrade}</p>
              {request.tenthDocument && (
                <button 
                  onClick={() => viewDocument(request.tenthDocument)}
                  className="btn btn-secondary"
                  style={{ fontSize: '12px', padding: '8px 14px', backgroundColor: '#ff9800', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  📄 View 10th Certificate
                </button>
              )}
            </div>
          )}

          {request.interGrade && (
            <div style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #ffe0b2' }}>
              <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#e65100', fontWeight: '500' }}>Intermediate/12th Grade/Marks</p>
              <p style={{ margin: '0 0 12px 0', fontSize: '15px', color: '#333', fontWeight: '600' }}>{request.interGrade}</p>
              {request.interDocument && (
                <button 
                  onClick={() => viewDocument(request.interDocument)}
                  className="btn btn-secondary"
                  style={{ fontSize: '12px', padding: '8px 14px', backgroundColor: '#ff9800', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  📄 View Intermediate Certificate
                </button>
              )}
            </div>
          )}

          {request.btechGrade && (
            <div style={{ marginBottom: '0px' }}>
              <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#e65100', fontWeight: '500' }}>B.Tech/Degree CGPA</p>
              <p style={{ margin: '0 0 12px 0', fontSize: '15px', color: '#333', fontWeight: '600' }}>{request.btechGrade}</p>
              {request.btechDocument && (
                <button 
                  onClick={() => viewDocument(request.btechDocument)}
                  className="btn btn-secondary"
                  style={{ fontSize: '12px', padding: '8px 14px', backgroundColor: '#ff9800', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  📄 View Degree Certificate
                </button>
              )}
            </div>
          )}
        </div>

        {/* Experience Details */}
        <div style={{ marginBottom: '24px', background: '#f0f7ff', padding: '20px', borderRadius: '8px', border: '2px solid #2196F3' }}>
          <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '18px', fontWeight: '600', color: '#1565c0', borderBottom: '2px solid #2196F3', paddingBottom: '10px' }}>💼 Professional Experience</h3>
          
          {request.experience && Array.isArray(request.experience) && request.experience.length > 0 ? (
            <>
              {request.experience.map((exp, idx) => (
                <div key={idx} style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #bbdefb', background: '#ffffff', padding: '12px', borderRadius: '4px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#0d47a1', fontWeight: '500' }}>Company Name</p>
                      <p style={{ margin: 0, fontSize: '15px', color: '#333', fontWeight: '600' }}>{exp.companyName}</p>
                    </div>
                    <div>
                      <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#0d47a1', fontWeight: '500' }}>Years in Company</p>
                      <p style={{ margin: 0, fontSize: '15px', color: '#333', fontWeight: '600' }}>{exp.years} years</p>
                    </div>
                  </div>
                  {exp.certificate && (
                    <div style={{ marginTop: '12px' }}>
                      <button 
                        onClick={() => viewDocument(exp.certificate)}
                        className="btn btn-secondary"
                        style={{ fontSize: '12px', padding: '8px 14px', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        📄 View Experience/Relieving Letter
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </>
          ) : (
            <p style={{ color: '#0d47a1', fontStyle: 'italic', margin: 0, fontSize: '14px' }}>ℹ️ No prior work experience</p>
          )}
        </div>

        {/* SECTION 6: Bank Details */}
        {request.bankDetails && (
          <div style={{ marginBottom: '24px', background: '#f8f9fa', padding: '20px', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
            <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '18px', fontWeight: '600', color: '#124B84', borderBottom: '2px solid #124B84', paddingBottom: '10px' }}>🏦 Bank Details</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 20px' }}>
              {request.bankDetails.accountNumber && (
                <div style={{ padding: '8px 0', borderBottom: '1px solid #e8e8e8' }}>
                  <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#666', fontWeight: '500' }}>Account Number</p>
                  <p style={{ margin: 0, fontSize: '15px', color: '#333', fontWeight: '600' }}>{request.bankDetails.accountNumber}</p>
                </div>
              )}
              {request.bankDetails.bankName && (
                <div style={{ padding: '8px 0', borderBottom: '1px solid #e8e8e8' }}>
                  <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#666', fontWeight: '500' }}>Bank Name</p>
                  <p style={{ margin: 0, fontSize: '15px', color: '#333', fontWeight: '600' }}>{request.bankDetails.bankName}</p>
                </div>
              )}
              {request.bankDetails.ifsc && (
                <div style={{ padding: '8px 0', borderBottom: '1px solid #e8e8e8' }}>
                  <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#666', fontWeight: '500' }}>IFSC Code</p>
                  <p style={{ margin: 0, fontSize: '15px', color: '#333', fontWeight: '600' }}>{request.bankDetails.ifsc}</p>
                </div>
              )}
              {request.bankDetails.uan && (
                <div style={{ padding: '8px 0', borderBottom: '1px solid #e8e8e8' }}>
                  <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#666', fontWeight: '500' }}>UAN (EPFO)</p>
                  <p style={{ margin: 0, fontSize: '15px', color: '#333', fontWeight: '600' }}>{request.bankDetails.uan}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SECTION 7: Document Uploads */}
        <div style={{ marginBottom: '24px', background: '#e8f5ff', padding: '20px', borderRadius: '8px', border: '2px solid #03a9f4' }}>
          <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '18px', fontWeight: '600', color: '#01579b', borderBottom: '2px solid #03a9f4', paddingBottom: '10px' }}>📄 Uploaded Documents</h3>
          
          {request.educationalCertificates && request.educationalCertificates.length > 0 && (
            <div style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #b3e5fc' }}>
              <p style={{ margin: '0 0 12px 0', fontSize: '12px', color: '#01579b', fontWeight: '600' }}>🎓 Educational Certificates:</p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {request.educationalCertificates.map((cert, index) => (
                  <button 
                    key={index}
                    onClick={() => viewDocument(cert)}
                    className="btn btn-secondary"
                    style={{ fontSize: '12px', padding: '8px 14px', backgroundColor: '#03a9f4', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    📄 Certificate {index + 1}
                  </button>
                ))}
              </div>
            </div>
          )}

          {request.idProof && (
            <div style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #b3e5fc' }}>
              <p style={{ margin: '0 0 12px 0', fontSize: '12px', color: '#01579b', fontWeight: '600' }}>🪪 ID Proof:</p>
              <button 
                onClick={() => viewDocument(request.idProof)}
                className="btn btn-secondary"
                style={{ fontSize: '12px', padding: '8px 14px', backgroundColor: '#03a9f4', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                📄 View ID Proof
              </button>
            </div>
          )}

          {request.addressProof && (
            <div style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #b3e5fc' }}>
              <p style={{ margin: '0 0 12px 0', fontSize: '12px', color: '#01579b', fontWeight: '600' }}>🏠 Address Proof:</p>
              <button 
                onClick={() => viewDocument(request.addressProof)}
                className="btn btn-secondary"
                style={{ fontSize: '12px', padding: '8px 14px', backgroundColor: '#03a9f4', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                📄 View Address Proof
              </button>
            </div>
          )}

          {request.experience && Array.isArray(request.experience) && request.experience.length > 0 && (
            <div style={{ marginBottom: '0px' }}>
              <p style={{ margin: '0 0 12px 0', fontSize: '12px', color: '#01579b', fontWeight: '600' }}>💼 Experience Certificates:</p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {request.experience.map((exp, idx) => (
                  exp.certificate && (
                    <button 
                      key={idx}
                      onClick={() => viewDocument(exp.certificate)}
                      className="btn btn-secondary"
                      style={{ fontSize: '12px', padding: '8px 14px', backgroundColor: '#03a9f4', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      📄 {exp.companyName} ({exp.years} yrs)
                    </button>
                  )
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Review Form */}
        <div style={{ marginBottom: '24px', background: '#f8f9fa', padding: '20px', borderRadius: '8px', border: '2px solid #4CAF50' }}>
          <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '18px', fontWeight: '600', color: '#2e7d32', borderBottom: '2px solid #4CAF50', paddingBottom: '10px' }}>✅ Review & Decision</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#333' }}>Decision *</label>
              <select 
                value={status} 
                onChange={(e) => setStatus(e.target.value)} 
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '14px',
                  border: '2px solid #4CAF50',
                  borderRadius: '6px',
                  backgroundColor: '#ffffff',
                  color: '#333',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                <option value="approved" style={{ backgroundColor: '#e8f5e9' }}>✅ Approve</option>
                <option value="rejected" style={{ backgroundColor: '#ffebee' }}>❌ Reject</option>
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#333' }}>Remarks</label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Add any comments or feedback..."
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '14px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '6px',
                  backgroundColor: '#ffffff',
                  color: '#333',
                  fontFamily: 'inherit',
                  minHeight: '100px',
                  resize: 'vertical'
                }}
              />
            </div>
            <div className="modal-actions" style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button 
                type="button" 
                onClick={onClose} 
                className="btn" 
                style={{ background: '#ccc', padding: '10px 20px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={loading}
                style={{ background: '#4CAF50', color: 'white', padding: '10px 24px', border: 'none', borderRadius: '6px', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '14px', fontWeight: '600', opacity: loading ? 0.6 : 1 }}
              >
                {loading ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </form>
        </div>
        </>
        )}
      </div>
    </div>
  );
};

const BulkUploadModal = ({ onClose, onSuccess }) => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setError('');
    setUploadProgress(0);

    try {
      // Read Excel file
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      // Validate required columns
      const requiredColumns = ['fullName', 'email', 'phone', 'practice', 'Position'];
      const firstRow = jsonData[0];
      
      if (!firstRow) {
        setError('Excel file is empty');
        setLoading(false);
        return;
      }

      const missingColumns = requiredColumns.filter(col => !(col in firstRow));
      if (missingColumns.length > 0) {
        setError(`Missing required columns: ${missingColumns.join(', ')}`);
        setLoading(false);
        return;
      }

      // Validate and prepare data
      const validatedData = jsonData
        .map((row, index) => ({
          fullName: row.fullName?.toString().trim(),
          email: row.email?.toString().trim(),
          phone: row.phone?.toString().trim(),
          practice: row.practice?.toString().trim(),
          position: row.Position?.toString().trim(),
          rowIndex: index + 2, // Excel row number (1-indexed + header)
        }))
        .filter(item => item.fullName && item.email && item.phone && item.practice && item.position);

      if (validatedData.length === 0) {
        setError('No valid rows found in the Excel file');
        setLoading(false);
        return;
      }

      // Send to backend for bulk creation
      const response = await adminAPI.bulkCreateCandidates(validatedData);
      
      const results = response.data;
      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;

      let message = `✅ ${successful} candidates created successfully!`;
      if (failed > 0) {
        message += `\n⚠️ ${failed} candidates failed.`;
        const failedDetails = results
          .filter(r => !r.success)
          .map(r => `Row ${r.rowIndex}: ${r.error}`)
          .join('\n');
        message += `\n\n${failedDetails}`;
      }

      alert(message);
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error uploading file:', err);
      setError(err.message || 'Error uploading file. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
        <h2>Bulk Upload Candidates</h2>
        <p style={{ color: '#666', marginBottom: '20px', fontSize: '14px' }}>
          Upload an Excel file with columns: <strong>fullName, email, phone, practice, Position</strong>
        </p>

        <div style={{
          border: '2px dashed #124B84',
          borderRadius: '8px',
          padding: '30px',
          textAlign: 'center',
          marginBottom: '20px',
          background: '#f8f9fa'
        }}>
          <label style={{
            cursor: 'pointer',
            display: 'block'
          }}>
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileUpload}
              disabled={loading}
              style={{ display: 'none' }}
            />
            <div>
              <p style={{ fontSize: '24px', marginBottom: '8px' }}>📁</p>
              <p style={{ fontWeight: '600', color: '#124B84', marginBottom: '4px' }}>
                {loading ? 'Uploading...' : 'Click to select Excel file'}
              </p>
              <p style={{ fontSize: '12px', color: '#999' }}>
                Supported: .xlsx, .xls, .csv
              </p>
            </div>
          </label>
        </div>

        {error && (
          <div style={{
            background: '#ffebee',
            border: '1px solid #ef5350',
            color: '#c62828',
            padding: '12px',
            borderRadius: '4px',
            marginBottom: '16px',
            fontSize: '14px',
            whiteSpace: 'pre-wrap'
          }}>
            {error}
          </div>
        )}

        {uploadProgress > 0 && uploadProgress < 100 && (
          <div style={{ marginBottom: '16px' }}>
            <div style={{
              height: '8px',
              background: '#e0e0e0',
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                background: '#4CAF50',
                width: `${uploadProgress}%`,
                transition: 'width 0.3s ease'
              }} />
            </div>
            <p style={{ fontSize: '12px', color: '#666', marginTop: '8px', textAlign: 'center' }}>
              {uploadProgress}%
            </p>
          </div>
        )}

        <div className="modal-actions">
          <button type="button" onClick={onClose} className="btn" style={{ background: '#ccc' }}>
            Cancel
          </button>
        </div>

        <div style={{
          background: '#e3f2fd',
          border: '1px solid #90caf9',
          borderRadius: '4px',
          padding: '12px',
          marginTop: '16px',
          fontSize: '12px',
          color: '#1565c0'
        }}>
          <p style={{ margin: '0 0 8px 0', fontWeight: '600' }}>📋 Excel Format Example:</p>
          <table style={{ width: '100%', fontSize: '11px', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#bbdefb' }}>
                <th style={{ padding: '6px', border: '1px solid #90caf9', textAlign: 'left' }}>fullName</th>
                <th style={{ padding: '6px', border: '1px solid #90caf9', textAlign: 'left' }}>email</th>
                <th style={{ padding: '6px', border: '1px solid #90caf9', textAlign: 'left' }}>phone</th>
                <th style={{ padding: '6px', border: '1px solid #90caf9', textAlign: 'left' }}>practice</th>
                <th style={{ padding: '6px', border: '1px solid #90caf9', textAlign: 'left' }}>Position</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: '6px', border: '1px solid #90caf9' }}>John Doe</td>
                <td style={{ padding: '6px', border: '1px solid #90caf9' }}>john@example.com</td>
                <td style={{ padding: '6px', border: '1px solid #90caf9' }}>9876543210</td>
                <td style={{ padding: '6px', border: '1px solid #90caf9' }}>Engineering</td>
                <td style={{ padding: '6px', border: '1px solid #90caf9' }}>Engineer</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
