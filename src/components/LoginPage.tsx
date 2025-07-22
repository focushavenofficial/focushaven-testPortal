import React, { useState } from 'react';
import { Test, Question } from '../types';
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react';

interface CreateTestProps {
  onCreateTest: (test: Omit<Test, 'id' | 'createdAt'>) => void;
  onBack: () => void;
  createdBy: string;
}

const CreateTest: React.FC<CreateTestProps> = ({ onCreateTest, onBack, createdBy }) => {
  const [testTitle, setTestTitle] = useState('');
  const [testDescription, setTestDescription] = useState('');
  const [testDuration, setTestDuration] = useState(30);
  const [targetClass, setTargetClass] = useState<number | undefined>(undefined);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Partial<Question>>({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    type: 'multiple-choice',
    expectedAnswer: '',
    correctNumber: undefined
  });

  const handleAddQuestion = () => {
    const isValidQuestion = currentQuestion.question && (
      (currentQuestion.type === 'multiple-choice' && currentQuestion.options?.every(opt => opt.trim())) ||
      (currentQuestion.type === 'true-false') ||
      (currentQuestion.type === 'short-answer' && currentQuestion.expectedAnswer?.trim()) ||
      (currentQuestion.type === 'fill-in-blank' && currentQuestion.expectedAnswer?.trim()) ||
      (currentQuestion.type === 'real-number' && currentQuestion.correctNumber !== undefined)
    );

    if (isValidQuestion) {
      const newQuestion: Question = {
        id: Date.now().toString(),
        question: currentQuestion.question,
        options: currentQuestion.options || [],
        correctAnswer: currentQuestion.correctAnswer || 0,
        type: currentQuestion.type || 'multiple-choice',
        expectedAnswer: currentQuestion.expectedAnswer,
        correctNumber: currentQuestion.correctNumber
      };
      
      setQuestions([...questions, newQuestion]);
      setCurrentQuestion({
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        type: 'multiple-choice',
        expectedAnswer: '',
        correctNumber: undefined
      });
    }
  };

  const handleRemoveQuestion = (questionId: string) => {
    setQuestions(questions.filter(q => q.id !== questionId));
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...(currentQuestion.options || ['', '', '', ''])];
    newOptions[index] = value;
    setCurrentQuestion({ ...currentQuestion, options: newOptions });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (testTitle && testDescription && questions.length > 0) {
      onCreateTest({
        title: testTitle,
        description: testDescription,
        duration: testDuration,
        questions,
        createdBy,
        isActive: true,
        targetClass: targetClass
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={onBack}
                className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="hidden sm:block text-sm text-gray-600">
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Test Details */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Test Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Test Title
                </label>
                <input
                  type="text"
                  id="title"
                  value={testTitle}
                  onChange={(e) => setTestTitle(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  id="duration"
                  value={testDuration}
                  onChange={(e) => setTestDuration(parseInt(e.target.value))}
                  min="1"
                  max="180"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="targetClass" className="block text-sm font-medium text-gray-700 mb-2">
                  Target Class
                </label>
                <select
                  id="targetClass"
                  value={targetClass || ''}
                  onChange={(e) => setTargetClass(e.target.value ? parseInt(e.target.value) : undefined)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Classes</option>
                  <option value="1">Class 1</option>
                  <option value="2">Class 2</option>
                  <option value="3">Class 3</option>
                  <option value="4">Class 4</option>
                  <option value="5">Class 5</option>
                  <option value="6">Class 6</option>
                  <option value="7">Class 7</option>
                  <option value="8">Class 8</option>
                  <option value="9">Class 9</option>
                  <option value="10">Class 10</option>
                  <option value="11">Class 11</option>
                  <option value="12">Class 12</option>
                </select>
                <p className="mt-1 text-sm text-gray-500">
                  Leave empty to make test available to all classes
                </p>
              </div>
            </div>
            
            <div className="mt-6">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                value={testDescription}
                onChange={(e) => setTestDescription(e.target.value)}
                rows={3}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Add Question */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Add Question</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="questionType" className="block text-sm font-medium text-gray-700 mb-2">
                  Question Type
                </label>
                <select
                  id="questionType"
                  value={currentQuestion.type}
                  onChange={(e) => setCurrentQuestion({ 
                    ...currentQuestion, 
                    type: e.target.value as Question['type'],
                    options: e.target.value === 'multiple-choice' ? ['', '', '', ''] : [],
                    correctAnswer: 0,
                    expectedAnswer: '',
                    correctNumber: undefined
                  })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="multiple-choice">Multiple Choice</option>
                  <option value="true-false">True/False</option>
                  <option value="short-answer">Short Answer</option>
                  <option value="fill-in-blank">Fill in the Blank</option>
                  <option value="real-number">Real Number</option>
                </select>
              </div>

              <div>
                <label htmlFor="question" className="block text-sm font-medium text-gray-700 mb-2">
                  Question
                </label>
                <textarea
                  id="question"
                  value={currentQuestion.question}
                  onChange={(e) => setCurrentQuestion({ ...currentQuestion, question: e.target.value })}
                  rows={2}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your question here..."
                />
              </div>
              
              {currentQuestion.type === 'multiple-choice' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Answer Options
                </label>
                <div className="space-y-2">
                  {currentQuestion.options?.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="correct-answer"
                        checked={currentQuestion.correctAnswer === index}
                        onChange={() => setCurrentQuestion({ ...currentQuestion, correctAnswer: index })}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={`Option ${index + 1}`}
                      />
                      <span className="text-sm text-gray-500">
                        {currentQuestion.correctAnswer === index ? 'Correct' : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              )}

              {currentQuestion.type === 'true-false' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Correct Answer
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                      <input
                        type="radio"
                        name="true-false-answer"
                        checked={currentQuestion.correctAnswer === 1}
                        onChange={() => setCurrentQuestion({ ...currentQuestion, correctAnswer: 1 })}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <span className="ml-3 text-gray-900">True</span>
                    </label>
                    <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                      <input
                        type="radio"
                        name="true-false-answer"
                        checked={currentQuestion.correctAnswer === 0}
                        onChange={() => setCurrentQuestion({ ...currentQuestion, correctAnswer: 0 })}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <span className="ml-3 text-gray-900">False</span>
                    </label>
                  </div>
                </div>
              )}

              {(currentQuestion.type === 'short-answer' || currentQuestion.type === 'fill-in-blank') && (
                <div>
                  <label htmlFor="expectedAnswer" className="block text-sm font-medium text-gray-700 mb-2">
                    Expected Answer
                  </label>
                  <input
                    type="text"
                    id="expectedAnswer"
                    value={currentQuestion.expectedAnswer || ''}
                    onChange={(e) => setCurrentQuestion({ ...currentQuestion, expectedAnswer: e.target.value })}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={currentQuestion.type === 'fill-in-blank' ? 'Enter the word/phrase that fills the blank' : 'Enter the expected answer'}
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    AI will check similarity between student answers and this expected answer
                  </p>
                </div>
              )}

              {currentQuestion.type === 'real-number' && (
                <div>
                  <label htmlFor="correctNumber" className="block text-sm font-medium text-gray-700 mb-2">
                    Correct Number
                  </label>
                  <input
                    type="number"
                    id="correctNumber"
                    step="0.001"
                    value={currentQuestion.correctNumber || ''}
                    onChange={(e) => setCurrentQuestion({ ...currentQuestion, correctNumber: parseFloat(e.target.value) || undefined })}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter the correct number (up to 3 decimal places)"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Numbers will be compared up to 3 decimal places for accuracy
                  </p>
                </div>
              )}
              
              <button
                type="button"
                onClick={handleAddQuestion}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Question
              </button>
            </div>
          </div>

          {/* Questions List */}
          {questions.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Questions ({questions.length})
              </h2>
              
              <div className="space-y-4">
                {questions.map((question, index) => (
                  <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-2">
                          {index + 1}. {question.question}
                        </h3>
                        {question.type === 'multiple-choice' && (
                        <div className="space-y-1">
                          {question.options.map((option, optIndex) => (
                            <div key={optIndex} className="flex items-center text-sm">
                              <span className={`inline-block w-4 h-4 rounded-full mr-2 ${
                                optIndex === question.correctAnswer ? 'bg-green-500' : 'bg-gray-300'
                              }`}></span>
                              <span className={optIndex === question.correctAnswer ? 'font-medium text-green-700' : 'text-gray-600'}>
                                {option}
                              </span>
                            </div>
                          ))}
                        </div>
                        )}
                        {(question.type === 'short-answer' || question.type === 'fill-in-blank') && (
                          <div className="mt-2">
                            <div className="text-sm text-gray-600">
                              <span className="font-medium">Type:</span> {
                                question.type === 'short-answer' ? 'Short Answer' : 
                                question.type === 'fill-in-blank' ? 'Fill in the Blank' :
                                question.type === 'true-false' ? 'True/False' :
                                question.type === 'real-number' ? 'Real Number' :
                                'Multiple Choice'
                              }
                            </div>
                            <div className="text-sm text-gray-600">
                              <span className="font-medium">Expected Answer:</span> {question.expectedAnswer}
                            </div>
                          </div>
                        )}
                        {question.type === 'real-number' && (
                          <div className="mt-2">
                            <div className="text-sm text-gray-600">
                              <span className="font-medium">Type:</span> Real Number
                            </div>
                            <div className="text-sm text-gray-600">
                              <span className="font-medium">Correct Answer:</span> {question.correctNumber}
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                          </div>
              <div className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full hidden sm:block">
                        {question.type === 'true-false' && (
                          <div className="mt-2">
                            <div className="text-sm text-gray-600">
          <div className="text-center mb-6 sm:mb-8">
                            </div>
                            <div className="text-sm text-gray-600">
                              <span className="font-medium">Correct Answer:</span> {question.correctAnswer === 1 ? 'True' : 'False'}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                          </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                        <div className="mt-1 text-xs text-gray-500 capitalize">{question.type.replace('-', ' ')}</div>
                      </div>
            <p className="text-sm sm:text-base md:text-lg text-gray-600 mb-1">Test Portal</p>
                        type="button"
                        onClick={() => handleRemoveQuestion(question.id)}
                        className="ml-4 p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg">
                    </div>
                  </div>
                ))}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            </div>
          )}

          {/* Submit */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!testTitle || !testDescription || questions.length === 0}
              className="w-full bg-blue-600 text-white py-2 sm:py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base"
            >
              <Save className="h-5 w-5 mr-2" />
              Create Test
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default CreateTest;
          <div className="mt-6 sm:mt-8 text-center">