import { api } from './api';
import { User } from '../types';

export const authService = {
  async login(username: string, password: string): Promise<{ token: string; user: User }> {
    const res = await api.post('/auth/login', { username, password });
    const { token, user } = res.data.data;
    localStorage.setItem('freight_token', token);
    localStorage.setItem('freight_user', JSON.stringify(user));
    // Also cleanup legacy keys if present
    localStorage.removeItem('shore_token');
    localStorage.removeItem('shore_user');
    return { token, user };
  },

  logout() {
    localStorage.removeItem('freight_token');
    localStorage.removeItem('freight_user');
    localStorage.removeItem('shore_token');
    localStorage.removeItem('shore_user');
    window.location.href = '/login';
  },

  getCurrentUser(): User | null {
    const stored = localStorage.getItem('freight_user') || localStorage.getItem('shore_user');
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  },

  updateCurrentUser(updated: Partial<User>) {
    const current = this.getCurrentUser();
    if (current) {
      const merged = { ...current, ...updated };
      localStorage.setItem('freight_user', JSON.stringify(merged));
    }
  },

  getToken(): string | null {
    return localStorage.getItem('freight_token') || localStorage.getItem('shore_token');
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'admin';
  },
};
