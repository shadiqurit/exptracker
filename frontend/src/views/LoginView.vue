<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useToast } from 'primevue/usetoast';
import { getApiBaseUrl, setApiBaseUrl } from '../api/client';
import Dialog from 'primevue/dialog';

const router = useRouter();
const authStore = useAuthStore();
const toast = useToast();

const email = ref('');
const password = ref('');
const isLoading = ref(false);

const currentServer = ref(getApiBaseUrl());
const showServerModal = ref(false);
const customServerInput = ref(localStorage.getItem('api_server_url') || '');
const isTestingServer = ref(false);

async function testAndSaveServer() {
  isTestingServer.value = true;
  try {
    let target = customServerInput.value.trim();
    if (!target) {
      setApiBaseUrl(null);
      currentServer.value = getApiBaseUrl();
      toast.add({ severity: 'info', summary: 'Reset', detail: 'Reset to default server', life: 3000 });
      showServerModal.value = false;
      return;
    }
    if (!target.startsWith('http://') && !target.startsWith('https://')) {
      target = 'https://' + target;
    }
    const checkUrl = target.endsWith('/health') ? target : (target.replace(/\/+$/, '') + '/health');
    const res = await fetch(checkUrl, { method: 'GET' });
    if (res.ok) {
      setApiBaseUrl(target);
      currentServer.value = getApiBaseUrl();
      toast.add({ severity: 'success', summary: 'Connected', detail: 'Server reached successfully', life: 3000 });
      showServerModal.value = false;
    } else {
      toast.add({ severity: 'warn', summary: 'Server Warning', detail: `Server responded with status ${res.status}`, life: 4000 });
    }
  } catch (err: any) {
    toast.add({ severity: 'error', summary: 'Connection Failed', detail: 'Could not connect to specified server URL', life: 4000 });
  } finally {
    isTestingServer.value = false;
  }
}

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

      <!-- Login Form -->
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

      <!-- Server Connection Indicator -->
      <div class="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
        <span class="flex items-center gap-1.5 truncate max-w-[220px]">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span class="truncate">Server: {{ currentServer.replace(/^https?:\/\//, '') }}</span>
        </span>
        <button
          type="button"
          @click="showServerModal = true"
          class="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold text-[11px] shrink-0"
        >
          Change
        </button>
      </div>
    </div>

    <!-- Server Configuration Modal -->
    <Dialog
      v-model:visible="showServerModal"
      modal
      header="API Server Connection"
      :style="{ width: '92vw', maxWidth: '28rem' }"
    >
      <div class="space-y-4 pt-2">
        <p class="text-xs text-slate-500 dark:text-slate-400">
          Set the backend API server for this device. Default is <code class="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">https://exp.shadiqur.bd</code>.
        </p>
        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Server URL</label>
          <input
            v-model="customServerInput"
            type="text"
            placeholder="https://exp.shadiqur.bd"
            class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>
        <div class="flex justify-end gap-2 pt-2">
          <button
            type="button"
            @click="customServerInput = ''; testAndSaveServer()"
            class="px-3 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Reset Default
          </button>
          <button
            type="button"
            :disabled="isTestingServer"
            @click="testAndSaveServer"
            class="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white shadow-md hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-1.5"
          >
            <i v-if="isTestingServer" class="pi pi-spin pi-spinner text-xs"></i>
            <span>{{ isTestingServer ? 'Connecting...' : 'Save & Connect' }}</span>
          </button>
        </div>
      </div>
    </Dialog>
  </div>
</template>
