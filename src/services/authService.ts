import { supabase } from '../lib/supabase';
import { User } from '../types';

export class AuthService {
  static async authenticateUser(userId: string, passcode: string): Promise<User | null> {
    try {
      // First, sign in the user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: `${userId}@testportal.local`,
        password: passcode
      });

      if (authError) {
        // If auth fails, try to sign up the user (for development)
        console.log('Auth failed, attempting signup for development');
        return null;
      }

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .eq('is_active', true)
        .single();

      if (error || !data) {
        return null;
      }

      // Verify passcode manually since we're using custom auth
      if (data.passcode !== passcode) {
        await supabase.auth.signOut();
        return null;
      }

      return {
        id: data.id,
        passcode: data.passcode,
        name: data.name,
        role: data.role as 'admin' | 'teacher' | 'student'
      };
    } catch (error) {
      console.error('Authentication error:', error);
      return null;
    }
  }

  static async getAllUsers(): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) {
        throw error;
      }

      return data.map(user => ({
        id: user.id,
        passcode: user.passcode,
        name: user.name,
        role: user.role as 'admin' | 'teacher' | 'student'
      }));
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  static async createUser(user: Omit<User, 'passcode'> & { passcode: string }): Promise<User> {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert({
          id: user.id,
          passcode: user.passcode,
          name: user.name,
          role: user.role
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return {
        id: data.id,
        passcode: data.passcode,
        name: data.name,
        role: data.role as 'admin' | 'teacher' | 'student'
      };
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  static async updateUser(userId: string, updates: Partial<Omit<User, 'id'>>): Promise<User> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return {
        id: data.id,
        passcode: data.passcode,
        name: data.name,
        role: data.role as 'admin' | 'teacher' | 'student'
      };
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  static async deactivateUser(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('users')
        .update({ is_active: false })
        .eq('id', userId);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error deactivating user:', error);
      throw error;
    }
  }
}