import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { publicAPI } from '../services/api';

const AcceptOffer = () => {
  const { token } = useParams();
  const [status, setStatus] = useState('verifying'); // verifying, valid, accepted, error
  const [candidate, setCandidate] = useState(null);
  const [error, setError] = useState('');

  const verifyOffer = useCallback(async () => {
    try {
      const response = await publicAPI.verifyOffer(token);
      setCandidate(response.data.candidate);
      
      if (response.data.candidate.offerAccepted) {
        setStatus('accepted');
      } else {
        setStatus('valid');
      }
    } catch (err) {
      setStatus('error');
      setError(err.response?.data?.message || 'Invalid or expired offer link');
    }
  }, [token]);

  useEffect(() => {
    verifyOffer();
  }, [token, verifyOffer]);

  const handleAcceptOffer = async () => {
    try {
      setStatus('accepting');
      const response = await publicAPI.acceptOffer(token);
      setStatus('accepted');
      alert(response.data.message);
    } catch (err) {
      setStatus('error');
      setError(err.response?.data?.message || 'Error accepting offer');
    }
  };

  return (
    <div className="container" style={{ maxWidth: '600px', marginTop: '80px' }}>
      <div className="card">
        {status === 'verifying' && (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <h2>Verifying Offer...</h2>
            <p>Please wait while we verify your offer link.</p>
          </div>
        )}

        {status === 'valid' && candidate && (
          <>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <h2>🎉 Congratulations!</h2>
            </div>
            <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px', marginBottom: '24px' }}>
              <p style={{ marginBottom: '8px' }}><strong>Name:</strong> {candidate.fullName}</p>
              <p style={{ marginBottom: '8px' }}><strong>Position:</strong> {candidate.position}</p>
              <p style={{ marginBottom: '0' }}><strong>Department:</strong> {candidate.practice}</p>
            </div>
            <p style={{ marginBottom: '24px', textAlign: 'center' }}>
              We are pleased to offer you this position. Please click the button below to accept this offer.
            </p>
            <button
              onClick={handleAcceptOffer}
              className="btn btn-primary"
              style={{ width: '100%', padding: '16px', fontSize: '16px' }}
            >
              Accept Offer
            </button>
          </>
        )}

        {status === 'accepting' && (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <h2>Processing...</h2>
            <p>Please wait while we process your acceptance.</p>
          </div>
        )}

        {status === 'accepted' && candidate && (
          <>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <h2 style={{ color: '#4CAF50' }}>✓ Offer Accepted!</h2>
            </div>
            <div style={{ background: '#d4edda', padding: '20px', borderRadius: '8px', marginBottom: '24px', border: '1px solid #c3e6cb' }}>
              <p style={{ color: '#155724', marginBottom: '12px' }}>
                <strong>Thank you for accepting our offer, {candidate.fullName}!</strong>
              </p>
              <p style={{ color: '#155724', marginBottom: '0' }}>
                You will receive an email with joining details and login credentials shortly.
              </p>
            </div>
            <div style={{ background: '#fff3cd', padding: '16px', borderRadius: '8px', border: '1px solid #ffeaa7' }}>
              <p style={{ color: '#856404', marginBottom: '8px', fontSize: '14px' }}>
                <strong>Next Steps:</strong>
              </p>
              <ol style={{ color: '#856404', marginLeft: '20px', fontSize: '14px', marginBottom: '0' }}>
                <li>Check your email for joining details</li>
                <li>Login using the credentials provided</li>
                <li>Complete the joining form with required documents</li>
              </ol>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <h2 style={{ color: '#f44336' }}>❌ Error</h2>
            </div>
            <div style={{ background: '#f8d7da', padding: '20px', borderRadius: '8px', border: '1px solid #f5c6cb' }}>
              <p style={{ color: '#721c24', marginBottom: '0' }}>{error}</p>
            </div>
            <p style={{ textAlign: 'center', marginTop: '16px', color: '#666' }}>
              If you believe this is an error, please contact HR.
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default AcceptOffer;
