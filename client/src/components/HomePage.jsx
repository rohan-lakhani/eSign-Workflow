import React, { useState } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { API_BASE_URL } from '../utils/api';
import { FaCloudUploadAlt, FaFileAlt, FaClipboardList, FaPaperPlane, FaCheckCircle } from 'react-icons/fa';

const steps = ['Upload PDF', 'Create Workflow', 'Submit for Signing'];

const HomePage = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [documentId, setDocumentId] = useState('');
  const [workflowId, setWorkflowId] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Form states
  const [uploadFile, setUploadFile] = useState(null);
  const [workflowData, setWorkflowData] = useState({
    name: '',
    role1Email: '',
    role1Name: '',
    role2Email: '',
    role2Name: '',
    role3Email: '',
    role3Name: '',
  });

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile) {
      toast.error('Please select a PDF file');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('file', uploadFile);

    try {
      const response = await axios.post(`${API_BASE_URL}/documents/upload`, formData);
      setDocumentId(response.data.document.id);
      toast.success('Document uploaded successfully!');
      setActiveStep(1);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to upload document');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWorkflow = async (e) => {
    e.preventDefault();
    if (!documentId) {
      toast.error('Please complete previous steps first');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        documentId,
        name: workflowData.name,
        roles: [
          {
            email: workflowData.role1Email,
            name: workflowData.role1Name || 'Role 1'
          },
          {
            email: workflowData.role2Email,
            name: workflowData.role2Name || 'Role 2'
          },
          {
            email: null,
            name: workflowData.role3Name || 'Role 3'
          }
        ]
      };

      const response = await axios.post(`${API_BASE_URL}/workflows`, payload);
      setWorkflowId(response.data.workflow.id);
      toast.success('Workflow created successfully!');
      setActiveStep(2);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create workflow');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitWorkflow = async () => {
    if (!workflowId) {
      toast.error('Please create a workflow first');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/workflows/${workflowId}/submit`, {});
      
      toast.success('Workflow submitted successfully! Email sent to Role 1.');
      setActiveStep(3);
    } catch (error) {
      console.error('Submit workflow error:', error);
      toast.error(error.response?.data?.error || 'Failed to submit workflow');
    } finally {
      setLoading(false);
    }
  };



  return (
    <>
      {/* Header */}
      <header className="bg-blue-700 text-white">
        <div className="px-4 py-4">
          <h1 className="text-2xl font-semibold">eSign Workflow Demo</h1>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-3 mt-4 mb-4">
        <div className="bg-white border-2 border-gray-300 rounded-lg p-8">
          {/* Stepper */}
          <div className="flex justify-between items-center mb-8">
            {steps.map((label, index) => (
              <div key={label} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center font-bold
                    ${activeStep > index ? 'bg-green-300 text-green-800' : 
                      activeStep === index ? 'bg-blue-600 text-white' : 
                      'bg-gray-300 text-gray-600'}
                  `}>
                    {activeStep > index ? <FaCheckCircle size={24} /> : index + 1}
                  </div>
                  <span className="mt-2 text-sm text-gray-600">{label}</span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-1 mx-4 ${
                    activeStep > index ? 'bg-green-300' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Step 1: Upload Document */}
            <div className={`
              border-2 border-gray-300 rounded-lg p-6 transition-all
              ${activeStep === 0 ? 'ring-4 ring-blue-100' : ''}
            `}>
              <div className="flex items-center mb-6">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center mr-3
                  ${activeStep >= 1 ? 'bg-green-300' : 'bg-blue-100'}
                `}>
                  {activeStep >= 1 ? (
                    <FaCheckCircle className="text-green-700" size={20} />
                  ) : (
                    <FaCloudUploadAlt className="text-blue-700" size={20} />
                  )}
                </div>
                <h2 className="text-xl font-semibold">Step 1: Upload PDF</h2>
              </div>

              <form onSubmit={handleUpload} className="space-y-4">
                <label className="block">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setUploadFile(e.target.files[0])}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="flex items-center justify-center gap-2 w-full py-3 px-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                  >
                    <FaFileAlt className="text-gray-600" />
                    Select PDF File
                  </label>
                </label>

                {uploadFile && (
                  <div className="p-3 bg-gray-100 rounded-lg">
                    <p className="text-sm text-gray-600">Selected: {uploadFile.name}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!uploadFile || loading || activeStep > 0}
                  className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium
                    disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
                >
                  Upload Document
                </button>

                {documentId && (
                  <div className="text-center mt-4">
                    <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      Document ID: {documentId}
                    </span>
                  </div>
                )}
              </form>
            </div>

            {/* Step 2: Create Workflow */}
            <div className={`
              border-2 border-gray-300 rounded-lg p-6 transition-all
              ${activeStep === 1 ? 'ring-4 ring-blue-100' : ''}
            `}>
              <div className="flex items-center mb-6">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center mr-3
                  ${activeStep >= 2 ? 'bg-green-300' : activeStep === 1 ? 'bg-blue-100' : 'bg-gray-100'}
                `}>
                  {activeStep >= 2 ? (
                    <FaCheckCircle className="text-green-700" size={20} />
                  ) : (
                    <FaClipboardList className={activeStep === 1 ? 'text-blue-700' : 'text-gray-400'} size={20} />
                  )}
                </div>
                <h2 className="text-xl font-semibold">Step 2: Create Workflow</h2>
              </div>

              <form onSubmit={handleCreateWorkflow} className="space-y-4">
                <input
                  type="text"
                  placeholder="Workflow Name *"
                  required
                  value={workflowData.name}
                  onChange={(e) => setWorkflowData({ ...workflowData, name: e.target.value })}
                  disabled={activeStep !== 1}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />

                {/* Role 1 */}
                <div className="p-4 bg-gray-100 rounded-lg space-y-3">
                  <h3 className="font-semibold text-sm">Role 1 (Initiator)</h3>
                  <input
                    type="email"
                    placeholder="Email *"
                    required
                    value={workflowData.role1Email}
                    onChange={(e) => setWorkflowData({ ...workflowData, role1Email: e.target.value })}
                    disabled={activeStep !== 1}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                  <input
                    type="text"
                    placeholder="Name"
                    value={workflowData.role1Name}
                    onChange={(e) => setWorkflowData({ ...workflowData, role1Name: e.target.value })}
                    disabled={activeStep !== 1}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>

                {/* Role 2 */}
                <div className="p-4 bg-gray-100 rounded-lg space-y-3">
                  <h3 className="font-semibold text-sm">Role 2</h3>
                  <input
                    type="email"
                    placeholder="Email *"
                    required
                    value={workflowData.role2Email}
                    onChange={(e) => setWorkflowData({ ...workflowData, role2Email: e.target.value })}
                    disabled={activeStep !== 1}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                  <input
                    type="text"
                    placeholder="Name"
                    value={workflowData.role2Name}
                    onChange={(e) => setWorkflowData({ ...workflowData, role2Name: e.target.value })}
                    disabled={activeStep !== 1}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>

                {/* Role 3 */}
                <div className="p-4 bg-gray-100 rounded-lg space-y-3">
                  <h3 className="font-semibold text-sm">Role 3 (To be determined)</h3>
                  <input
                    type="text"
                    placeholder="Name"
                    value={workflowData.role3Name}
                    onChange={(e) => setWorkflowData({ ...workflowData, role3Name: e.target.value })}
                    disabled={activeStep !== 1}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>

                <p className="text-sm text-gray-500 italic">* Required field</p>

                <button
                  type="submit"
                  disabled={!documentId || loading || activeStep > 1}
                  className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium
                    disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
                >
                  Create Workflow
                </button>

                {workflowId && (
                  <div className="text-center mt-4">
                    <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      Workflow ID: {workflowId}
                    </span>
                  </div>
                )}
              </form>
            </div>

            {/* Step 3: Submit Workflow */}
            <div className={`
              border-2 border-gray-300 rounded-lg p-6 transition-all
              ${activeStep === 2 ? 'ring-4 ring-blue-100' : ''}
            `}>
              <div className="flex items-center mb-6">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center mr-3
                  ${activeStep >= 3 ? 'bg-green-300' : activeStep === 2 ? 'bg-blue-100' : 'bg-gray-100'}
                `}>
                  {activeStep >= 3 ? (
                    <FaCheckCircle className="text-green-700" size={20} />
                  ) : (
                    <FaPaperPlane className={activeStep === 2 ? 'text-blue-700' : 'text-gray-400'} size={20} />
                  )}
                </div>
                <h2 className="text-xl font-semibold">Step 3: Submit for Signing</h2>
              </div>

              <div className="space-y-4">
                {workflowId ? (
                  <div className="p-6 bg-gray-100 rounded-lg text-center">
                    <p className="text-sm text-gray-600 mb-1">Workflow ID</p>
                    <p className="font-semibold">{workflowId}</p>
                  </div>
                ) : (
                  <div className="p-6 bg-gray-100 rounded-lg text-center">
                    <p className="text-sm text-gray-600">Create workflow first to proceed</p>
                  </div>
                )}

                <button
                  onClick={() => handleSubmitWorkflow()}
                  disabled={!workflowId || loading || activeStep > 2}
                  className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium flex items-center justify-center gap-2
                    disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
                >
                  <FaPaperPlane />
                  Submit Workflow
                </button>

                {activeStep > 2 && (
                  <div className="mt-6 text-center">
                    <div className="w-20 h-20 bg-green-300 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FaCheckCircle className="text-green-700" size={48} />
                    </div>
                    <p className="text-lg font-semibold text-green-700">Workflow submitted successfully!</p>
                    <p className="text-sm text-gray-600 mt-2">Email sent to Role 1 for signing</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Workflow Creation Form */}
      {/* This form is no longer needed as the workflow creation is integrated into Step 2 */}
    </>
  );
};

export default HomePage; 