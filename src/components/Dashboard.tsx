import React from 'react';
import { User, Test } from '../types';
import { BookOpen, Plus, BarChart3, LogOut, Clock, Users, FileText } from 'lucide-react';

interface DashboardProps {
  user: User;
  tests: Test[];
  onLogout: () => void;
  onCreateTest: () => void;
  onStartTest: (test: Test) => void;
  onViewResults: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  user,
  tests,
  onLogout,
  onCreateTest,
  onStartTest,
  onViewResults
}) => {
  const userTests = tests.filter(test => 
    user.role === 'student' ? test.isActive : 
    user.role === 'teacher' ? test.createdBy === user.id : 
    true
  );

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <h1 className="ml-2 text-xl font-bold text-gray-900">Test Portal</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Welcome, <span className="font-medium text-gray-900">{user.name}</span>
              </div>
              <div className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
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
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">{userTests.length}</div>
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
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create New Test
            </button>
          )}
          
          <button
            onClick={onViewResults}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            View Results
          </button>
        </div>

        {/* Tests Grid */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
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
                <div key={test.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <h4 className="text-lg font-medium text-gray-900">{test.title}</h4>
                        <div className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${
                          test.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {test.isActive ? 'Active' : 'Inactive'}
                        </div>
                      </div>
                      <p className="text-gray-600 mt-1">{test.description}</p>
                      <div className="flex items-center text-sm text-gray-500 mt-2">
                        <Clock className="h-4 w-4 mr-1" />
                        {test.duration} minutes
                        <span className="mx-2">•</span>
                        {test.questions.length} questions
                        <span className="mx-2">•</span>
                        Created {test.createdAt.toLocaleDateString()}
                      </div>
                    </div>
                    
                    {user.role === 'student' && test.isActive && (
                      <button
                        onClick={() => onStartTest(test)}
                        className="ml-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                      >
                        Start Test
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;