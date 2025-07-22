import React from 'react';
import { User, Test } from '../types';
import { BookOpen, Plus, BarChart3, LogOut, Clock, Users, FileText, MoreVertical, Edit, Trash2, EyeOff, Eye } from 'lucide-react';

interface DashboardProps {
  user: User;
  tests: Test[];
  onLogout: () => void;
  onCreateTest: () => void;
  onStartTest: (test: Test) => void;
  onViewResults: () => void;
  onUpdateTest?: (testId: string, updates: Partial<Test>) => void;
  onDeleteTest?: (testId: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  user,
  tests,
  onLogout,
  onCreateTest,
  onStartTest,
  onViewResults,
  onUpdateTest,
  onDeleteTest
}) => {
  const [showDropdown, setShowDropdown] = React.useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState<string | null>(null);

  const userTests = tests.filter(test => 
    user.role === 'student' ? test.isActive : 
    user.role === 'teacher' ? test.createdBy === user.id : 
    true
  );

  const handleToggleActive = async (testId: string, currentStatus: boolean) => {
    if (onUpdateTest) {
      await onUpdateTest(testId, { isActive: !currentStatus });
      setShowDropdown(null);
    }
  };

  const handleDeleteTest = async (testId: string) => {
    if (onDeleteTest) {
      await onDeleteTest(testId);
      setShowDeleteConfirm(null);
      setShowDropdown(null);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="min-h-screen bg-lime-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-amber-900" />
              <h1 className="ml-2 text-lg sm:text-xl font-bold text-gray-900">Test Portal</h1>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="hidden sm:block text-sm text-gray-600">
                Welcome, <span className="font-medium text-gray-900">{user.name.split(' ')[0]}</span>
              </div>
              <div className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full hidden sm:block">
                {user.role}
              </div>
              <button
                onClick={onLogout}
                className="inline-flex items-center px-2 sm:px-3 py-2 border border-gray-300 shadow-sm text-xs sm:text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <LogOut className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Logout</span>
                <span className="sm:hidden">Exit</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Greeting */}
        <div className="mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            {getGreeting()}, {user.name}!
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            {user.role === 'student' ? 'Ready to take some tests?' : 
             user.role === 'teacher' ? 'Manage your tests and view student progress.' :
             'Monitor the entire platform and user activities.'}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className="h-8 w-8 text-amber-900" />
              </div>
              <div className="ml-4">
                <div className="text-xl sm:text-2xl font-bold text-gray-900">{userTests.length}</div>
                <div className="text-sm text-gray-600">
                  {user.role === 'student' ? 'Available Tests' : 'Total Tests'}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <div className="text-xl sm:text-2xl font-bold text-gray-900">
                  {userTests.filter(t => t.isActive).length}
                </div>
                <div className="text-sm text-gray-600">Active Tests</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <div className="text-xl sm:text-2xl font-bold text-gray-900">
                  {user.role === 'student' ? 'Student' : user.role === 'teacher' ? 'Teacher' : 'Admin'}
                </div>
                <div className="text-sm text-gray-600">Your Role</div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-4 sm:mb-6">
          {(user.role === 'teacher' || user.role === 'admin') && (
            <button
              onClick={onCreateTest}
              className="inline-flex items-center justify-center px-3 sm:px-4 py-2 border border-transparent text-xs sm:text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create New Test
            </button>
        <div className="space-y-3 sm:space-y-4">
          
          <button
            onClick={onViewResults}
            className="inline-flex items-center justify-center px-3 sm:px-4 py-2 border border-gray-300 text-xs sm:text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            View Results
                <div className="p-4 sm:p-6">
        </div>

        {/* Tests Grid */}
                        <span className="text-base sm:text-lg font-medium text-gray-900 mr-3">
            <h2 className="text-lg sm:text-2xl font-bold text-gray-900">{test.title}</h2>
            <div className={`px-3 sm:px-4 py-2 rounded-full text-base sm:text-lg font-bold ${getScoreBadgeColor(result.score)}`}>
              {user.role === 'student' ? 'Available Tests' : 'Your Tests'}
            </h3>
          </div>
          
          {userTests.length === 0 ? (
                        <span className={`ml-2 text-xs sm:text-sm font-medium ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No tests available at the moment.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {userTests.map((test) => (
                <div key={test.id} className="px-3 sm:px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-3 lg:space-y-0">
                      <h3 className="text-sm sm:text-lg text-gray-900 mb-4">{question.question}</h3>
                      <div className="flex items-center">
                        <h4 className="text-base sm:text-lg font-medium text-gray-900">{test.title}</h4>
                        <div className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${
                          test.isActive ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {test.isActive ? 'Active' : 'Inactive'}
                        </div>
                      </div>
                      <p className="text-sm sm:text-base text-gray-600 mt-1">{test.description}</p>
                      <div className="flex flex-wrap items-center text-sm text-gray-500 mt-2 gap-x-2">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                        {test.duration} minutes
                            className={`p-2 sm:p-3 rounded-lg border-2 ${
                        <span>•</span>
                        <div>
                        {test.questions.length} questions
                        </div>
                        <span>•</span>
                        <div>
                        Created {test.createdAt.toLocaleDateString()}
                        </div>
                        {user.role === 'admin' && test.createdBy !== user.id && (
                          <>
                            <span>•</span>
                            <div className="text-blue-600">By: {test.createdBy}</div>
                          </>
                        )}
                        {test.targetClass && (
                              <span className="text-sm sm:text-base text-gray-900">{option}</span>
                            <span>•</span>
                            <div className="text-purple-600">Class {test.targetClass}</div>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-end space-x-2">
                      {user.role === 'student' && test.isActive && (
                        <button
                          onClick={() => onStartTest(test)}
                          className="inline-flex items-center px-3 sm:px-4 py-2 border border-transparent text-xs sm:text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors"
                        >
                          <span className="hidden sm:inline">Start Test</span>
                          <span className="sm:hidden">Start</span>
                        </button>
                      )}
                      
                      {(user.role === 'admin' || (user.role === 'teacher' && test.createdBy === user.id)) && (
                        <div className="relative">
                        <div className={`p-2 sm:p-3 rounded-lg border-2 ${
                            onClick={() => setShowDropdown(showDropdown === test.id ? null : test.id)}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                          <p className="text-sm sm:text-base text-gray-900">{userAnswer as string || 'No answer provided'}</p>
                            <MoreVertical className="h-5 w-5" />
                          </button>
                          
                          {showDropdown === test.id && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                              <div className="py-1">
                                <button
                        <div className="p-2 sm:p-3 rounded-lg border-2 border-green-200 bg-green-50">
                          <p className="text-sm sm:text-base text-gray-900">{question.expectedAnswer}</p>
                                >
                                  {test.isActive ? (
                                    <>
                                      <EyeOff className="h-4 w-4 mr-2" />
                                      Disable Test
                                    </>
                                  ) : (
                                    <>
                                      <Eye className="h-4 w-4 mr-2" />
                                      Enable Test
                                    </>
                                  )}
                                </button>
                                
                                <button
                                  onClick={() => {
                                    setShowDeleteConfirm(test.id);
                                    setShowDropdown(null);
                                  }}
                                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                        <div className={`p-2 sm:p-3 rounded-lg border-2 ${
                                </button>
                              </div>
                          <p className="text-sm sm:text-base text-gray-900">{userAnswer as string || 'No answer provided'}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
                        <div className="p-2 sm:p-3 rounded-lg border-2 border-green-200 bg-green-50">
                          <p className="text-sm sm:text-base text-gray-900">{question.correctNumber}</p>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-3 sm:px-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center mb-4">
              <Trash2 className="h-6 w-6 text-red-500 mr-2" />
              <h3 className="text-base sm:text-lg font-medium text-gray-900">Delete Test</h3>
            </div>
        <div className="mt-6 sm:mt-8 bg-white rounded-lg shadow-sm p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-4">Performance Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-4">
            </p>
              <div className="text-lg sm:text-2xl font-bold text-gray-900">{correctAnswers}/{totalQuestions}</div>
              <div className="text-xl sm:text-2xl font-bold text-green-600">{correctAnswers}</div>
              <button
                onClick={() => setShowDeleteConfirm(null)}
              <div className={`text-lg sm:text-2xl font-bold ${getScoreColor(result.score)}`}>{result.score}%</div>
              >
              <div className="text-xl sm:text-2xl font-bold text-red-600">{totalQuestions - correctAnswers}</div>
              </button>
              <div className="text-lg sm:text-2xl font-bold text-gray-900">{result.completedAt.toLocaleDateString()}</div>
                onClick={() => handleDeleteTest(showDeleteConfirm)}
            <div className="flex items-center text-sm text-gray-600 mt-4 p-2 sm:p-3 bg-blue-50 rounded-lg">
              <div className={`text-xl sm:text-2xl font-bold ${getScoreColor(result.score)}`}>{result.score}%</div>
              <div className="text-lg sm:text-2xl font-bold text-gray-900">{result.completedAt.toLocaleTimeString()}</div>
              </button>
            </div>
          </div>
        </div>
            <p className="text-sm sm:text-base text-gray-600">

      {/* Click outside to close dropdown */}
      {showDropdown && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setShowDropdown(null)}
        />
      )}
    </div>
  );
};

export default Dashboard;