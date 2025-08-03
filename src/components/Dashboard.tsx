import React from 'react';
import { User, Test } from '../types';
import { BookOpen, Plus, BarChart3, LogOut, Clock, Users, FileText, MoreVertical, Edit, Trash2, EyeOff, Eye, MessageSquare, RefreshCw, Calendar } from 'lucide-react';
import { getSubjectName, subList } from '../constants/subjects';

interface DashboardProps {
  user: User;
  tests: Test[];
  onLogout: () => void;
  onCreateTest: () => void;
  onStartTest: (test: Test) => void;
  onViewResults: () => void;
  onViewReviewRequests?: () => void;
  onUpdateTest?: (testId: string, updates: Partial<Test>) => void;
  onDeleteTest?: (testId: string) => void;
  onEditTest?: (test: Test) => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  user,
  tests,
  onLogout,
  onCreateTest,
  onStartTest,
  onViewResults,
  onViewReviewRequests,
  onUpdateTest,
  onDeleteTest,
  onEditTest
}) => {
  const [showDropdown, setShowDropdown] = React.useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState<string | null>(null);
  const [subjectFilter, setSubjectFilter] = React.useState<string>('all');
  const [currentDateTime, setCurrentDateTime] = React.useState(new Date());

  // Update date/time every second
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);
  const userTests = tests.filter(test => 
    user.role === 'student' ? test.isActive : 
    user.role === 'teacher' ? test.createdBy === user.id : 
    true
  );

  const filteredTests = subjectFilter === 'all' 
    ? userTests 
    : userTests.filter(test => test.subject === subjectFilter);
  const handleToggleActive = async (testId: string, currentStatus: boolean) => {
  const handleRefresh = () => {
    window.location.reload();
  };

  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    return date.toLocaleDateString('en-US', options);
  };

  const formatTime = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    };
    return date.toLocaleTimeString('en-US', options);
  };
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-amber-900" />
              <h1 className="ml-2 text-xl font-bold text-gray-900">Test Portal</h1>
            </div>
            
            {/* Date/Time Display */}
            <div className="hidden md:flex items-center space-x-4 text-sm">
              <div className="flex items-center text-gray-600">
                <Calendar className="h-4 w-4 mr-2" />
                <div className="text-center">
                  <div className="font-medium">{formatDate(currentDateTime)}</div>
                  <div className="text-xs text-gray-500">{formatTime(currentDateTime)}</div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Mobile Date/Time */}
              <div className="md:hidden flex items-center text-xs text-gray-600">
                <Calendar className="h-3 w-3 mr-1" />
                <div>
                  <div>{currentDateTime.toLocaleDateString()}</div>
                  <div>{formatTime(currentDateTime)}</div>
                </div>
              </div>
              
              <button
                onClick={handleRefresh}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
                title="Refresh Page"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
              
              <div className="text-sm text-gray-600">
                Welcome, <span className="font-medium text-gray-900">{user.name}</span>
              </div>
              <div className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full">
                {user.role}
              </div>
              <button
                onClick={onLogout}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Greeting */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            {getGreeting()}, {user.name}!
          </h2>
          <p className="text-gray-600 mt-1">
            {user.role === 'student' ? 'Ready to take some tests?' : 
             user.role === 'teacher' ? 'Manage your tests and view student progress.' :
             'Monitor the entire platform and user activities.'}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className="h-8 w-8 text-amber-900" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">{filteredTests.length}</div>
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
                <div className="text-2xl font-bold text-gray-900">
                  {filteredTests.filter(t => t.isActive).length}
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
                <div className="text-2xl font-bold text-gray-900">
                  {user.role === 'student' ? 'Student' : user.role === 'teacher' ? 'Teacher' : 'Admin'}
                </div>
                <div className="text-sm text-gray-600">Your Role</div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-8">
          {(user.role === 'teacher' || user.role === 'admin') && (
            <button
              onClick={onCreateTest}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create New Test
            </button>
          )}
          
          <button
            onClick={onViewResults}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            View Results
          </button>
          
          {(user.role === 'teacher' || user.role === 'admin') && onViewReviewRequests && (
            <button
              onClick={onViewReviewRequests}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Review Requests
            </button>
          )}
        </div>

        {/* Subject Filter */}
        <div className="mb-6">
          <label htmlFor="subject-filter" className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Subject
          </label>
          <select
            id="subject-filter"
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="block w-full md:w-auto px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          >
            <option value="all">All Subjects</option>
            {subList.map(subject => (
              <option key={subject.code} value={subject.code}>{subject.name}</option>
            ))}
          </select>
        </div>
        {/* Tests Grid */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              {user.role === 'student' ? 'Available Tests' : 'Your Tests'}
            </h3>
          </div>
          
          {filteredTests.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {subjectFilter === 'all' ? 'No tests available at the moment.' : `No tests available for ${getSubjectName(subjectFilter)}.`}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredTests.map((test) => (
                <div key={test.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <h4 className="text-lg font-medium text-gray-900">{test.title}</h4>
                        <div className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${
                          test.isActive ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {test.isActive ? 'Active' : 'Inactive'}
                        </div>
                        {test.subject && (
                          <div className="ml-2 px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                            {getSubjectName(test.subject)}
                          </div>
                        )}
                      </div>
                      <p className="text-gray-600 mt-1">{test.description}</p>
                      <div className="flex items-center text-sm text-gray-500 mt-2">
                        <Clock className="h-4 w-4 mr-1" />
                        {test.duration} minutes
                        <span className="mx-2">•</span>
                        {test.questions.length} questions
                        <span className="mx-2">•</span>
                        Created {test.createdAt.toLocaleDateString()}
                        {user.role === 'admin' && test.createdBy !== user.id && (
                          <>
                            <span className="mx-2">•</span>
                            <span className="text-blue-600">By: {test.createdBy}</span>
                          </>
                        )}
                        {test.targetClass && (
                          <>
                            <span className="mx-2">•</span>
                            <span className="text-purple-600">Class {test.targetClass}</span>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {user.role === 'student' && test.isActive && (
                        <button
                          onClick={() => onStartTest(test)}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors"
                        >
                          Start Test
                        </button>
                      )}
                      
                      {(user.role === 'admin' || (user.role === 'teacher' && test.createdBy === user.id)) && (
                        <div className="relative">
                          <button
                            onClick={() => setShowDropdown(showDropdown === test.id ? null : test.id)}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                          >
                            <MoreVertical className="h-5 w-5" />
                          </button>
                          
                          {showDropdown === test.id && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                              <div className="py-1">
                                {onEditTest && (
                                  <button
                                    onClick={() => {
                                      onEditTest(test);
                                      setShowDropdown(null);
                                    }}
                                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                  >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit Test
                                  </button>
                                )}
                                
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
                                  Delete Test
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <Trash2 className="h-6 w-6 text-red-500 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Delete Test</h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this test? This action cannot be undone and will also delete all associated test results.
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteTest(showDeleteConfirm)}
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
              >
                Delete Test
              </button>
            </div>
          </div>
        </div>
      )}

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