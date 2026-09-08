import { User } from '../types';
import { apiRequest, AuthResponse, MeResponse } from '../lib/api';

export const authService = {
  register(payload: { name: string; email: string; password: string }) {
    return apiRequest<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  login(payload: { email: string; password: string }) {
    return apiRequest<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  me() {
    return apiRequest<MeResponse>('/api/auth/me');
  },
};
