import { supabase } from '../lib/supabase';
import { Test, TestResult } from '../types';

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
      // 1. Available to all classes (target_class is null or 0)
      // 2. Specifically targeted to their class
      // 3. User is in class 0 (can see all tests)
      query = query
        .eq('is_active', true);
      
      if (userClass === 0) {
        // Class 0 users can see all active tests
        // No additional filter needed
      } else if (userClass) {
        // Users with specific class can only see:
        // - Tests with no target class (null)
        // - Tests targeted to all classes (0)  
        // - Tests specifically for their class
        query = query.or(`target_class.is.null,target_class.eq.0,target_class.eq.${userClass}`);
      } else {
        // Users without class info can only see general tests
        query = query.or(`target_class.is.null,target_class.eq.0`);
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

  static async submitTestResult(result: Omit<TestResult, 'id' | 'completedAt'>): Promise<TestResult> {
    const { data, error } = await supabase
      .from('test_results')
      .insert({
        test_id: result.testId,
        user_id: result.userId,
        answers: result.answers,
        score: result.score
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      testId: data.test_id,
      userId: data.user_id,
      answers: data.answers,
      score: data.score,
      completedAt: new Date(data.completed_at)
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
      completedAt: new Date(result.completed_at)
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
}