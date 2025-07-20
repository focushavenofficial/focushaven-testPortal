import React, { useState, useEffect } from 'react';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import TestTaking from './components/TestTaking';
import CreateTest from './components/CreateTest';
import Results from './components/Results';
import { User, Test, TestResult } from './types';
import { TestService } from './services/testService';
import { AstraAuthService } from './services/astraAuthService';

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<'dashboard' | 'test' | 'create' | 'results'>('dashboard');
  const [selectedTest, setSelectedTest] = useState<Test | null>(null);
  const [tests, setTests] = useState<Test[]>([]);
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load data when user logs in
  useEffect(() => {
    if (currentUser) {
      loadData();
    }
  }, [currentUser]);

  const loadData = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const [testsData, resultsData] = await Promise.all([
        TestService.getTests(currentUser.role, currentUser.id),
        TestService.getTestResults(currentUser.role, currentUser.id)
      ]);
      
      setTests(testsData);
      setResults(resultsData);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (userId: string, passcode: string): Promise<boolean> => {
    try {
      // Try Astra DB authentication first
      let user = await AstraAuthService.authenticateUser(userId, passcode);
      
      // If Astra DB authentication fails, try Supabase as fallback
      if (!user) {
        console.log('Astra DB authentication failed, trying Supabase fallback');
        const { AuthService } = await import('./services/authService');
        user = await AuthService.authenticateUser(userId, passcode);
      }
      
      if (user) {
        setCurrentUser(user);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      setError('Login failed. Please try again.');
      return false;
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('dashboard');
    setSelectedTest(null);
    setTests([]);
    setResults([]);
    setError(null);
  };

  const handleCreateTest = async (test: Omit<Test, 'id' | 'createdAt'>) => {
    if (!currentUser) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const newTest = await TestService.createTest(test);
      setTests(prev => [newTest, ...prev]);
      setCurrentView('dashboard');
    } catch (err) {
      console.error('Error creating test:', err);
      setError('Failed to create test. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartTest = (test: Test) => {
    setSelectedTest(test);
    setCurrentView('test');
  };

  const handleSubmitTest = async (testId: string, answers: Record<string, number>, score: number) => {
    if (!currentUser) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await TestService.submitTestResult({
        testId,
        userId: currentUser.id,
        answers,
        score
      });
      
      setResults(prev => [result, ...prev]);
      setCurrentView('results');
      setSelectedTest(null);
    } catch (err) {
      console.error('Error submitting test:', err);
      setError('Failed to submit test. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTest = async (testId: string, updates: Partial<Test>) => {
    if (!currentUser) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const updatedTest = await TestService.updateTest(testId, updates);
      setTests(prev => prev.map(test => test.id === testId ? updatedTest : test));
    } catch (err) {
      console.error('Error updating test:', err);
      setError('Failed to update test. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTest = async (testId: string) => {
    if (!currentUser) return;
    
    setLoading(true);
    setError(null);
    
    try {
      await TestService.deleteTest(testId);
      setTests(prev => prev.filter(test => test.id !== testId));
      setResults(prev => prev.filter(result => result.testId !== testId));
    } catch (err) {
      console.error('Error deleting test:', err);
      setError('Failed to delete test. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  if (loading && tests.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
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
      
      {currentView === 'dashboard' && (
        <Dashboard
          user={currentUser}
          tests={tests}
          onLogout={handleLogout}
          onCreateTest={() => setCurrentView('create')}
          onStartTest={handleStartTest}
          onViewResults={() => setCurrentView('results')}
          onUpdateTest={handleUpdateTest}
          onDeleteTest={handleDeleteTest}
        />
      )}
      
      {currentView === 'test' && selectedTest && (
        <TestTaking
          test={selectedTest}
          onSubmit={handleSubmitTest}
          onBack={() => setCurrentView('dashboard')}
        />
      )}
      
      {currentView === 'create' && (
        <CreateTest
          onCreateTest={handleCreateTest}
          onBack={() => setCurrentView('dashboard')}
          createdBy={currentUser.id}
        />
      )}
      
      {currentView === 'results' && (
        <Results
          results={results}
          tests={tests}
          currentUser={currentUser}
          onBack={() => setCurrentView('dashboard')}
        />
      )}
    </div>
  );
}

export default App;