import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { apiClient } from '../api/client.js';
import { User } from '../types/index.js';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(
    JSON.parse(localStorage.getItem('user') || 'null')
  );
  const token = ref<string | null>(localStorage.getItem('access_token'));

  const isAuthenticated = computed(() => !!token.value);
  const isSuperAdmin = computed(() => user.value?.roles.includes('SUPER_ADMIN') ?? false);

  async function login(credentials: { email: string; password: string }) {
    const res = await apiClient.post('/auth/login', credentials);
    const { user: userData, accessToken } = res.data.data;
    user.value = userData;
    token.value = accessToken;
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('access_token', accessToken);
    return res.data;
  }

  async function register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    defaultCurrency?: string;
  }) {
    const res = await apiClient.post('/auth/register', userData);
    const { user: registeredUser, accessToken } = res.data.data;
    user.value = registeredUser;
    token.value = accessToken;
    localStorage.setItem('user', JSON.stringify(registeredUser));
    localStorage.setItem('access_token', accessToken);
    return res.data;
  }

  async function googleLogin(googlePayload: {
    idToken?: string;
    accessToken?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
    googleId?: string;
  }) {
    const res = await apiClient.post('/auth/google', googlePayload);
    const { user: userData, accessToken } = res.data.data;
    user.value = userData;
    token.value = accessToken;
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('access_token', accessToken);
    return res.data;
  }

  async function fetchProfile() {
    try {
      const res = await apiClient.get('/auth/me');
      user.value = res.data.data;
      localStorage.setItem('user', JSON.stringify(res.data.data));
    } catch (e) {
      // If error, do nothing or logout
    }
  }

  async function updateProfile(data: Partial<User>) {
    const res = await apiClient.patch('/auth/profile', data);
    user.value = res.data.data;
    localStorage.setItem('user', JSON.stringify(res.data.data));
    return res.data;
  }

  async function logout() {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // ignore
    } finally {
      user.value = null;
      token.value = null;
      localStorage.removeItem('user');
      localStorage.removeItem('access_token');
    }
  }

  return {
    user,
    token,
    isAuthenticated,
    isSuperAdmin,
    login,
    register,
    googleLogin,
    fetchProfile,
    updateProfile,
    logout,
  };
});
