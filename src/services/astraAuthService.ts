import { db } from '../lib/astradb';
import { User } from '../types';
import md5 from 'js-md5';

interface AstraUser {
  _id: string;
  name: string;
  username: string;
  FHiD: number;
  password: string;
  admin: boolean;
}

export class AstraAuthService {
  private static readonly COLLECTION_NAME = 'users';

  static async authenticateUser(username: string, password: string): Promise<User | null> {
    try {
      // Hash the input password to match your stored format (MD5)
      const hashedPassword = md5(password);
      
      const collection = db.collection(this.COLLECTION_NAME);
      
      // Find user by username and password
      const cursor = collection.find({
        username: username,
        password: hashedPassword
      });
      
      const users = await cursor.toArray();
      
      if (users.length === 0) {
        return null;
      }
      
      const astraUser = users[0] as AstraUser;
      
      // Convert Astra user format to your app's User format
      return {
        id: astraUser.username,
        passcode: password, // Store original password for compatibility
        name: astraUser.name,
        role: astraUser.admin ? 'admin' : 'student' // Map admin boolean to role
      };
    } catch (error) {
      console.error('Astra DB authentication error:', error);
      return null;
    }
  }

  static async getUserByUsername(username: string): Promise<User | null> {
    try {
      const collection = db.collection(this.COLLECTION_NAME);
      
      const cursor = collection.find({ username: username });
      const users = await cursor.toArray();
      
      if (users.length === 0) {
        return null;
      }
      
      const astraUser = users[0] as AstraUser;
      
      return {
        id: astraUser.username,
        passcode: '', // Don't return password
        name: astraUser.name,
        role: astraUser.admin ? 'admin' : 'student'
      };
    } catch (error) {
      console.error('Error fetching user from Astra DB:', error);
      return null;
    }
  }

  static async getAllUsers(): Promise<User[]> {
    try {
      const collection = db.collection(this.COLLECTION_NAME);
      
      const cursor = collection.find({});
      const astraUsers = await cursor.toArray() as AstraUser[];
      
      return astraUsers.map(astraUser => ({
        id: astraUser.username,
        passcode: '', // Don't return passwords
        name: astraUser.name,
        role: astraUser.admin ? 'admin' : 'student'
      }));
    } catch (error) {
      console.error('Error fetching users from Astra DB:', error);
      return [];
    }
  }

  static async createUser(userData: {
    name: string;
    username: string;
    password: string;
    admin: boolean;
    FHiD?: number;
  }): Promise<User | null> {
    try {
      const collection = db.collection(this.COLLECTION_NAME);
      
      // Hash the password
      const hashedPassword = md5(userData.password);
      
      const newUser: Omit<AstraUser, '_id'> = {
        name: userData.name,
        username: userData.username,
        password: hashedPassword,
        admin: userData.admin,
        FHiD: userData.FHiD || Math.floor(Math.random() * 10000)
      };
      
      const result = await collection.insertOne(newUser);
      
      if (result.insertedId) {
        return {
          id: userData.username,
          passcode: userData.password,
          name: userData.name,
          role: userData.admin ? 'admin' : 'student'
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error creating user in Astra DB:', error);
      return null;
    }
  }

  static async testConnection(): Promise<boolean> {
    try {
      const collection = db.collection(this.COLLECTION_NAME);
      await collection.find({}).limit(1).toArray();
      return true;
    } catch (error) {
      console.error('Astra DB connection test failed:', error);
      return false;
    }
  }
}