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
                <span className="text-xs sm:text-sm">{formatTime(timeLeft)}</span>
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
          )}
          
          <button
            onClick={onViewResults}
            className="inline-flex items-center justify-center px-3 sm:px-4 py-2 border border-gray-300 text-xs sm:text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            View Results
          </button>
        </div>

      <main className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-base sm:text-lg font-medium text-gray-900">
              {user.role === 'student' ? 'Available Tests' : 'Your Tests'}
            </h3>
          </div>
          
          {userTests.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No tests available at the moment.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {userTests.map((test) => (
                <div key={test.id} className="px-3 sm:px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-3 lg:space-y-0">
                    <div className="flex-1">
          <div className="px-3 sm:px-6 py-4 sm:py-6 md:py-8">
                        <h4 className="text-base sm:text-lg font-medium text-gray-900">{test.title}</h4>
              <h2 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 mb-4">
                          test.isActive ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {test.isActive ? 'Active' : 'Inactive'}
                        </div>
                      </div>
                      <p className="text-sm sm:text-base text-gray-600 mt-1">{test.description}</p>
                      <div className="flex flex-wrap items-center text-sm text-gray-500 mt-2 gap-x-2">
                        <div className="flex items-center">
                    className="flex items-start p-2 sm:p-3 md:p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                        {test.duration} minutes
                        </div>
                        <span>•</span>
                        <div>
                        {test.questions.length} questions
                        </div>
                        <span>•</span>
                        <div>
                        Created {test.createdAt.toLocaleDateString()}
                    <span className="ml-2 sm:ml-3 text-gray-900 text-sm sm:text-base">{option}</span>
                        {user.role === 'admin' && test.createdBy !== user.id && (
                          <>
                            <span>•</span>
                            <div className="text-blue-600">By: {test.createdBy}</div>
                          </>
                        )}
                        {test.targetClass && (
                  <label className="flex items-center p-2 sm:p-3 md:p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                            <span>•</span>
                            <div className="text-purple-600">Class {test.targetClass}</div>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-end space-x-2">
                    <span className="ml-2 sm:ml-3 text-gray-900 text-sm sm:text-base">True</span>
                        <button
                  <label className="flex items-center p-2 sm:p-3 md:p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                          className="inline-flex items-center px-3 sm:px-4 py-2 border border-transparent text-xs sm:text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors"
                        >
                          <span className="hidden sm:inline">Start Test</span>
                          <span className="sm:hidden">Start</span>
                        </button>
                      )}
                      
                      {(user.role === 'admin' || (user.role === 'teacher' && test.createdBy === user.id)) && (
                    <span className="ml-2 sm:ml-3 text-gray-900 text-sm sm:text-base">False</span>
                          <button
                            onClick={() => setShowDropdown(showDropdown === test.id ? null : test.id)}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                          >
                            <MoreVertical className="h-5 w-5" />
                          </button>
                          
                          {showDropdown === test.id && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                    className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                                <button
                                  onClick={() => handleToggleActive(test.id, test.isActive)}
                                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
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
                    className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
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
                                  Delete Test
                                </button>
        <div className="mt-4 sm:mt-6 bg-white rounded-lg shadow-sm p-3 sm:p-6">
          <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Question Navigation</h3>
          <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-1 sm:gap-2">
                        </div>
                      )}
                    </div>
                  </div>
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full text-xs sm:text-sm font-medium transition-colors ${
              ))}
          <div className="px-3 sm:px-6 py-4 border-t border-gray-200 flex justify-between items-center">
          )}
        </div>
      </main>
              className="inline-flex items-center px-2 sm:px-4 py-2 border border-gray-300 text-xs sm:text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-3 sm:px-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center mb-4">
              <Trash2 className="h-6 w-6 text-red-500 mr-2" />
              <h3 className="text-base sm:text-lg font-medium text-gray-900">Delete Test</h3>
            </div>
            
            <p className="text-sm sm:text-base text-gray-600 mb-6">
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-3 sm:px-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 max-w-md w-full">
          <div className="px-3 sm:px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
              <h3 className="text-base sm:text-lg font-medium text-gray-900">Submit Test</h3>
                onClick={() => setShowDeleteConfirm(null)}
                className="px-3 sm:px-4 py-2 border border-gray-300 text-xs sm:text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                Cancel
                  className="inline-flex items-center px-2 sm:px-4 py-2 border border-transparent text-xs sm:text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
              <button
            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
                className="px-3 sm:px-4 py-2 border border-transparent text-xs sm:text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
              >
                className="px-3 sm:px-4 py-2 border border-gray-300 text-xs sm:text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              </button>
            </div>
          </div>
        </div>
      )}
                className="px-3 sm:px-4 py-2 border border-transparent text-xs sm:text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
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