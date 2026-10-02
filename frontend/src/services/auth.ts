import { api } from './api';
import { User } from '../types';

export const authService = {
  async login(username: string, password: string):Promise<{ token: string; user: User }> {
    const res = await api.post('/auth/login', { username, password });
    const { token, user } = res.data.data;
    localStorage.setItem('shore_token', token);
    localStorage.setItem('shore_user', JSON.stringify(user));
    return { token, user };
  },

  logout() {
    localStorage.removeItem('shore_token');
    localStorage.removeItem('shore_user');
    window.location.href = '/login';
  },

  getCurrentUser(): User | null {
    const stored = localStorage.getItem('shore_user');
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  },

  getToken(): string | null {
    return localStorage.getItem('shore_token');
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'admin';
  },
};
