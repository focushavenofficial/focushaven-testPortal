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