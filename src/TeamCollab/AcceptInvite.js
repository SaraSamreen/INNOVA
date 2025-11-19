import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Users, Check, X } from 'lucide-react';

const AcceptInvite = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleAcceptInvite = async () => {
    setLoading(true);
    setError(null);

    try {
      const authToken = localStorage.getItem('authToken');
      
      if (!authToken) {
        // Redirect to login with return URL
        localStorage.setItem('pendingInvite', token);
        navigate('/login?redirect=accept-invite');
        return;
      }

      const response = await fetch(`http://localhost:5000/api/teams/accept-invite/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to accept invitation');
      }

      setSuccess(true);
      
      // Redirect to the team after 2 seconds
      setTimeout(() => {
        navigate('/teams');
      }, 2000);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Auto-accept if user is already logged in
    const authToken = localStorage.getItem('authToken');
    if (authToken && token) {
      handleAcceptInvite();
    }
  }, [token]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Users size={32} className="text-blue-600" />
          </div>

          {success ? (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Check size={32} className="text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome to the Team!</h2>
              <p className="text-gray-600 text-center mb-6">
                You've successfully joined the team. Redirecting you now...
              </p>
            </>
          ) : error ? (
            <>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <X size={32} className="text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops!</h2>
              <p className="text-red-600 text-center mb-6">{error}</p>
              <button
                onClick={() => navigate('/teams')}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
              >
                Go to Teams
              </button>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Team Invitation</h2>
              <p className="text-gray-600 text-center mb-6">
                You've been invited to join a team on TeamCollab
              </p>
              
              <button
                onClick={handleAcceptInvite}
                disabled={loading}
                className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {loading ? 'Accepting...' : 'Accept Invitation'}
              </button>

              <button
                onClick={() => navigate('/')}
                className="mt-3 text-gray-600 hover:text-gray-800 text-sm"
              >
                Decline
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AcceptInvite;