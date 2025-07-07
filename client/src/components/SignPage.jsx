import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaFileAlt, FaCheckCircle } from 'react-icons/fa';

const SignPage = () => {
  const { workflowId } = useParams();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);
  const [workflow, setWorkflow] = useState(null);
  const [documentUrl, setDocumentUrl] = useState('');
  const [role3Email, setRole3Email] = useState('');
  const [currentRole, setCurrentRole] = useState(null);
  const [signed, setSigned] = useState(false);

  useEffect(() => {
    if (token) {
      fetchWorkflow();
    } else {
      setLoading(false);
    }
  }, [workflowId, token]);

  const fetchWorkflow = async () => {
    if (!token) {
      toast.error('No authentication token provided');
      setLoading(false);
      return;
    }
    
    try {
      const response = await axios.get(`/api/workflows/${workflowId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const workflowData = response.data.workflow;
      setWorkflow(workflowData);
      
      // Generate document preview URL
      const docUrl = `/api/documents/${workflowData.document.id}/preview`;
      setDocumentUrl(docUrl);
      
      // Extract role from token (in production, verify this server-side)
      if (token) {
        try {
          const tokenParts = token.split('.');
          if (tokenParts.length === 3) {
            const payload = JSON.parse(atob(tokenParts[1]));
            const roleNumber = payload.roleNumber || payload.role;
            setCurrentRole(roleNumber);
            
            // Check if already signed
            const role = workflowData.roles.find(r => r.roleNumber === roleNumber);
            if (role && role.status === 'signed') {
              setSigned(true);
            }
          }
        } catch (e) {
          console.error('Error parsing token:', e);
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to load workflow');
    } finally {
      setLoading(false);
    }
  };

  const handleSign = async (e) => {
    e.preventDefault();
    
    // Validate Role 2 provides Role 3 email
    if (currentRole === 2 && !role3Email) {
      toast.error('Please provide Role 3 email address');
      return;
    }

    setSigning(true);
    try {
      const payload = {
        signature: 'Signed', // Default signature value
        ...(currentRole === 2 && { role3Email })
      };

      const response = await axios.post(
        `/api/workflows/${workflowId}/sign`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      toast.success(response.data.message);
      setSigned(true);
      
      // Refresh workflow data
      await fetchWorkflow();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to sign document');
    } finally {
      setSigning(false);
    }
  };

  if (loading && !workflow) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!workflow) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-800 mb-2">
            {!token ? 'Authentication Required' : 'Workflow not found'}
          </p>
          {!token && (
            <p className="text-gray-600">
              Please use the link from your email to access this page.
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <header className="bg-blue-700 text-white">
        <div className="px-4 py-4">
          <h1 className="text-2xl font-semibold">eSign Document</h1>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Document Preview - Full Width */}
        <div className="bg-white border-2 border-gray-300 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <FaFileAlt className="text-blue-600 mr-2" size={24} />
              <h2 className="text-xl font-semibold">Document Preview</h2>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Document Name</p>
              <p className="font-semibold">{workflow.document.name}</p>
            </div>
          </div>

          <iframe
            src={documentUrl}
            className="w-full h-[600px] border border-gray-300 rounded-lg"
            title="Document Preview"
          />
        </div>

        {/* Signing Section - Below PDF */}
        <div className="bg-white border-2 border-gray-300 rounded-lg p-6">
          {!signed ? (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold">Sign Document</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    You are signing as: <span className="font-semibold">{workflow.roles.find(r => r.roleNumber === currentRole)?.name || `Role ${currentRole}`}</span>
                  </p>
                </div>
                {currentRole === 2 && (
                  <p className="text-sm text-amber-600">
                    Note: You will need to provide Role 3's email address
                  </p>
                )}
              </div>

              <form onSubmit={handleSign}>
                {currentRole === 2 && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role 3 Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={role3Email}
                      onChange={(e) => setRole3Email(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter Role 3 email"
                    />
                  </div>
                )}

                <p className="text-sm text-gray-600 text-center mb-4">
                  By clicking "Sign", you agree to electronically sign this document.
                </p>

                <div className="flex gap-3 justify-center">
                                      <button
                      type="button"
                      onClick={() => window.close()}
                      disabled={signing}
                      className="px-8 py-3 bg-gray-500 text-white rounded-lg font-medium
                        hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                                      <button
                      type="submit"
                      disabled={signing || workflow.currentRole !== currentRole}
                      className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium
                        disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors
                        flex items-center justify-center min-w-[100px]"
                    >
                      {signing ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Signing...
                        </>
                      ) : 'Sign'}
                    </button>
                </div>

                {workflow.currentRole !== currentRole && (
                  <p className="text-sm text-amber-600 text-center mt-4">
                    Waiting for Role {workflow.currentRole} to sign first
                  </p>
                )}
              </form>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaCheckCircle className="text-green-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-green-700 mb-2">
                Document Signed Successfully!
              </h3>
              <p className="text-gray-600">
                {workflow.status === 'completed' 
                  ? 'All parties have signed. You will receive the completed document via email.'
                  : `Thank you for signing. The document has been sent to ${
                      workflow.currentRole === 3 ? 'the final signer' : `Role ${workflow.currentRole}`
                    }.`
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default SignPage; 