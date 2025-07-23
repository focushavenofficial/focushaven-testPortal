import React, { useState } from 'react';
import { TestResult, Test, User, ReviewRequest } from '../types';
import { ArrowLeft, CheckCircle, XCircle, AlertCircle, Eye, User as UserIcon, MessageSquare } from 'lucide-react';
import { TestService } from '../services/testService';

interface TestReviewProps {
  result: TestResult;
  test: Test;
  currentUser: User;
  onBack: () => void;
}

const TestReview: React.FC<TestReviewProps> = ({ result, test, currentUser, onBack }) => {
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);
  const [showReviewModal, setShowReviewModal] = useState<string | null>(null);
  const [reviewReason, setReviewReason] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 90) return 'bg-green-100 text-green-800';
    if (score >= 80) return 'bg-blue-100 text-blue-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const correctAnswers = result.detailedResults?.filter(r => r.isCorrect).length || 0;
  const totalQuestions = test.questions.length;
  const totalMarksAwarded = result.detailedResults?.reduce((sum, r) => sum + (r.marksAwarded || 0), 0) || 0;
  const totalPossibleMarks = test.questions.reduce((sum, q) => sum + (q.marks || 1), 0);

  const handleRequestReview = async (questionId: string) => {
    if (!reviewReason.trim()) return;
    
    setSubmittingReview(true);
    try {
      await TestService.createReviewRequest({
        testResultId: result.id,
        questionId,
        userId: currentUser.id,
        reason: reviewReason,
        status: 'pending'
      });
      
      setShowReviewModal(null);
      setReviewReason('');
      alert('Review request submitted successfully!');
    } catch (error) {
      console.error('Error submitting review request:', error);
      alert('Failed to submit review request. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={onBack}
                className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h1 className="text-xl font-bold text-gray-900">Test Review</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Test Summary */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">{test.title}</h2>
            <div className={`px-4 py-2 rounded-full text-lg font-bold ${getScoreBadgeColor(result.score)}`}>
              {result.score}%
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{totalMarksAwarded}/{totalPossibleMarks}</div>
              <div className="text-sm text-gray-600">Marks Awarded</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${getScoreColor(result.score)}`}>{result.score}%</div>
              <div className="text-sm text-gray-600">Final Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{result.completedAt.toLocaleDateString()}</div>
              <div className="text-sm text-gray-600">Completed On</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{result.completedAt.toLocaleTimeString()}</div>
              <div className="text-sm text-gray-600">Completed At</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{correctAnswers}/{totalQuestions}</div>
              <div className="text-sm text-gray-600">Correct Answers</div>
            </div>
          </div>

          {currentUser.role !== 'student' && (
            <div className="flex items-center text-sm text-gray-600 mt-4 p-3 bg-blue-50 rounded-lg">
              <UserIcon className="h-4 w-4 mr-2" />
              <span className="font-medium">Student:</span>
              <span className="ml-1">{result.userId}</span>
            </div>
          )}
        </div>

        {/* Questions Review */}
        <div className="space-y-4">
          {test.questions.map((question, index) => {
            const detailedResult = result.detailedResults?.find(r => r.questionId === question.id);
            const userAnswer = result.answers[question.id];
            const isCorrect = detailedResult?.isCorrect || false;
            const marksAwarded = detailedResult?.marksAwarded || 0;
            const totalMarks = question.marks || 1;
            
            return (
              <div key={question.id} className="bg-white rounded-lg shadow-sm">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <span className="text-lg font-medium text-gray-900 mr-3">
                          Question {index + 1}
                        </span>
                        {isCorrect ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                        <span className={`ml-2 text-sm font-medium ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                          {isCorrect ? 'Correct' : 'Incorrect'}
                        </span>
                        <span className="ml-2 text-sm text-gray-600">
                          ({marksAwarded}/{totalMarks} marks)
                        </span>
                        {detailedResult?.similarityScore && (
                          <span className="ml-2 text-xs text-gray-500">
                            (Similarity: {Math.round(detailedResult.similarityScore * 100)}%)
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg text-gray-900 mb-4">{question.question}</h3>
                    </div>
                    
                    {/* Review Request Button for Students */}
                    {currentUser.role === 'student' && !isCorrect && 
                     (question.type === 'short-answer' || question.type === 'fill-in-blank') && (
                      <button
                        onClick={() => setShowReviewModal(question.id)}
                        className="inline-flex items-center px-3 py-1 border border-orange-300 text-xs font-medium rounded-md text-orange-700 bg-orange-50 hover:bg-orange-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
                      >
                        <MessageSquare className="h-3 w-3 mr-1" />
                        Request Review
                      </button>
                    )}
                  </div>

                  {/* Multiple Choice Questions */}
                  {question.type === 'multiple-choice' && (
                    <div className="space-y-2">
                      {question.options.map((option, optIndex) => {
                        const isUserAnswer = userAnswer === optIndex;
                        const isCorrectAnswer = question.correctAnswer === optIndex;
                        
                        return (
                          <div
                            key={optIndex}
                            className={`p-3 rounded-lg border-2 ${
                              isCorrectAnswer
                                ? 'border-green-200 bg-green-50'
                                : isUserAnswer && !isCorrectAnswer
                                ? 'border-red-200 bg-red-50'
                                : 'border-gray-200 bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center">
                              <div className={`w-4 h-4 rounded-full mr-3 ${
                                isCorrectAnswer
                                  ? 'bg-green-500'
                                  : isUserAnswer && !isCorrectAnswer
                                  ? 'bg-red-500'
                                  : 'bg-gray-300'
                              }`} />
                              <span className="text-gray-900">{option}</span>
                              {isCorrectAnswer && (
                                <CheckCircle className="h-4 w-4 text-green-500 ml-auto" />
                              )}
                              {isUserAnswer && !isCorrectAnswer && (
                                <XCircle className="h-4 w-4 text-red-500 ml-auto" />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* True/False Questions */}
                  {question.type === 'true-false' && (
                    <div className="space-y-2">
                      <div className={`p-3 rounded-lg border-2 ${
                        question.correctAnswer === 1 ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
                      }`}>
                        <div className="flex items-center">
                          <div className={`w-4 h-4 rounded-full mr-3 ${
                            question.correctAnswer === 1 ? 'bg-green-500' : 'bg-gray-300'
                          }`} />
                          <span className="text-gray-900">True</span>
                          {question.correctAnswer === 1 && (
                            <CheckCircle className="h-4 w-4 text-green-500 ml-auto" />
                          )}
                          {userAnswer === 1 && question.correctAnswer !== 1 && (
                            <XCircle className="h-4 w-4 text-red-500 ml-auto" />
                          )}
                        </div>
                      </div>
                      
                      <div className={`p-3 rounded-lg border-2 ${
                        question.correctAnswer === 0 ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
                      }`}>
                        <div className="flex items-center">
                          <div className={`w-4 h-4 rounded-full mr-3 ${
                            question.correctAnswer === 0 ? 'bg-green-500' : 'bg-gray-300'
                          }`} />
                          <span className="text-gray-900">False</span>
                          {question.correctAnswer === 0 && (
                            <CheckCircle className="h-4 w-4 text-green-500 ml-auto" />
                          )}
                          {userAnswer === 0 && question.correctAnswer !== 0 && (
                            <XCircle className="h-4 w-4 text-red-500 ml-auto" />
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Real Number Questions */}
                  {question.type === 'real-number' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Your Answer:
                        </label>
                        <div className={`p-3 rounded-lg border-2 ${
                          isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                        }`}>
                          <p className="text-gray-900">{userAnswer as string || 'No answer provided'}</p>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Correct Answer:
                        </label>
                        <div className="p-3 rounded-lg border-2 border-green-200 bg-green-50">
                          <p className="text-gray-900">{question.correctNumber}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  {/* Short Answer and Fill in the Blank Questions */}
                  {(question.type === 'short-answer' || question.type === 'fill-in-blank') && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Your Answer:
                        </label>
                        <div className={`p-3 rounded-lg border-2 ${
                          isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                        }`}>
                          <p className="text-gray-900">{userAnswer as string || 'No answer provided'}</p>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Expected Answer:
                        </label>
                        <div className="p-3 rounded-lg border-2 border-green-200 bg-green-50">
                          <p className="text-gray-900">{question.expectedAnswer}</p>
                        </div>
                      </div>

                      {detailedResult?.similarityScore && (
                        <div className="flex items-center text-sm text-gray-600">
                          <AlertCircle className="h-4 w-4 mr-2" />
                          <span>
                            AI Similarity Score: {Math.round(detailedResult.similarityScore * 100)}% - 
                            {marksAwarded > 0 ? ` ${marksAwarded}/${totalMarks} marks awarded` : ' No marks awarded'}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Performance Summary */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Summary</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{totalMarksAwarded}</div>
              <div className="text-sm text-gray-600">Total Marks</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{correctAnswers}</div>
              <div className="text-sm text-gray-600">Correct Answers</div>
            </div>
            
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{totalQuestions - correctAnswers}</div>
              <div className="text-sm text-gray-600">Incorrect Answers</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className={`text-2xl font-bold ${getScoreColor(result.score)}`}>{result.score}%</div>
              <div className="text-sm text-gray-600">Overall Score</div>
            </div>
          </div>

          <div className="mt-4 text-center">
            <p className="text-gray-600">
              {result.score >= 90 ? '🎉 Excellent work!' :
               result.score >= 80 ? '👍 Good job!' :
               result.score >= 60 ? '👌 Fair performance' :
               '📚 Keep studying and try again!'}
            </p>
          </div>
        </div>
      </main>

      {/* Review Request Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <MessageSquare className="h-6 w-6 text-orange-500 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Request Review</h3>
            </div>
            
            <p className="text-gray-600 mb-4">
              Explain why you think your answer should be marked as correct:
            </p>
            
            <textarea
              value={reviewReason}
              onChange={(e) => setReviewReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              rows={4}
              placeholder="Provide your reasoning for the review request..."
            />
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowReviewModal(null);
                  setReviewReason('');
                }}
                className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRequestReview(showReviewModal)}
                disabled={!reviewReason.trim() || submittingReview}
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submittingReview ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestReview;