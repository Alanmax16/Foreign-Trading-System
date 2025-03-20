import api from './api';
import { User } from '../store/slices/authSlice';

// Mock user data for development
const MOCK_USERS = [
  {
    id: 1,
    username: 'demo',
    email: 'demo@example.com',
    password: 'password123', // In a real app, this would be hashed
    roles: ['USER'],
    firstName: 'Demo',
    lastName: 'User',
    enabled: true
  },
  {
    id: 2,
    username: 'admin',
    email: 'admin@example.com',
    password: 'admin123',
    roles: ['ADMIN', 'USER'],
    firstName: 'Admin',
    lastName: 'User',
    enabled: true
  }
];

class AuthService {
  private static instance: AuthService;
  private mockMode: boolean = false; // Set to false to use real API calls

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  public async login(username: string, password: string): Promise<{ user: User; token: string }> {
    try {
      // Find user's email using username first
      const emailCheckResponse = await api.post('/auth/check-email', { username });
      const { email } = emailCheckResponse.data;

      // Then login with email and password
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;
      
      // Store token
      localStorage.setItem('token', token);
      
      return { user, token };
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  }

  public async register(userData: { username: string; email: string; password: string }): Promise<{ user: User; token: string }> {
    try {
      const response = await api.post('/auth/register', {
        name: userData.username,
        email: userData.email,
        password: userData.password
      });
      
      const { token, user } = response.data;
      
      // Store token
      localStorage.setItem('token', token);
      
      return { user, token };
    } catch (error: any) {
      console.error('Registration error:', error);
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  }

  public async validateToken(token: string): Promise<User> {
    try {
      const response = await api.get('/auth/validate');
      return response.data.user;
    } catch (error: any) {
      console.error('Token validation error:', error);
      throw new Error(error.response?.data?.message || 'Token validation failed');
    }
  }

  public async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
    }
  }

  public hasRole(user: User | null, role: string): boolean {
    if (!user) return false;
    return user.roles?.includes(role) || false;
  }

  public isAdmin(user: User | null): boolean {
    return this.hasRole(user, 'ADMIN');
  }

  public getUserById(id: number): User | undefined {
    if (this.mockMode) {
      const user = MOCK_USERS.find(u => u.id === id);
      if (user) {
        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword as User;
      }
      return undefined;
    }
    return undefined;
  }
}

export default AuthService.getInstance(); 