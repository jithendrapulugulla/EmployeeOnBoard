import React, { useState } from 'react';
import { adminAPI } from '../services/api';

const SendOfferModal = ({ candidate, onClose, onSuccess }) => {
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!['application/pdf', 'image/jpeg', 'image/png'].includes(file.type)) {
      setError('Only PDF, JPG, and PNG files are allowed');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    setDocument(file);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await adminAPI.sendOffer(candidate._id, document);
      setSuccess('Offer sent successfully!');
      setTimeout(onSuccess, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send offer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h5 className="modal-title">📄 Send Offer Letter</h5>
          <button className="close" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <div className="form-group">
              <label>Upload Document (Optional)</label>
              <input
                type="file"
                className="form-control"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                disabled={loading}
              />
              <small className="form-text">PDF, JPG, or PNG • Max 5MB</small>
              {document && <div className="file-selected-info">{document.name}</div>}
            </div>

            <div className="form-group">
              <div className="email-info">
                <strong>Recipient Email:</strong>
                {candidate.email}
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Sending...' : 'Send Offer'}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        /* FULL WHITE BACKGROUND - NO TRANSPARENCY */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background-color: #ffffff;
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9999;
        }

        .modal-content {
          width: 100%;
          max-width: 600px;
          background: #ffffff;
          border-radius: 16px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.2);
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-header {
          padding: 24px;
          border-bottom: 2px solid #124B84;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modal-title {
          margin: 0;
          font-size: 20px;
          font-weight: 800;
          color: #124B84;
        }

        .close {
          font-size: 28px;
          border: none;
          background: none;
          cursor: pointer;
          color: #555;
        }

        .modal-body {
          padding: 24px;
        }

        .modal-footer {
          padding: 20px 24px;
          border-top: 1px solid #ddd;
          display: flex;
          justify-content: flex-end;
          gap: 12px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-control {
          width: 100%;
          padding: 12px;
          border: 2px solid #124B84;
          border-radius: 8px;
        }

        .form-control::file-selector-button {
          background: #124B84;
          color: white;
          border: none;
          padding: 8px 14px;
          margin-right: 10px;
          border-radius: 6px;
          cursor: pointer;
        }

        .file-selected-info {
          margin-top: 10px;
          padding: 10px;
          background: #e6f0ff;
          border-left: 4px solid #124B84;
        }

        .email-info {
          background: #f1f5f9;
          padding: 14px;
          border-radius: 8px;
          border: 1px solid #124B84;
        }

        .btn {
          padding: 10px 24px;
          border-radius: 8px;
          font-weight: 700;
          cursor: pointer;
          border: none;
        }

        .btn-primary {
          background: #124B84;
          color: white;
        }

        .btn-secondary {
          background: #e0e0e0;
        }

        .alert {
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 16px;
        }

        .alert-danger {
          background: #fee2e2;
          color: #991b1b;
        }

        .alert-success {
          background: #dcfce7;
          color: #166534;
        }
      `}</style>
    </div>
  );
};

export default SendOfferModal;
