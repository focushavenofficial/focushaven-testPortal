import React, { useState } from 'react';
import { TestResult, Test, User } from '../types';
import { ArrowLeft, BarChart3, TrendingUp, Award, Clock, User as UserIcon, Eye } from 'lucide-react';

interface ResultsProps {
  results: TestResult[];
  tests: Test[];
  currentUser: User;
  onBack: () => void;
  onViewResult: (result: TestResult) => void;
}

const Results: React.FC<ResultsProps> = ({ results, tests, currentUser, onBack, onViewResult }) => {
  const [selectedTest, setSelectedTest] = useState<string>('all');

  const filteredResults = selectedTest === 'all' 
    ? results 
    : results.filter(result => result.testId === selectedTest);

  const getTestById = (testId: string) => {
    return tests.find(test => test.id === testId);
  };

  const getAverageScore = () => {
    if (filteredResults.length === 0) return 0;
    const total = filteredResults.reduce((sum, result) => sum + result.score, 0);
    return Math.round(total / filteredResults.length);
  };

  const getHighestScore = () => {
    if (filteredResults.length === 0) return 0;
    return Math.max(...filteredResults.map(result => result.score));
  };

  const getScoreDistribution = () => {
    const distribution = { excellent: 0, good: 0, fair: 0, poor: 0 };
    filteredResults.forEach(result => {
      if (result.score >= 90) distribution.excellent++;
      else if (result.score >= 80) distribution.good++;
      else if (result.score >= 60) distribution.fair++;
      else distribution.poor++;
    });
    return distribution;
  };

  const distribution = getScoreDistribution();

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
              <h1 className="text-xl font-bold text-gray-900">
                {currentUser.role === 'student' ? 'My Results' : 'Test Results'}
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter */}
        <div className="mb-6">
          <label htmlFor="test-filter" className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Test
          </label>
          <select
            id="test-filter"
            value={selectedTest}
            onChange={(e) => setSelectedTest(e.target.value)}
            className="block w-full md:w-auto px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Tests</option>
            {tests.map(test => (
              <option key={test.id} value={test.id}>{test.title}</option>
            ))}
          </select>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BarChart3 className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">{filteredResults.length}</div>
                <div className="text-sm text-gray-600">Total Attempts</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">{getAverageScore()}%</div>
                <div className="text-sm text-gray-600">Average Score</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Award className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">{getHighestScore()}%</div>
                <div className="text-sm text-gray-600">Highest Score</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserIcon className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">{distribution.excellent}</div>
                <div className="text-sm text-gray-600">Excellent (90%+)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Score Distribution */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Score Distribution</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{distribution.excellent}</div>
              <div className="text-sm text-gray-600">Excellent (90-100%)</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{distribution.good}</div>
              <div className="text-sm text-gray-600">Good (80-89%)</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">{distribution.fair}</div>
              <div className="text-sm text-gray-600">Fair (60-79%)</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">{distribution.poor}</div>
              <div className="text-sm text-gray-600">Poor (Below 60%)</div>
            </div>
          </div>
        </div>

        {/* Results Table */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Recent Results</h2>
          </div>
          
          {filteredResults.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No results available.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Test
                    </th>
                    {currentUser.role !== 'student' && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student
                      </th>
                    )}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Completed
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredResults
                    .sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime())
                    .map((result) => {
                      const test = getTestById(result.testId);
                      return (
                        <tr key={result.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {test?.title || 'Unknown Test'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {Object.keys(result.answers).length} questions answered
                            </div>
                          </td>
                          {currentUser.role !== 'student' && (
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{result.userId}</div>
                            </td>
                          )}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                result.score >= 90 ? 'bg-green-100 text-green-800' :
                                result.score >= 80 ? 'bg-blue-100 text-blue-800' :
                                result.score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {result.score}%
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center text-sm text-gray-900">
                              <Clock className="h-4 w-4 mr-1 text-gray-400" />
                              {result.completedAt.toLocaleDateString()} at {result.completedAt.toLocaleTimeString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => onViewResult(result)}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              Review
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Results;