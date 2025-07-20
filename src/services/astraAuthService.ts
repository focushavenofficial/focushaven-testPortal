import { User } from '../types';
import md5 from 'js-md5';
import testingFunc from '../../netlify/functions/get-user.js'

interface UserFetch {
  username: string,
  name: string,
  admin: boolean
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
      
      
      // Convert Astra user format to your app's User format
      return {
        id: user.username,
        passcode: password, // Store original password for compatibility
        name: user.name,
        role: user.admin ? 'admin' : 'student' // Map admin boolean to role
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
      }
      } catch(err){
    console.warn("Error Fetching user Info : ", err)
    return null
  }
  }
}