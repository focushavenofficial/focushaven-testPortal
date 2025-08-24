import React, { useState, useEffect } from 'react';
import { Test, Question, User } from '../types';
import { Clock, ArrowLeft, ArrowRight, CheckCircle, AlertCircle, BookOpen, Eye, Save, Send } from 'lucide-react';
import { getSubjectName } from '../constants/subjects';
import * as jdenticon from 'jdenticon';

interface TestTakingProps {
  test: Test;
  currentUser: User;
  onSubmit: (testId: string, answers: Record<string, number | string>, score: number, reviewedQuestions?: string[]) => void;
  onBack: () => void;
}

interface QuestionState {
  answered: boolean;
  reviewed: boolean;
  selected: boolean;
}


generateIdenticon(seed: string): string {
  const size = 100;
  const svg = jdenticon.toSvg(seed, size);

  // Encode SVG safely to a data URL
  const encoded = encodeURIComponent(svg)
    .replace(/'/g, "%27")
    .replace(/"/g, "%22");

  return `data:image/svg+xml,${encoded}`;
}

const TestTaking: React.FC<TestTakingProps> = ({ test, onSubmit, onBack }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number | string>>({});
  const [reviewedQuestions, setReviewedQuestions] = useState<Set<string>>(new Set());
  const [timeLeft, setTimeLeft] = useState(test.duration * 60); // Convert to seconds
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [questionStates, setQuestionStates] = useState<Record<string, QuestionState>>({});

  // Get unique subjects from test questions
  const subjects = Array.from(new Set(test.questions.map(q => q.subject).filter(Boolean)));
  
  // Filter questions by selected subject
  const filteredQuestions = selectedSubject === 'all' 
    ? test.questions 
    : test.questions.filter(q => q.subject === selectedSubject);

  // Get current question from filtered list
  const currentQuestionData = filteredQuestions[currentQuestion];

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Initialize question states
  useEffect(() => {
    const initialStates: Record<string, QuestionState> = {};
    test.questions.forEach(question => {
      initialStates[question.id] = {
        answered: false,
        reviewed: false,
        selected: false
      };
    });
    setQuestionStates(initialStates);
  }, [test.questions]);

  // Update question states when answers change
  useEffect(() => {
    setQuestionStates(prev => {
      const updated = { ...prev };
      Object.keys(answers).forEach(questionId => {
        if (updated[questionId]) {
          updated[questionId].answered = answers[questionId] !== undefined && answers[questionId] !== '';
        }
      });
      return updated;
    });
  }, [answers]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  generateIdenticon(seed: string): string {
  const size = 100;
  const svg = jdenticon.toSvg(seed, size);

  // Encode SVG safely to a data URL
  const encoded = encodeURIComponent(svg)
    .replace(/'/g, "%27")
    .replace(/"/g, "%22");

  return `data:image/svg+xml,${encoded}`;
}


  const handleAnswerSelect = (questionId: string, answer: number | string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
    
    // Mark as selected
    setQuestionStates(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        selected: true,
        answered: answer !== undefined && answer !== ''
      }
    }));
  };

  const handleReviewAndSave = () => {
    if (currentQuestionData) {
      setReviewedQuestions(prev => new Set([...prev, currentQuestionData.id]));
      setQuestionStates(prev => ({
        ...prev,
        [currentQuestionData.id]: {
          ...prev[currentQuestionData.id],
          reviewed: true
        }
      }));
    }
  };

  const calculateScore = () => {
    let correct = 0;
    test.questions.forEach(question => {
      const userAnswer = answers[question.id];
      if (question.type === 'multiple-choice' || question.type === 'true-false') {
        if (userAnswer === question.correctAnswer) {
          correct++;
        }
      } else if (question.type === 'short-answer' || question.type === 'fill-in-blank') {
        if (question.expectedAnswer && typeof userAnswer === 'string') {
          if (userAnswer.toLowerCase().trim() === question.expectedAnswer.toLowerCase().trim()) {
            correct++;
          }
        }
      } else if (question.type === 'real-number') {
        if (question.correctNumber !== undefined && typeof userAnswer === 'string') {
          const userNum = parseFloat(userAnswer.trim());
          if (!isNaN(userNum)) {
            const roundedUser = Math.round(userNum * 1000) / 1000;
            const roundedCorrect = Math.round(question.correctNumber * 1000) / 1000;
            if (roundedUser === roundedCorrect) {
              correct++;
            }
          }
        }
      }
    });
    return Math.round((correct / test.questions.length) * 100);
  };

  const handleSubmit = () => {
    const score = calculateScore();
    onSubmit(test.id, answers, score, Array.from(reviewedQuestions));
  };

  const getAnsweredCount = () => {
    return Object.keys(answers).filter(key => answers[key] !== undefined && answers[key] !== '').length;
  };

  const getQuestionCircleColor = (questionId: string) => {
    const state = questionStates[questionId];
    if (!state) return 'bg-gray-100 text-gray-600';
    
    if (state.reviewed) return 'bg-yellow-400 text-white';
    if (state.answered) return 'bg-green-500 text-white';
    return 'bg-gray-100 text-gray-600 border-2 border-gray-300';
  };

  const isTimeRunningOut = timeLeft < 300; // Less than 5 minutes

  const goToQuestion = (index: number) => {
    if (index >= 0 && index < filteredQuestions.length) {
      setCurrentQuestion(index);
    }
  };

  const goToQuestionById = (questionId: string) => {
    const index = filteredQuestions.findIndex(q => q.id === questionId);
    if (index !== -1) {
      setCurrentQuestion(index);
    }
  };

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
              <div className="flex items-center">
                <BookOpen className="h-6 w-6 text-blue-600 mr-2" />
                <h1 className="text-xl font-bold text-gray-900">{test.title}</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                isTimeRunningOut ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
              }`}>
                <Clock className="h-4 w-4 mr-1" />
                {formatTime(timeLeft)}
              </div>
              
              <div className="flex items-center text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                <img src={generateIdenticon(currentUser)} className="h-4 w-4 mr-2" />
                <span className="font-medium">Student Name</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Subject Filter */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <label htmlFor="subject-filter" className="text-sm font-medium text-gray-700">
              Filter by Subject:
            </label>
            <select
              id="subject-filter"
              value={selectedSubject}
              onChange={(e) => {
                setSelectedSubject(e.target.value);
                setCurrentQuestion(0); // Reset to first question when changing subject
              }}
              className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Subjects</option>
              {subjects.map(subject => (
                <option key={subject} value={subject}>{getSubjectName(subject!)}</option>
              ))}
            </select>
            <div className="text-sm text-gray-600">
              Showing {filteredQuestions.length} questions
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Question Content - Left Side */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm">
              {/* Progress Bar */}
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center space-x-4">
                    <span className="text-sm font-medium text-gray-700">
                      Question {currentQuestion + 1} of {filteredQuestions.length}
                    </span>
                    {currentQuestionData?.subject && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                        {getSubjectName(currentQuestionData.subject)}
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-gray-500">
                    {Math.round(((currentQuestion + 1) / filteredQuestions.length) * 100)}% Complete
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentQuestion + 1) / filteredQuestions.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Question */}
              {currentQuestionData && (
                <div className="px-6 py-8">
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                      {currentQuestionData.question}
                    </h2>
                    
                    {currentQuestionData.type === 'multiple-choice' && (
                      <div className="space-y-3">
                        {currentQuestionData.options.map((option, index) => (
                          <label
                            key={index}
                            className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                          >
                            <input
                              type="radio"
                              name={`question-${currentQuestionData.id}`}
                              value={index}
                              checked={answers[currentQuestionData.id] === index}
                              onChange={() => handleAnswerSelect(currentQuestionData.id, index)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                            />
                            <span className="ml-3 text-gray-900">{option}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {currentQuestionData.type === 'true-false' && (
                      <div className="space-y-3">
                        <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                          <input
                            type="radio"
                            name={`question-${currentQuestionData.id}`}
                            value={1}
                            checked={answers[currentQuestionData.id] === 1}
                            onChange={() => handleAnswerSelect(currentQuestionData.id, 1)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <span className="ml-3 text-gray-900">True</span>
                        </label>
                        <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                          <input
                            type="radio"
                            name={`question-${currentQuestionData.id}`}
                            value={0}
                            checked={answers[currentQuestionData.id] === 0}
                            onChange={() => handleAnswerSelect(currentQuestionData.id, 0)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <span className="ml-3 text-gray-900">False</span>
                        </label>
                      </div>
                    )}

                    {currentQuestionData.type === 'short-answer' && (
                      <div>
                        <textarea
                          value={answers[currentQuestionData.id] as string || ''}
                          onChange={(e) => handleAnswerSelect(currentQuestionData.id, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          rows={4}
                          placeholder="Enter your answer here..."
                        />
                      </div>
                    )}

                    {currentQuestionData.type === 'fill-in-blank' && (
                      <div>
                        <p className="text-gray-600 mb-3">Fill in the blank:</p>
                        <input
                          type="text"
                          value={answers[currentQuestionData.id] as string || ''}
                          onChange={(e) => handleAnswerSelect(currentQuestionData.id, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter your answer..."
                        />
                      </div>
                    )}

                    {currentQuestionData.type === 'real-number' && (
                      <div>
                        <p className="text-gray-600 mb-3">Enter the numerical answer (up to 3 decimal places):</p>
                        <input
                          type="number"
                          step="0.001"
                          value={answers[currentQuestionData.id] as string || ''}
                          onChange={(e) => handleAnswerSelect(currentQuestionData.id, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter your numerical answer..."
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
                <button
                  onClick={() => goToQuestion(currentQuestion - 1)}
                  disabled={currentQuestion === 0}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous
                </button>

                <div className="flex space-x-2">
                  <button
                    onClick={handleReviewAndSave}
                    className="inline-flex items-center px-4 py-2 border border-yellow-300 text-sm font-medium rounded-md text-yellow-700 bg-yellow-50 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Review & Save
                  </button>

                  {currentQuestion < filteredQuestions.length - 1 ? (
                    <button
                      onClick={() => goToQuestion(currentQuestion + 1)}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                      Next
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowConfirmSubmit(true)}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Submit Test
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Question Navigation Panel - Right Side */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Question Navigation</h3>
              
              {/* Stats */}
              <div className="mb-6 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Answered:</span>
                  <span className="font-medium text-green-600">{getAnsweredCount()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Reviewed:</span>
                  <span className="font-medium text-yellow-600">{reviewedQuestions.size}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total:</span>
                  <span className="font-medium text-gray-900">{filteredQuestions.length}</span>
                </div>
              </div>

              {/* Legend */}
              <div className="mb-4 space-y-2 text-xs">
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
                  <span className="text-gray-600">Answered</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-yellow-400 mr-2"></div>
                  <span className="text-gray-600">Reviewed</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full border-2 border-gray-300 bg-gray-100 mr-2"></div>
                  <span className="text-gray-600">Unattempted</span>
                </div>
              </div>

              {/* Question Grid */}
              <div className="grid grid-cols-5 gap-2">
                {filteredQuestions.map((question, index) => (
                  <button
                    key={question.id}
                    onClick={() => goToQuestion(index)}
                    className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                      index === currentQuestion
                        ? 'ring-2 ring-blue-500 ring-offset-2'
                        : ''
                    } ${getQuestionCircleColor(question.id)} hover:scale-110`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>

              {/* Submit Button */}
              <button
                onClick={() => setShowConfirmSubmit(true)}
                className="w-full mt-6 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
              >
                <Send className="h-4 w-4 mr-2" />
                Submit Test
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Confirm Submit Modal */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <AlertCircle className="h-6 w-6 text-orange-500 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Submit Test</h3>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                Are you sure you want to submit your test?
              </p>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Questions Answered:</span>
                  <span className="font-medium">{getAnsweredCount()} / {test.questions.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Questions Reviewed:</span>
                  <span className="font-medium">{reviewedQuestions.size}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Time Remaining:</span>
                  <span className="font-medium">{formatTime(timeLeft)}</span>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirmSubmit(false)}
                className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
              >
                Submit Test
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestTaking;