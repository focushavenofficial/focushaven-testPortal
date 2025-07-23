import { supabase } from '../lib/supabase';
import { Test, TestResult } from '../types';
import { AIService } from './aiService';

export class TestService {
  static async createTest(test: Omit<Test, 'id' | 'createdAt'>): Promise<Test> {
    const { data, error } = await supabase
      .from('tests')
      .insert({
        title: test.title,
        description: test.description,
        duration: test.duration,
        questions: test.questions,
        created_by: test.createdBy,
        is_active: test.isActive,
        target_class: test.targetClass
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      title: data.title,
      description: data.description,
      duration: data.duration,
      questions: data.questions,
      createdBy: data.created_by,
      createdAt: new Date(data.created_at),
      isActive: data.is_active,
      targetClass: data.target_class
    };
  }

  static async getTests(userRole: string, userId?: string, userClass?: number): Promise<Test[]> {
    let query = supabase.from('tests').select('*');

    // Apply filters based on user role
    if (userRole === 'student') {
      // Students see active tests that are either:
      query = query.eq('is_active', true);
      
      // Debug: Log the user class
      console.log('User class:', userClass);
      
      if (userClass === 0 || userClass === undefined || userClass === null) {
        // Class 0 or no class: see all active tests
        console.log('User has class 0 or no class - showing all tests');
      } else {
        // Specific class: only see tests for their class or general tests
        console.log(`User has class ${userClass} - filtering tests`);
        // Use a more explicit filter
        const { data: allTests, error: fetchError } = await supabase
          .from('tests')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false });
          
        if (fetchError) throw fetchError;
        
        // Filter in JavaScript for more control
        const filteredTests = allTests.filter(test => {
          const targetClass = test.target_class;
          console.log(`Test "${test.title}" has target_class:`, targetClass, 'User class:', userClass);
          
          // Show test if:
          // 1. No target class (available to all)
          // 2. Target class is 0 (available to all)
          // 3. Target class matches user's class
          const shouldShow = targetClass === null || targetClass === 0 || targetClass === userClass;
          console.log(`Should show test "${test.title}":`, shouldShow);
          return shouldShow;
        });
        
        return filteredTests.map(test => ({
          id: test.id,
          title: test.title,
          description: test.description,
          duration: test.duration,
          questions: test.questions,
          createdBy: test.created_by,
          createdAt: new Date(test.created_at),
          isActive: test.is_active,
          targetClass: test.target_class
        }));
      }
    } else if (userRole === 'teacher') {
      query = query.eq('created_by', userId);
    }
    // Admin can see all tests (no additional filter)

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(test => ({
      id: test.id,
      title: test.title,
      description: test.description,
      duration: test.duration,
      questions: test.questions,
      createdBy: test.created_by,
      createdAt: new Date(test.created_at),
      isActive: test.is_active,
      targetClass: test.target_class
    }));
  }

  static async submitTestResult(result: Omit<TestResult, 'id' | 'completedAt'>, test: Test): Promise<TestResult> {
    // Calculate detailed results with AI checking for text answers
    const detailedResults = await Promise.all(
      test.questions.map(async (question) => {
        const userAnswer = result.answers[question.id];
        let isCorrect = false;
        let similarityScore: number | undefined;
        let marksAwarded = 0;
        const totalMarks = question.marks || 1;

        if (question.type === 'multiple-choice' || question.type === 'true-false') {
          if (userAnswer === question.correctAnswer) {
            isCorrect = true;
            marksAwarded = totalMarks;
          }
        } else if (question.type === 'short-answer' || question.type === 'fill-in-blank') {
          if (question.expectedAnswer && typeof userAnswer === 'string') {
            similarityScore = await AIService.checkSimilarity(userAnswer, question.expectedAnswer);
            isCorrect = await AIService.isAnswerCorrect(userAnswer, question.expectedAnswer);
            
            // Award marks based on similarity score for short answer questions
            if (question.type === 'short-answer' && similarityScore !== undefined) {
              if (similarityScore >= 0.9) {
                marksAwarded = totalMarks;
              } else if (similarityScore >= 0.7) {
                marksAwarded = Math.round(totalMarks * 0.75);
              } else if (similarityScore >= 0.5) {
                marksAwarded = Math.round(totalMarks * 0.5);
              } else if (similarityScore >= 0.3) {
                marksAwarded = Math.round(totalMarks * 0.25);
              }
            } else if (isCorrect) {
              marksAwarded = totalMarks;
            }
          }
        } else if (question.type === 'real-number') {
          if (question.correctNumber !== undefined && typeof userAnswer === 'string') {
            if (AIService.checkRealNumber(userAnswer, question.correctNumber)) {
              isCorrect = true;
              marksAwarded = totalMarks;
            }
          }
        }

        return {
          questionId: question.id,
          userAnswer,
          correctAnswer: question.expectedAnswer || question.correctNumber || question.correctAnswer,
          isCorrect,
          similarityScore,
          marksAwarded
        };
      })
    );

    // Calculate score based on marks awarded
    const totalMarksAwarded = detailedResults.reduce((sum, r) => sum + (r.marksAwarded || 0), 0);
    const totalPossibleMarks = test.questions.reduce((sum, q) => sum + (q.marks || 1), 0);
    const calculatedScore = Math.round((totalMarksAwarded / totalPossibleMarks) * 100);

    const { data, error } = await supabase
      .from('test_results')
      .insert({
        test_id: result.testId,
        user_id: result.userId,
        answers: result.answers,
        score: calculatedScore
      })
      .select()
      .single();

    if (error) throw error;

    // Update with detailed results in a separate query to avoid schema issues
    const { error: updateError } = await supabase
      .from('test_results')
      .update({ detailed_results: detailedResults })
      .eq('id', data.id);

    if (updateError) {
      console.warn('Could not save detailed results:', updateError);
      // Don't throw error - basic functionality still works
    }

    return {
      id: data.id,
      testId: data.test_id,
      userId: data.user_id,
      answers: data.answers,
      score: data.score,
      completedAt: new Date(data.completed_at),
      detailedResults: detailedResults
    };
  }

  static async getTestResults(userRole: string, userId?: string): Promise<TestResult[]> {
    let query = supabase.from('test_results').select('*');

    // Students can only see their own results
    if (userRole === 'student') {
      query = query.eq('user_id', userId);
    }
    // Admins and teachers can see all results

    const { data, error } = await query.order('completed_at', { ascending: false });

    if (error) throw error;

    return data.map(result => ({
      id: result.id,
      testId: result.test_id,
      userId: result.user_id,
      answers: result.answers,
      score: result.score,
      completedAt: new Date(result.completed_at),
      detailedResults: result.detailed_results
    }));
  }

  static async updateTest(testId: string, updates: Partial<Test>): Promise<Test> {
    const updateData: any = {};
    
    if (updates.title) updateData.title = updates.title;
    if (updates.description) updateData.description = updates.description;
    if (updates.duration) updateData.duration = updates.duration;
    if (updates.questions) updateData.questions = updates.questions;
    if (updates.isActive !== undefined) updateData.is_active = updates.isActive;
    if (updates.targetClass !== undefined) updateData.target_class = updates.targetClass;

    const { data, error } = await supabase
      .from('tests')
      .update(updateData)
      .eq('id', testId)
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      title: data.title,
      description: data.description,
      duration: data.duration,
      questions: data.questions,
      createdBy: data.created_by,
      createdAt: new Date(data.created_at),
      isActive: data.is_active,
      targetClass: data.target_class
    };
  }

  static async deleteTest(testId: string): Promise<void> {
    const { error } = await supabase
      .from('tests')
      .delete()
      .eq('id', testId);

    if (error) throw error;
  }

  static async createReviewRequest(request: Omit<ReviewRequest, 'id' | 'createdAt'>): Promise<ReviewRequest> {
    const { data, error } = await supabase
      .from('review_requests')
      .insert({
        test_result_id: request.testResultId,
        question_id: request.questionId,
        user_id: request.userId,
        reason: request.reason,
        status: request.status
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      testResultId: data.test_result_id,
      questionId: data.question_id,
      userId: data.user_id,
      reason: data.reason,
      status: data.status,
      createdAt: new Date(data.created_at),
      reviewedBy: data.reviewed_by,
      reviewedAt: data.reviewed_at ? new Date(data.reviewed_at) : undefined,
      reviewNotes: data.review_notes
    };
  }

  static async getReviewRequests(userRole: string, userId?: string): Promise<ReviewRequest[]> {
    let query = supabase.from('review_requests').select('*');

    if (userRole === 'student') {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(request => ({
      id: request.id,
      testResultId: request.test_result_id,
      questionId: request.question_id,
      userId: request.user_id,
      reason: request.reason,
      status: request.status,
      createdAt: new Date(request.created_at),
      reviewedBy: request.reviewed_by,
      reviewedAt: request.reviewed_at ? new Date(request.reviewed_at) : undefined,
      reviewNotes: request.review_notes
    }));
  };

  static async updateReviewRequest(requestId: string, updates: {
    status: 'approved' | 'rejected';
    reviewedBy: string;
    reviewNotes?: string;
  }): Promise<void> {
    try {
      const { error } = await supabase
        .from('review_requests')
        .update({
          status: updates.status,
          reviewed_by: updates.reviewedBy,
          reviewed_at: new Date().toISOString(),
          review_notes: updates.reviewNotes
        })
        .eq('id', requestId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating review request:', error);
      throw error;
    }
  }
}