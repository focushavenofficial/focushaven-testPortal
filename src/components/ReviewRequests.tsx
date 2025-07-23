import React, { useState, useEffect } from 'react';
import { ReviewRequest, User, TestResult, Test, Question } from '../types';
import { ArrowLeft, MessageSquare, CheckCircle, XCircle, Clock, User as UserIcon, FileText } from 'lucide-react';
import { TestService } from '../services/testService';

interface ReviewRequestsProps {
  currentUser: User;
  onBack: () => void;
}

const ReviewRequests: React.FC<ReviewRequestsProps> = ({ currentUser, onBack }) => {
  const [requests, setRequests] = useState<ReviewRequest[]>([]);
  const [tests, setTests] = useState<Test[]>([]);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<ReviewRequest | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [newMarks, setNewMarks] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const [requestsData, testsData, resultsData] = await Promise.all([
        TestService.getReviewRequests(currentUser.role, currentUser.id),
        TestService.getTests(currentUser.role, currentUser.id),
        TestService.getTestResults(currentUser.role, currentUser.id)
      ]);
      
      setRequests(requestsData);
      setTests(testsData);
      setTestResults(resultsData);
    } catch (err) {
      console.error('Error loading review requests:', err);
      setError('Failed to load review requests');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewRequest = async (requestId: string, status: 'approved' | 'rejected', newMarksValue?: number) => {
    if (!selectedRequest) return;
    
    setSubmitting(true);
    try {
      const updateData: any = {
        status,
        reviewedBy: currentUser.id,
        reviewNotes: reviewNotes.trim() || undefined
      };

      // If approved and new marks provided, update the test result
      if (status === 'approved' && newMarksValue !== undefined) {
        await TestService.updateTestResultMarks(
          selectedRequest.testResultId,
          selectedRequest.questionId,
          newMarksValue
        );
      }

      await TestService.updateReviewRequest(requestId, updateData);
      
      // Update local state
      setRequests(prev => prev.map(req => 
        req.id === requestId 
          ? { ...req, status, reviewedBy: currentUser.id, reviewedAt: new Date(), reviewNotes: reviewNotes.trim() || undefined }
          : req
      ));
      
      setSelectedRequest(null);
      setReviewNotes('');
      setNewMarks(0);
    } catch (err) {
      console.error('Error updating review request:', err);
      setError('Failed to update review request');
    } finally {
      setSubmitting(false);
    }
  };

  const getQuestionDetails = (request: ReviewRequest) => {
    const testResult = testResults.find(r => r.id === request.testResultId);
    const test = tests.find(t => t.id === testResult?.testId);
    const question = test?.questions.find(q => q.id === request.questionId);
    const detailedResult = testResult?.detailedResults?.find(r => r.questionId === request.questionId);
    
    return { test, question, testResult, detailedResult };
  };

  const handleSelectRequest = (request: ReviewRequest) => {
    setSelectedRequest(request);
    const { question, detailedResult } = getQuestionDetails(request);
    setNewMarks(detailedResult?.marksAwarded || 0);
    setReviewNotes('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const pendingRequests = requests.filter(req => req.status === 'pending');
  const reviewedRequests = requests.filter(req => req.status !== 'pending');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading review requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={onBack}
                className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h1 className="text-xl font-bold text-gray-900">Review Requests</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
                <button
                  onClick={() => setError(null)}
                  className="mt-2 text-sm text-red-600 hover:text-red-500"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">{pendingRequests.length}</div>
                <div className="text-sm text-gray-600">Pending Requests</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">
                  {requests.filter(r => r.status === 'approved').length}
                </div>
                <div className="text-sm text-gray-600">Approved</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">
                  {requests.filter(r => r.status === 'rejected').length}
                </div>
                <div className="text-sm text-gray-600">Rejected</div>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Requests */}
        {pendingRequests.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Pending Review Requests</h2>
            </div>
            
            <div className="divide-y divide-gray-200">
              {pendingRequests.map((request) => (
                <div key={request.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <UserIcon className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="font-medium text-gray-900">{request.userId}</span>
                        <div className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(request.status)}`}>
                          <div className="flex items-center">
                            {getStatusIcon(request.status)}
                            <span className="ml-1 capitalize">{request.status}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-2">
                        <span className="font-medium">Question ID:</span> {request.questionId}
                      </div>
                      
                      <div className="text-sm text-gray-900 mb-3">
                        <span className="font-medium">Reason:</span>
                        <p className="mt-1 text-gray-700">{request.reason}</p>
                      </div>
                      
                      <div className="text-xs text-gray-500">
                        Submitted on {request.createdAt.toLocaleDateString()} at {request.createdAt.toLocaleTimeString()}
                      </div>
                    </div>
                    
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => handleSelectRequest(request)}
                        className="inline-flex items-center px-3 py-1 border border-blue-300 text-xs font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                      >
                        <MessageSquare className="h-3 w-3 mr-1" />
                        Review
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reviewed Requests */}
        {reviewedRequests.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Reviewed Requests</h2>
            </div>
            
            <div className="divide-y divide-gray-200">
              {reviewedRequests.map((request) => (
                <div key={request.id} className="px-6 py-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <UserIcon className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="font-medium text-gray-900">{request.userId}</span>
                        <div className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(request.status)}`}>
                          <div className="flex items-center">
                            {getStatusIcon(request.status)}
                            <span className="ml-1 capitalize">{request.status}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-2">
                        <span className="font-medium">Question ID:</span> {request.questionId}
                      </div>
                      
                      <div className="text-sm text-gray-900 mb-3">
                        <span className="font-medium">Student's Reason:</span>
                        <p className="mt-1 text-gray-700">{request.reason}</p>
                      </div>
                      
                      {request.reviewNotes && (
                        <div className="text-sm text-gray-900 mb-3">
                          <span className="font-medium">Review Notes:</span>
                          <p className="mt-1 text-gray-700">{request.reviewNotes}</p>
                        </div>
                      )}
                      
                      <div className="text-xs text-gray-500">
                        Reviewed by {request.reviewedBy} on {request.reviewedAt?.toLocaleDateString()} at {request.reviewedAt?.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Requests */}
        {requests.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No review requests found.</p>
          </div>
        )}
      </main>

      {/* Review Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center mb-4">
              <MessageSquare className="h-6 w-6 text-blue-500 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Review Request</h3>
            </div>
            
            {(() => {
              const { test, question, testResult, detailedResult } = getQuestionDetails(selectedRequest);
              const userAnswer = testResult?.answers[selectedRequest.questionId];
              
              return (
                <div className="space-y-6 mb-6">
                  {/* Student Info */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Student:</label>
                        <p className="text-gray-900 font-medium">{selectedRequest.userId}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Test:</label>
                        <p className="text-gray-900">{test?.title || 'Unknown Test'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Question Details */}
                  {question && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-lg font-medium text-gray-900 mb-3">Original Question</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Question:</label>
                          <p className="text-gray-900 bg-white p-3 rounded border">{question.question}</p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Student's Answer:</label>
                            <div className="bg-red-50 border border-red-200 p-3 rounded">
                              <p className="text-gray-900">{userAnswer as string || 'No answer provided'}</p>
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Expected Answer:</label>
                            <div className="bg-green-50 border border-green-200 p-3 rounded">
                              <p className="text-gray-900">{question.expectedAnswer || 'N/A'}</p>
                            </div>
                          </div>
                        </div>
                        
                        {detailedResult?.similarityScore && (
                          <div className="bg-yellow-50 border border-yellow-200 p-3 rounded">
                            <p className="text-sm text-gray-700">
                              <span className="font-medium">AI Similarity Score:</span> {Math.round(detailedResult.similarityScore * 100)}%
                            </p>
                            <p className="text-sm text-gray-700">
                              <span className="font-medium">Current Marks:</span> {detailedResult.marksAwarded || 0}/{question.marks || 1}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Student's Reason */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Student's Reason for Review:</label>
                    <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
                      <p className="text-gray-900">{selectedRequest.reason}</p>
                    </div>
                  </div>

                  {/* New Marks Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Award New Marks (out of {question?.marks || 1}):
                    </label>
                    <input
                      type="number"
                      min="0"
                      max={question?.marks || 1}
                      step="0.5"
                      value={newMarks}
                      onChange={(e) => setNewMarks(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter marks to award..."
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Current marks: {detailedResult?.marksAwarded || 0}. Enter new marks if approving the request.
                    </p>
                  </div>
                  
                  {/* Review Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Review Notes (Optional):</label>
                    <textarea
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                      placeholder="Add notes about your decision..."
                    />
                  </div>
                </div>
              );
            })()}
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setSelectedRequest(null);
                  setReviewNotes('');
                  setNewMarks(0);
                }}
                className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReviewRequest(selectedRequest.id, 'rejected')}
                disabled={submitting}
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? 'Processing...' : 'Reject'}
              </button>
              <button
                onClick={() => handleReviewRequest(selectedRequest.id, 'approved', newMarks)}
                disabled={submitting}
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? 'Processing...' : `Approve & Award ${newMarks} Marks`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewRequests;