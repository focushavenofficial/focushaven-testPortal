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
  // Calculate marks using new scoring system: +4 for correct, -1 for incorrect
  const correctAnswers = result.detailedResults?.filter(r => r.isCorrect).length || 0;
  const totalQuestions = test.questions.length;
  const attempted = Object.keys(result.answers).filter(key => result.answers[key] !== undefined && result.answers[key] !== '').length;
  const incorrect = attempted - correctAnswers;
  const leftOut = totalQuestions - attempted;
  
  // New scoring system
  const marksObtained = (correctAnswers * 4) - (incorrect * 1);
  const totalMarks = totalQuestions * 4;
  const percentage = totalMarks > 0 ? Math.round((marksObtained / totalMarks) * 100) : 0;
  
  const accuracy = attempted > 0 ? Math.round((correctAnswers / attempted) * 100) : 0;
  const isPassed = percentage >= 40; // Assuming 40% is passing
  const grade = getGrade(percentage);

  // Generate submission ID and result number
  const submissionId = `#FH2025${String(Math.floor(Math.random() * 9999) + 1).padStart(4, '0')}`;
  const resultNumber = `2025FH24${String(Date.now() % 10000).padStart(4, '0')}`;

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
    
    // Set background color
    pdf.setFillColor(240, 248, 255); // Light blue background
    pdf.rect(0, 0, pageWidth, pageHeight, 'F');
    
    // Header with Focus Haven branding
    pdf.setFillColor(0, 102, 204); // Blue header
    pdf.rect(0, 0, pageWidth, 60, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(28);
    pdf.setFont('helvetica', 'bold');
    pdf.text('FOCUS HAVEN', pageWidth / 2, 25, { align: 'center' });
    
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Test Result Certificate', pageWidth / 2, 45, { align: 'center' });
    
    // Reset text color for body
    pdf.setTextColor(0, 0, 0);
    
    // Certificate border
    pdf.setDrawColor(0, 102, 204);
    pdf.setLineWidth(2);
    pdf.rect(15, 70, pageWidth - 30, pageHeight - 120, 'S');
    
    // Student Information Section
    let yPos = 90;
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text('STUDENT INFORMATION', 25, yPos);
    
    yPos += 20;
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    
    // Create boxes for information
    const boxHeight = 15;
    const leftCol = 25;
    const rightCol = 110;
    const boxWidth = 80;
    
    // Student Name Box
    pdf.setFillColor(255, 255, 255);
    pdf.rect(leftCol, yPos - 10, boxWidth, boxHeight, 'FD');
    pdf.setFont('helvetica', 'bold');
    pdf.text('Student Name:', leftCol + 2, yPos - 2);
    pdf.setFont('helvetica', 'normal');
    pdf.text(currentUser.name, leftCol + 2, yPos + 6);
    
    // Student ID Box
    pdf.rect(rightCol, yPos - 10, boxWidth, boxHeight, 'FD');
    pdf.setFont('helvetica', 'bold');
    pdf.text('Student ID:', rightCol + 2, yPos - 2);
    pdf.setFont('helvetica', 'normal');
    pdf.text(currentUser.id, rightCol + 2, yPos + 6);
    
    yPos += 25;
    
    // Test Name Box
    pdf.rect(leftCol, yPos - 10, boxWidth, boxHeight, 'FD');
    pdf.setFont('helvetica', 'bold');
    pdf.text('Test Name:', leftCol + 2, yPos - 2);
    pdf.setFont('helvetica', 'normal');
    const testTitle = test.title.length > 15 ? test.title.substring(0, 15) + '...' : test.title;
    pdf.text(testTitle, leftCol + 2, yPos + 6);
    
    // Submission ID Box
    pdf.rect(rightCol, yPos - 10, boxWidth, boxHeight, 'FD');
    pdf.setFont('helvetica', 'bold');
    pdf.text('Submission ID:', rightCol + 2, yPos - 2);
    pdf.setFont('helvetica', 'normal');
    pdf.text(submissionId, rightCol + 2, yPos + 6);
    
    yPos += 25;
    
    // Date Box
    pdf.rect(leftCol, yPos - 10, boxWidth, boxHeight, 'FD');
    pdf.setFont('helvetica', 'bold');
    pdf.text('Date:', leftCol + 2, yPos - 2);
    pdf.setFont('helvetica', 'normal');
    pdf.text(result.completedAt.toLocaleDateString(), leftCol + 2, yPos + 6);
    
    // Result Number Box
    pdf.rect(rightCol, yPos - 10, boxWidth, boxHeight, 'FD');
    pdf.setFont('helvetica', 'bold');
    pdf.text('Result Number:', rightCol + 2, yPos - 2);
    pdf.setFont('helvetica', 'normal');
    pdf.text(resultNumber, rightCol + 2, yPos + 6);
    
    // Test Results Section
    yPos += 40;
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text('TEST RESULTS', 25, yPos);
    
    yPos += 20;
    
    // Results in boxes
    const resultBoxWidth = 45;
    const spacing = 50;
    
    // Total Questions
    pdf.setFillColor(230, 240, 255);
    pdf.rect(leftCol, yPos - 10, resultBoxWidth, boxHeight, 'FD');
    pdf.setFont('helvetica', 'bold');
    pdf.text('Total Questions', leftCol + 2, yPos - 2);
    pdf.setFontSize(14);
    pdf.text(totalQuestions.toString(), leftCol + 20, yPos + 6);
    
    // Correct Answers
    pdf.setFillColor(230, 255, 230);
    pdf.rect(leftCol + spacing, yPos - 10, resultBoxWidth, boxHeight, 'FD');
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Correct', leftCol + spacing + 2, yPos - 2);
    pdf.setFontSize(14);
    pdf.text(correctAnswers.toString(), leftCol + spacing + 20, yPos + 6);
    
    // Incorrect Answers
    pdf.setFillColor(255, 230, 230);
    pdf.rect(leftCol + spacing * 2, yPos - 10, resultBoxWidth, boxHeight, 'FD');
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Incorrect', leftCol + spacing * 2 + 2, yPos - 2);
    pdf.setFontSize(14);
    pdf.text(incorrect.toString(), leftCol + spacing * 2 + 20, yPos + 6);
    
    // Unattempted
    pdf.setFillColor(255, 255, 230);
    pdf.rect(leftCol + spacing * 3, yPos - 10, resultBoxWidth, boxHeight, 'FD');
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Unattempted', leftCol + spacing * 3 + 2, yPos - 2);
    pdf.setFontSize(14);
    pdf.text(leftOut.toString(), leftCol + spacing * 3 + 20, yPos + 6);
    
    yPos += 30;
    
    // Marks and Grade Section
    pdf.setFillColor(255, 248, 220);
    pdf.rect(leftCol, yPos - 10, boxWidth, boxHeight, 'FD');
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Marks Obtained:', leftCol + 2, yPos - 2);
    pdf.setFontSize(14);
    pdf.text(`${marksObtained}/${totalMarks}`, leftCol + 2, yPos + 6);
    
    pdf.setFillColor(240, 255, 240);
    pdf.rect(rightCol, yPos - 10, boxWidth, boxHeight, 'FD');
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Percentage:', rightCol + 2, yPos - 2);
    pdf.setFontSize(14);
    pdf.text(`${percentage}%`, rightCol + 2, yPos + 6);
    
    yPos += 25;
    
    // Grade Box
    pdf.setFillColor(255, 240, 255);
    pdf.rect(leftCol, yPos - 10, boxWidth, boxHeight, 'FD');
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Grade:', leftCol + 2, yPos - 2);
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text(grade, leftCol + 30, yPos + 6);
    
    // Result Status Box
    const statusColor = isPassed ? [144, 238, 144] : [255, 182, 193];
    pdf.setFillColor(...statusColor);
    pdf.rect(rightCol, yPos - 10, boxWidth, boxHeight, 'FD');
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Result:', rightCol + 2, yPos - 2);
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(isPassed ? 0 : 139, isPassed ? 100 : 0, 0);
    pdf.text(isPassed ? 'PASS' : 'FAIL', rightCol + 25, yPos + 6);
    
    // Reset text color
    pdf.setTextColor(0, 0, 0);
    
    // Scoring Information
    yPos += 35;
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('SCORING SYSTEM', 25, yPos);
    
    yPos += 15;
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    pdf.text('• Correct Answer: +4 marks', 25, yPos);
    yPos += 10;
    pdf.text('• Incorrect Answer: -1 mark', 25, yPos);
    yPos += 10;
    pdf.text('• Unattempted: 0 marks', 25, yPos);
    
    // Footer
    const footerY = pageHeight - 40;
    pdf.setFillColor(0, 102, 204);
    pdf.rect(0, footerY - 10, pageWidth, 30, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'italic');
    pdf.text('This is a computer generated certificate. No signature required.', 25, footerY);
    
    pdf.text(`Generated on: ${new Date().toLocaleString()}`, pageWidth - 25, footerY, { align: 'right' });
    
    // Save the PDF
    pdf.save(`${currentUser.name}_${test.title}_Result_${submissionId}.pdf`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
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
              <h1 className="text-xl font-bold text-gray-900">Test Result Certificate</h1>
            </div>
            <button
              onClick={generatePDF}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Certificate
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Certificate Container */}
        <div className="bg-white rounded-lg shadow-xl border-4 border-blue-200 overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-8 text-center">
            <div className="mb-4">
              <FileText className="h-16 w-16 text-white mx-auto mb-4" />
              <h2 className="text-4xl font-bold mb-2">FOCUS HAVEN</h2>
              <p className="text-xl opacity-90">Test Result Certificate</p>
            </div>
          </div>

          {/* Student Information Section */}
          <div className="p-8 bg-gray-50">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Award className="h-6 w-6 mr-2 text-blue-600" />
              Student Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
                <label className="block text-sm font-bold text-gray-700 mb-1">Student Name</label>
                <p className="text-xl font-bold text-gray-900">{currentUser.name}</p>
              </div>
              
              <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
                <label className="block text-sm font-bold text-gray-700 mb-1">Student ID</label>
                <p className="text-xl font-bold text-gray-900">{currentUser.id}</p>
              </div>
              
              <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
                <label className="block text-sm font-bold text-gray-700 mb-1">Test Name</label>
                <p className="text-xl font-bold text-gray-900">{test.title}</p>
              </div>
              
              <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
                <label className="block text-sm font-bold text-gray-700 mb-1">Submission ID</label>
                <p className="text-xl font-bold text-blue-600">{submissionId}</p>
              </div>
              
              <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
                <label className="block text-sm font-bold text-gray-700 mb-1">Date</label>
                <p className="text-xl font-bold text-gray-900">{result.completedAt.toLocaleDateString()}</p>
              </div>
              
              <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
                <label className="block text-sm font-bold text-gray-700 mb-1">Result Number</label>
                <p className="text-xl font-bold text-green-600">{resultNumber}</p>
              </div>
            </div>
          </div>

          {/* Test Results Section */}
          <div className="p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Target className="h-6 w-6 mr-2 text-blue-600" />
              Test Results
            </h3>
            
            {/* Results Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-200 text-center">
                <div className="text-3xl font-bold text-blue-600">{totalQuestions}</div>
                <div className="text-sm font-medium text-gray-700">Total Questions</div>
              </div>
              
              <div className="bg-green-50 p-6 rounded-lg border-2 border-green-200 text-center">
                <div className="text-3xl font-bold text-green-600">{correctAnswers}</div>
                <div className="text-sm font-medium text-gray-700">Correct</div>
              </div>
              
              <div className="bg-red-50 p-6 rounded-lg border-2 border-red-200 text-center">
                <div className="text-3xl font-bold text-red-600">{incorrect}</div>
                <div className="text-sm font-medium text-gray-700">Incorrect</div>
              </div>
              
              <div className="bg-yellow-50 p-6 rounded-lg border-2 border-yellow-200 text-center">
                <div className="text-3xl font-bold text-yellow-600">{leftOut}</div>
                <div className="text-sm font-medium text-gray-700">Unattempted</div>
              </div>
            </div>

            {/* Marks and Grade */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-orange-50 p-6 rounded-lg border-2 border-orange-200 text-center">
                <label className="block text-sm font-bold text-gray-700 mb-2">Marks Obtained</label>
                <div className="text-4xl font-bold text-orange-600">{marksObtained}/{totalMarks}</div>
              </div>
              
              <div className="bg-purple-50 p-6 rounded-lg border-2 border-purple-200 text-center">
                <label className="block text-sm font-bold text-gray-700 mb-2">Percentage</label>
                <div className="text-4xl font-bold text-purple-600">{percentage}%</div>
              </div>
            </div>

            {/* Grade and Result */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-indigo-50 p-6 rounded-lg border-2 border-indigo-200 text-center">
                <label className="block text-sm font-bold text-gray-700 mb-2">Grade</label>
                <div className="text-5xl font-bold text-indigo-600">{grade}</div>
              </div>
              
              <div className={`p-6 rounded-lg border-2 text-center ${
                isPassed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
              }`}>
                <label className="block text-sm font-bold text-gray-700 mb-2">Result</label>
                <div className={`text-5xl font-bold flex items-center justify-center ${
                  isPassed ? 'text-green-600' : 'text-red-600'
                }`}>
                  {isPassed ? <CheckCircle className="h-12 w-12 mr-2" /> : <XCircle className="h-12 w-12 mr-2" />}
                  {isPassed ? 'PASS' : 'FAIL'}
                </div>
              </div>
            </div>

            {/* Scoring System */}
            <div className="bg-gray-50 p-6 rounded-lg border-2 border-gray-200">
              <h4 className="text-lg font-bold text-gray-900 mb-4">Scoring System</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <span><strong>Correct Answer:</strong> +4 marks</span>
                </div>
                <div className="flex items-center">
                  <XCircle className="h-5 w-5 text-red-500 mr-2" />
                  <span><strong>Incorrect Answer:</strong> -1 mark</span>
                </div>
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-yellow-500 mr-2" />
                  <span><strong>Unattempted:</strong> 0 marks</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-4 text-center">
            <p className="text-sm opacity-90 italic">
              This is a computer generated certificate. No signature required.
            </p>
            <p className="text-xs opacity-75 mt-2">
              Generated on: {new Date().toLocaleString()}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TestReport;