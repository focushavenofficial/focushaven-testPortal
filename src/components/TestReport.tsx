import React from 'react';
import { TestResult, Test, User } from '../types';
import { ArrowLeft, Download, FileText, Award, Clock, CheckCircle, XCircle, Target } from 'lucide-react';
import jsPDF from 'jspdf';

interface TestReportProps {
  result: TestResult;
  test: Test;
  currentUser: User;
  onBack: () => void;
}

const TestReport: React.FC<TestReportProps> = ({ result, test, currentUser, onBack }) => {
  const correctAnswers = result.detailedResults?.filter(r => r.isCorrect).length || 0;
  const totalQuestions = test.questions.length;
  const attempted = Object.keys(result.answers).filter(key => result.answers[key] !== undefined && result.answers[key] !== '').length;
  const incorrect = attempted - correctAnswers;
  const leftOut = totalQuestions - attempted;
  const accuracy = attempted > 0 ? Math.round((correctAnswers / attempted) * 100) : 0;
  const isPassed = result.score >= 60;
  const grade = getGrade(result.score);

  function getGrade(score: number): string {
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B+';
    if (score >= 60) return 'B';
    if (score >= 50) return 'C';
    if (score >= 40) return 'D';
    return 'F';
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }
    return `${minutes}m ${secs}s`;
  };

  const generatePDF = () => {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.width;
    const pageHeight = pdf.internal.pageSize.height;
    
    // Header with logo placeholder and company name
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('FOCUS HAVEN', pageWidth / 2, 30, { align: 'center' });
    
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Test Portal Report', pageWidth / 2, 45, { align: 'center' });
    
    // Draw a line under header
    pdf.line(20, 55, pageWidth - 20, 55);
    
    // Student Information
    let yPos = 75;
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('STUDENT INFORMATION', 20, yPos);
    
    yPos += 15;
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    
    // Student info table
    const studentInfo = [
      ['Student Name:', currentUser.name],
      ['Student ID:', currentUser.id],
      ['Test Name:', test.title],
      ['Test Start Time:', result.startedAt.toLocaleString()],
      ['Test End Time:', result.completedAt.toLocaleString()],
      ['Total Time Spent:', formatTime(result.timeSpent)]
    ];
    
    studentInfo.forEach(([label, value]) => {
      pdf.text(label, 25, yPos);
      pdf.text(value, 100, yPos);
      yPos += 12;
    });
    
    // Test Results Section
    yPos += 10;
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('TEST RESULTS', 20, yPos);
    
    yPos += 15;
    
    // Results table
    const tableData = [
      ['Metric', 'Value'],
      ['Total Questions', totalQuestions.toString()],
      ['Questions Attempted', attempted.toString()],
      ['Correct Answers', correctAnswers.toString()],
      ['Incorrect Answers', incorrect.toString()],
      ['Questions Left Out', leftOut.toString()],
      ['Accuracy (%)', `${accuracy}%`],
      ['Overall Score (%)', `${result.score}%`],
      ['Grade', grade],
      ['Result', isPassed ? 'PASS' : 'FAIL']
    ];
    
    // Draw table
    const tableStartY = yPos;
    const rowHeight = 12;
    const col1Width = 80;
    const col2Width = 60;
    
    tableData.forEach((row, index) => {
      const currentY = tableStartY + (index * rowHeight);
      
      // Draw borders
      pdf.rect(25, currentY - 8, col1Width, rowHeight);
      pdf.rect(25 + col1Width, currentY - 8, col2Width, rowHeight);
      
      // Header row styling
      if (index === 0) {
        pdf.setFont('helvetica', 'bold');
        pdf.setFillColor(240, 240, 240);
        pdf.rect(25, currentY - 8, col1Width + col2Width, rowHeight, 'F');
      } else {
        pdf.setFont('helvetica', 'normal');
      }
      
      // Result row styling
      if (index === tableData.length - 1) {
        pdf.setFont('helvetica', 'bold');
        if (isPassed) {
          pdf.setTextColor(0, 128, 0); // Green for pass
        } else {
          pdf.setTextColor(255, 0, 0); // Red for fail
        }
      }
      
      pdf.text(row[0], 30, currentY);
      pdf.text(row[1], 30 + col1Width, currentY);
      
      // Reset text color
      pdf.setTextColor(0, 0, 0);
    });
    
    // Performance Analysis
    yPos = tableStartY + (tableData.length * rowHeight) + 20;
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('PERFORMANCE ANALYSIS', 20, yPos);
    
    yPos += 15;
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    
    let performanceText = '';
    if (result.score >= 90) {
      performanceText = 'Excellent performance! You have demonstrated outstanding knowledge.';
    } else if (result.score >= 80) {
      performanceText = 'Very good performance! You have shown strong understanding.';
    } else if (result.score >= 70) {
      performanceText = 'Good performance! You have adequate knowledge with room for improvement.';
    } else if (result.score >= 60) {
      performanceText = 'Satisfactory performance! You have met the minimum requirements.';
    } else {
      performanceText = 'Below expectations. Additional study and practice recommended.';
    }
    
    const splitText = pdf.splitTextToSize(performanceText, pageWidth - 40);
    pdf.text(splitText, 20, yPos);
    
    // Footer
    const footerY = pageHeight - 30;
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'italic');
    pdf.text('This is a computer generated report, no authority signature is required.', 20, footerY);
    
    // Date generated
    pdf.text(`Generated on: ${new Date().toLocaleString()}`, pageWidth - 20, footerY, { align: 'right' });
    
    // Save the PDF
    pdf.save(`${currentUser.name}_${test.title}_Report.pdf`);
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
              <h1 className="text-xl font-bold text-gray-900">Test Report</h1>
            </div>
            <button
              onClick={generatePDF}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Card */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-6 text-center">
          <div className="mb-4">
            <FileText className="h-16 w-16 text-amber-600 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-900">FOCUS HAVEN</h2>
            <p className="text-lg text-gray-600 mt-2">Test Portal Report</p>
          </div>
          
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{test.title}</h3>
            <div className={`inline-flex items-center px-6 py-3 rounded-full text-xl font-bold ${
              isPassed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {isPassed ? <CheckCircle className="h-6 w-6 mr-2" /> : <XCircle className="h-6 w-6 mr-2" />}
              {isPassed ? 'PASSED' : 'FAILED'} - {result.score}%
            </div>
          </div>
        </div>

        {/* Student Information */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Award className="h-5 w-5 mr-2 text-amber-600" />
            Student Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Student Name</label>
                <p className="text-lg font-semibold text-gray-900">{currentUser.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Student ID</label>
                <p className="text-lg font-semibold text-gray-900">{currentUser.id}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Test Name</label>
                <p className="text-lg font-semibold text-gray-900">{test.title}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Test Start Time</label>
                <p className="text-lg font-semibold text-gray-900">{result.startedAt.toLocaleString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Test End Time</label>
                <p className="text-lg font-semibold text-gray-900">{result.completedAt.toLocaleString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Total Time Spent</label>
                <p className="text-lg font-semibold text-gray-900 flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {formatTime(result.timeSpent)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Test Results Table */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Target className="h-5 w-5 mr-2 text-amber-600" />
            Test Results
          </h3>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Metric
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Value
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Total Questions</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">{totalQuestions}</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Questions Attempted</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">{attempted}</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Correct Answers</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold">{correctAnswers}</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Incorrect Answers</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-semibold">{incorrect}</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Questions Left Out</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-semibold">{leftOut}</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Accuracy (%)</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-semibold">{accuracy}%</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Overall Score (%)</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                    <span className={result.score >= 60 ? 'text-green-600' : 'text-red-600'}>
                      {result.score}%
                    </span>
                  </td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Grade</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      grade === 'A+' || grade === 'A' ? 'bg-green-100 text-green-800' :
                      grade === 'B+' || grade === 'B' ? 'bg-blue-100 text-blue-800' :
                      grade === 'C' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {grade}
                    </span>
                  </td>
                </tr>
                <tr className="bg-yellow-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Qualification</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold">
                    <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                      isPassed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {isPassed ? 'PASS' : 'FAIL'}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Performance Analysis */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Analysis</h3>
          
          <div className="bg-blue-50 border-l-4 border-amber-400 p-4 rounded-r-lg">
            <p className="text-gray-700">
              {result.score >= 90 ? '🎉 Excellent performance! You have demonstrated outstanding knowledge and understanding of the subject matter.' :
               result.score >= 80 ? '👍 Very good performance! You have shown strong understanding with minor areas for improvement.' :
               result.score >= 70 ? '👌 Good performance! You have adequate knowledge with some room for improvement.' :
               result.score >= 60 ? '📚 Satisfactory performance! You have met the minimum requirements but should focus on strengthening your knowledge.' :
               '⚠️ Below expectations. Additional study and practice are strongly recommended to improve your understanding.'}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-100 rounded-lg p-4 text-center">
          <p className="text-sm text-gray-600 italic">
            This is a computer generated report, no authority signature is required.
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Generated on: {new Date().toLocaleString()}
          </p>
        </div>
      </main>
    </div>
  );
};

export default TestReport;