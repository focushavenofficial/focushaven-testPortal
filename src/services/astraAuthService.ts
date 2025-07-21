import { User } from '../types';
import md5 from 'js-md5';
import { supabase } from '../lib/supabase';

interface UserFetch {
  username: string,
  name: string,
  admin: boolean,
  class?: number
}

export class AstraAuthService {

  static async authenticateUser(username: string, password: string): Promise<User | null> {
    try {
      const hashedPassword = md5(password);
      const response = await fetch('https://focushaven-api.vercel.app/api/v1/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        
        credentials: 'include', // ⬅️ Important to send cookies
        body: JSON.stringify({ username: username, password: hashedPassword })
      });

      const data = await response.json();

      if(!data.success){
        console.warn("error while Loggging in")
        return null
      }
      
      const user = await AstraAuthService.getUserInfo()
      
      if (!user) {
        console.warn("error while fetching user info")
        return null;
      }
      
      // Create or update user in Supabase for foreign key consistency
      await AstraAuthService.syncUserToSupabase(user, password);
      
      // Convert Astra user format to your app's User format
      return {
        id: user.username,
        passcode: password, // Store original password for compatibility
        name: user.name,
        role: user.admin ? 'admin' : 'student', // Map admin boolean to role
        class: user.class || 0 // Default to class 0 if not present
      };
    } catch (error) {
      console.error('Astra DB authentication error:', error);
      return null;
    }
  }

  static async getUserInfo(): Promise<UserFetch | null> {
    try {
      const response = await fetch('https://focushaven-api.vercel.app/api/v1/user/getUserInfo', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        
        credentials: 'include', // ⬅️ Important to send cookies
      });

      const data = await response.json();

      if(!data.success){
        console.warn("error While fetching user Info : ", data.message)
        return null
      }   

      return {
        username: data.user.username,
        name: data.user.name,
        admin: data.user.admin,
        class: data.user.class
      }
      } catch(err){
    console.warn("Error Fetching user Info : ", err)
    return null
  }
  }

  static async syncUserToSupabase(astraUser: UserFetch, password: string): Promise<void> {
    try {
      // Check if user exists in Supabase
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('id', astraUser.username)
        .single();

      const userData = {
        id: astraUser.username,
        name: astraUser.name,
        role: astraUser.admin ? 'admin' : 'student',
        is_active: true,
        class: astraUser.class || 0
      };

      if (!existingUser) {
        // Create new user
        await supabase
          .from('users')
          .insert(userData);
      } else {
        // Update existing user
        await supabase
          .from('users')
          .update(userData)
          .eq('id', astraUser.username);
      }
    } catch (error) {
      console.error('Error syncing user to Supabase:', error);
      // Don't throw error - authentication can still proceed
    }
  }
}