<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useToast } from 'primevue/usetoast';
import GoogleAuthButton from '../components/GoogleAuthButton.vue';

const router = useRouter();
const authStore = useAuthStore();
const toast = useToast();

const email = ref('');
const password = ref('');
const isLoading = ref(false);

async function handleLogin() {
  if (!email.value || !password.value) {
    toast.add({ severity: 'warn', summary: 'Missing fields', detail: 'Please fill in both email and password', life: 3000 });
    return;
  }

  isLoading.value = true;
  try {
    await authStore.login({ email: email.value.trim(), password: password.value });
    toast.add({ severity: 'success', summary: 'Welcome back!', detail: 'Logged in successfully', life: 3000 });
    router.push('/dashboard');
  } catch (error: any) {
    let errorMsg = 'Invalid email or password';
    if (error.response?.status === 502 || error.response?.status === 503 || error.response?.status === 504) {
      errorMsg = 'Backend service is unavailable (502/503/504). Please ensure the backend is running on port 3006.';
    } else if (error.code === 'ERR_NETWORK' || !error.response) {
      errorMsg = 'Cannot connect to backend server. Make sure API is running and reachable.';
    } else if (error.response?.data?.message) {
      errorMsg = error.response.data.message;
    }
    toast.add({
      severity: 'error',
      summary: 'Login Failed',
      detail: errorMsg,
      life: 6000,
    });
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-900">
    <div class="w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200/80 dark:border-slate-700/60 shadow-xl space-y-6">
      <!-- Header -->
      <div class="text-center space-y-2">
        <div class="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-500/25">
          <i class="pi pi-dollar text-2xl font-bold"></i>
        </div>
        <h1 class="text-2xl font-extrabold text-slate-900 dark:text-white">Sign In</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400">Daily Expense & Income Management</p>
      </div>

      <!-- Google Sign In Option -->
      <GoogleAuthButton mode="signin" />

      <!-- Or continue with email divider -->
      <div class="relative flex items-center justify-center">
        <div class="border-t border-slate-200 dark:border-slate-700 w-full"></div>
        <span class="bg-white dark:bg-slate-800 px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider shrink-0">
          Or continue with email
        </span>
        <div class="border-t border-slate-200 dark:border-slate-700 w-full"></div>
      </div>

      <!-- Login Form (Email & Password) -->
      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Email Address</label>
          <div class="relative">
            <i class="pi pi-envelope absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
            <input
              v-model="email"
              type="email"
              required
              placeholder="you@example.com"
              class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Password</label>
          <div class="relative">
            <i class="pi pi-lock absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
            <input
              v-model="password"
              type="password"
              required
              placeholder="••••••••"
              class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>
        </div>

        <button
          type="submit"
          :disabled="isLoading"
          class="w-full py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white shadow-md shadow-emerald-500/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <i v-if="isLoading" class="pi pi-spin pi-spinner text-sm"></i>
          <span>{{ isLoading ? 'Signing In...' : 'Sign In' }}</span>
        </button>
      </form>

      <!-- Footer Links -->
      <div class="text-center text-xs text-slate-500 dark:text-slate-400">
        Don't have an account yet?
        <router-link to="/register" class="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">
          Create account
        </router-link>
      </div>
    </div>
  </div>
</template>
