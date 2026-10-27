<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useThemeStore } from '../stores/theme';
import { usePWAStore } from '../stores/pwa';
import { apiClient, getApiBaseUrl, setApiBaseUrl } from '../api/client';
import { useToast } from 'primevue/usetoast';

const authStore = useAuthStore();
const themeStore = useThemeStore();
const pwaStore = usePWAStore();
const toast = useToast();

const serverUrlInput = ref(localStorage.getItem('api_server_url') || '');
const currentServerUrl = ref(getApiBaseUrl());
const isTestingServer = ref(false);

const googleClientIdInput = ref(localStorage.getItem('google_client_id') || import.meta.env.VITE_GOOGLE_CLIENT_ID || '');

function handleSaveGoogleClientId() {
  const val = googleClientIdInput.value.trim();
  if (val) {
    localStorage.setItem('google_client_id', val);
    toast.add({ severity: 'success', summary: 'Saved', detail: 'Google Client ID updated successfully', life: 3000 });
  } else {
    localStorage.removeItem('google_client_id');
    toast.add({ severity: 'info', summary: 'Reset', detail: 'Google Client ID cleared', life: 3000 });
  }
}

async function handleSaveServerUrl() {
  isTestingServer.value = true;
  try {
    let target = serverUrlInput.value.trim();
    if (!target) {
      setApiBaseUrl(null);
      currentServerUrl.value = getApiBaseUrl();
      toast.add({ severity: 'info', summary: 'Reset', detail: 'Reset to default server', life: 3000 });
      return;
    }
    if (!target.startsWith('http://') && !target.startsWith('https://')) {
      target = 'https://' + target;
    }
    const checkUrl = target.endsWith('/health') ? target : (target.replace(/\/+$/, '') + '/health');
    const res = await fetch(checkUrl, { method: 'GET' });
    if (res.ok) {
      setApiBaseUrl(target);
      currentServerUrl.value = getApiBaseUrl();
      toast.add({ severity: 'success', summary: 'Connected', detail: 'Connected to API server successfully', life: 3000 });
    } else {
      toast.add({ severity: 'warn', summary: 'Warning', detail: `Server responded with status ${res.status}`, life: 4000 });
    }
  } catch (err: any) {
    toast.add({ severity: 'error', summary: 'Connection Failed', detail: 'Could not connect to specified server URL', life: 4000 });
  } finally {
    isTestingServer.value = false;
  }
}

const profileForm = ref({
  firstName: '',
  lastName: '',
  phone: '',
  defaultCurrency: 'BDT',
  timezone: 'Asia/Dhaka',
});

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
});

const isUpdatingProfile = ref(false);
const isChangingPassword = ref(false);

onMounted(async () => {
  await authStore.fetchProfile();
  if (authStore.user) {
    profileForm.value = {
      firstName: authStore.user.firstName,
      lastName: authStore.user.lastName,
      phone: authStore.user.phone || '',
      defaultCurrency: authStore.user.defaultCurrency || 'BDT',
      timezone: authStore.user.timezone || 'Asia/Dhaka',
    };
  }
});

async function handleUpdateProfile() {
  isUpdatingProfile.value = true;
  try {
    await authStore.updateProfile(profileForm.value);
    toast.add({ severity: 'success', summary: 'Updated', detail: 'Profile preferences saved successfully', life: 3000 });
  } catch (error: any) {
    toast.add({ severity: 'error', summary: 'Error', detail: error.response?.data?.message || 'Failed to update profile', life: 4000 });
  } finally {
    isUpdatingProfile.value = false;
  }
}

async function handleChangePassword() {
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    toast.add({ severity: 'warn', summary: 'Mismatch', detail: 'New passwords do not match', life: 3000 });
    return;
  }

  isChangingPassword.value = true;
  try {
    await apiClient.post('/auth/change-password', {
      currentPassword: passwordForm.value.currentPassword,
      newPassword: passwordForm.value.newPassword,
    });
    toast.add({ severity: 'success', summary: 'Password Changed', detail: 'Please sign in with your new password', life: 3000 });
    passwordForm.value = { currentPassword: '', newPassword: '', confirmPassword: '' };
  } catch (error: any) {
    toast.add({ severity: 'error', summary: 'Error', detail: error.response?.data?.message || 'Failed to change password', life: 4000 });
  } finally {
    isChangingPassword.value = false;
  }
}
</script>

<template>
  <div class="space-y-6 max-w-4xl mx-auto">
    <!-- Header -->
    <div class="pb-2 border-b border-slate-200/60 dark:border-slate-800">
      <h1 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Account & Application Settings</h1>
      <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Manage personal details, security credentials, locale preferences, and appearance</p>
    </div>

    <!-- Profile Preferences Card -->
    <div class="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-700/60 shadow-sm space-y-6">
      <div class="flex items-center gap-4">
        <div class="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xl shadow-md overflow-hidden">
          <img v-if="authStore.user?.avatarUrl" :src="authStore.user.avatarUrl" alt="Avatar" class="w-full h-full object-cover" referrerpolicy="no-referrer" />
          <span v-else>{{ authStore.user?.firstName?.[0] || 'U' }}</span>
        </div>
        <div>
          <h2 class="text-base font-bold text-slate-900 dark:text-white">{{ authStore.user?.firstName }} {{ authStore.user?.lastName }}</h2>
          <p class="text-xs text-slate-400">{{ authStore.user?.email }}</p>
        </div>
      </div>

      <form @submit.prevent="handleUpdateProfile" class="space-y-4 pt-2">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">First Name</label>
            <input
              v-model="profileForm.firstName"
              required
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Last Name</label>
            <input
              v-model="profileForm.lastName"
              required
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
            <input
              v-model="profileForm.phone"
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Default Currency</label>
            <select
              v-model="profileForm.defaultCurrency"
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none"
            >
              <option value="BDT">BDT (৳) - Bangladeshi Taka</option>
              <option value="USD">USD ($) - US Dollar</option>
              <option value="EUR">EUR (€) - Euro</option>
              <option value="GBP">GBP (£) - British Pound</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Timezone</label>
            <select
              v-model="profileForm.timezone"
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none"
            >
              <option value="Asia/Dhaka">Asia/Dhaka (GMT+6)</option>
              <option value="UTC">UTC (GMT+0)</option>
              <option value="America/New_York">America/New_York (EST)</option>
              <option value="Europe/London">Europe/London (GMT)</option>
            </select>
          </div>
        </div>

        <div class="flex justify-end pt-2">
          <button
            type="submit"
            :disabled="isUpdatingProfile"
            class="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all"
          >
            {{ isUpdatingProfile ? 'Saving...' : 'Save Profile Changes' }}
          </button>
        </div>
      </form>
    </div>

    <!-- Security & Password Change Card -->
    <div class="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-700/60 shadow-sm space-y-4">
      <div>
        <h2 class="text-base font-bold text-slate-900 dark:text-white">Security & Password</h2>
        <p class="text-xs text-slate-400">Change your password to maintain account integrity</p>
      </div>

      <form @submit.prevent="handleChangePassword" class="space-y-4 pt-2">
        <div>
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Current Password</label>
          <input
            v-model="passwordForm.currentPassword"
            type="password"
            required
            class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">New Password</label>
            <input
              v-model="passwordForm.newPassword"
              type="password"
              required
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Confirm New Password</label>
            <input
              v-model="passwordForm.confirmPassword"
              type="password"
              required
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
        </div>

        <div class="flex justify-end pt-2">
          <button
            type="submit"
            :disabled="isChangingPassword"
            class="px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm transition-all"
          >
            {{ isChangingPassword ? 'Updating Password...' : 'Update Password' }}
          </button>
        </div>
      </form>
    </div>

    <!-- Appearance Theme Card -->
    <div class="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-700/60 shadow-sm flex items-center justify-between">
      <div>
        <h2 class="text-base font-bold text-slate-900 dark:text-white">Interface Appearance</h2>
        <p class="text-xs text-slate-400">Toggle between dark mode and clean daylight theme</p>
      </div>

      <button
        @click="themeStore.toggleTheme"
        class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 transition-colors"
      >
        <i :class="themeStore.isDark ? 'pi pi-sun text-amber-400' : 'pi pi-moon text-slate-600'"></i>
        <span>{{ themeStore.isDark ? 'Switch to Light' : 'Switch to Dark' }}</span>
      </button>
    </div>

    <!-- Backend API Connection Card -->
    <div class="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-700/60 shadow-sm space-y-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center text-lg">
            <i class="pi pi-server"></i>
          </div>
          <div>
            <h2 class="text-base font-bold text-slate-900 dark:text-white">API Server Connection</h2>
            <p class="text-xs text-slate-400">Current target: <span class="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">{{ currentServerUrl }}</span></p>
          </div>
        </div>
      </div>

      <div class="flex flex-col sm:flex-row gap-3 pt-2">
        <input
          v-model="serverUrlInput"
          type="text"
          placeholder="https://exp.shadiqur.bd"
          class="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
        />
        <div class="flex gap-2">
          <button
            type="button"
            @click="serverUrlInput = ''; handleSaveServerUrl()"
            class="px-4 py-2.5 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
          >
            Reset Default
          </button>
          <button
            type="button"
            :disabled="isTestingServer"
            @click="handleSaveServerUrl"
            class="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
          >
            <i v-if="isTestingServer" class="pi pi-spin pi-spinner text-xs"></i>
            <span>{{ isTestingServer ? 'Testing...' : 'Save & Test' }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Google OAuth Client ID Card -->
    <div class="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-700/60 shadow-sm space-y-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center text-lg">
            <i class="pi pi-google"></i>
          </div>
          <div>
            <h2 class="text-base font-bold text-slate-900 dark:text-white">Google Sign-In Configuration</h2>
            <p class="text-xs text-slate-400">OAuth 2.0 Web Client ID for Google / Gmail authentication</p>
          </div>
        </div>
      </div>

      <div class="flex flex-col sm:flex-row gap-3 pt-2">
        <input
          v-model="googleClientIdInput"
          type="text"
          placeholder="your-client-id.apps.googleusercontent.com"
          class="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
        />
        <div class="flex gap-2">
          <button
            type="button"
            @click="googleClientIdInput = ''; handleSaveGoogleClientId()"
            class="px-4 py-2.5 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
          >
            Clear
          </button>
          <button
            type="button"
            @click="handleSaveGoogleClientId"
            class="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 flex items-center gap-2"
          >
            <span>Save Client ID</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile App / PWA Installation Card -->
    <div class="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-700/60 shadow-sm space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div class="flex items-center gap-3.5">
          <div class="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xl shrink-0">
            <i class="pi pi-mobile"></i>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-base font-bold text-slate-900 dark:text-white">Mobile Application (PWA)</h2>
              <span
                :class="[
                  'text-[10px] uppercase font-bold px-2 py-0.5 rounded-full',
                  pwaStore.isInstalled
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                ]"
              >
                {{ pwaStore.isInstalled ? 'Installed' : 'Web Version' }}
              </span>
            </div>
            <p class="text-xs text-slate-400 mt-0.5">
              Install ExpTracker directly on Android, iPhone, iPad, or desktop for a fullscreen app experience.
            </p>
          </div>
        </div>

        <button
          v-if="!pwaStore.isInstalled"
          @click="pwaStore.installApp"
          class="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20 transition-all self-start sm:self-auto shrink-0"
        >
          <i class="pi pi-download text-xs"></i>
          <span>Install on this Device</span>
        </button>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs text-slate-500 dark:text-slate-400">
        <div class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 space-y-1">
          <p class="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <i class="pi pi-bolt text-emerald-500"></i> Instant Launch
          </p>
          <p class="text-[11px]">Opens immediately from your phone home screen without browser chrome.</p>
        </div>
        <div class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 space-y-1">
          <p class="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <i class="pi pi-cloud text-blue-500"></i> Offline Cache
          </p>
          <p class="text-[11px]">Core financial ledger shell and styles are cached locally for fast responsiveness.</p>
        </div>
        <div class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 space-y-1">
          <p class="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <i class="pi pi-shield text-indigo-500"></i> Encrypted HTTPS
          </p>
          <p class="text-[11px]">Enterprise banking-grade transport layer security with zero app store bloat.</p>
        </div>
      </div>
    </div>
  </div>
</template>
