<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useToast } from 'primevue/usetoast';
import Dialog from 'primevue/dialog';

const props = withDefaults(
  defineProps<{
    mode?: 'signin' | 'signup';
  }>(),
  {
    mode: 'signin',
  }
);

const router = useRouter();
const authStore = useAuthStore();
const toast = useToast();

const isLoading = ref(false);
const showConfigModal = ref(false);
const clientIdInput = ref(localStorage.getItem('google_client_id') || import.meta.env.VITE_GOOGLE_CLIENT_ID || '');

function getGoogleClientId(): string {
  return (
    localStorage.getItem('google_client_id') ||
    import.meta.env.VITE_GOOGLE_CLIENT_ID ||
    ''
  ).trim();
}

function loadGoogleScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window !== 'undefined' && (window as any).google?.accounts?.oauth2) {
      return resolve();
    }
    const existingScript = document.getElementById('google-gsi-script');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve());
      existingScript.addEventListener('error', (e) => reject(e));
      return;
    }
    const script = document.createElement('script');
    script.id = 'google-gsi-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = (e) => reject(e);
    document.head.appendChild(script);
  });
}

onMounted(() => {
  loadGoogleScript().catch(() => {
    // Non-blocking in offline / restricted networks
  });
});

async function handleGoogleClick() {
  const clientId = getGoogleClientId();
  if (!clientId) {
    showConfigModal.value = true;
    return;
  }

  isLoading.value = true;
  try {
    await loadGoogleScript();
    const google = (window as any).google;

    if (!google?.accounts?.oauth2) {
      throw new Error('Google Identity service is unavailable. Please check your internet connection.');
    }

    const tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: 'email profile openid',
      callback: async (tokenResponse: any) => {
        if (tokenResponse.error) {
          isLoading.value = false;
          toast.add({
            severity: 'error',
            summary: 'Google Authentication Cancelled',
            detail: tokenResponse.error_description || tokenResponse.error,
            life: 4000,
          });
          return;
        }

        try {
          // 1. Fetch user profile directly from Google userinfo API
          let profileInfo: any = {};
          try {
            const userinfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
            });
            if (userinfoRes.ok) {
              profileInfo = await userinfoRes.json();
            }
          } catch (e) {
            console.warn('[GoogleAuth] Direct userinfo fetch skipped:', e);
          }

          // 2. Authenticate with backend
          await authStore.googleLogin({
            accessToken: tokenResponse.access_token,
            email: profileInfo.email,
            firstName: profileInfo.given_name,
            lastName: profileInfo.family_name,
            avatarUrl: profileInfo.picture,
            googleId: profileInfo.sub,
          });

          toast.add({
            severity: 'success',
            summary: props.mode === 'signup' ? 'Account Created' : 'Welcome Back!',
            detail: 'Signed in with Google successfully',
            life: 3000,
          });

          router.push('/dashboard');
        } catch (authErr: any) {
          console.error('[GoogleAuth] Backend error:', authErr);
          let errorMsg = 'Could not complete Google authentication with backend.';
          if (authErr.response?.status === 502 || authErr.response?.status === 503 || authErr.response?.status === 504) {
            errorMsg = `Backend server is unavailable (${authErr.response.status} Bad Gateway). Please ensure the API is running on port 3006 on your server.`;
          } else if (authErr.code === 'ERR_NETWORK' || !authErr.response) {
            errorMsg = 'Cannot connect to backend server. Make sure API is running and reachable.';
          } else if (authErr.response?.data?.message) {
            errorMsg = authErr.response.data.message;
          }

          toast.add({
            severity: 'error',
            summary: 'Authentication Failed',
            detail: errorMsg,
            life: 6000,
          });
        } finally {
          isLoading.value = false;
        }
      },
      error_callback: (err: any) => {
        isLoading.value = false;
        toast.add({
          severity: 'error',
          summary: 'Google Sign-In Error',
          detail: err?.message || 'Failed to initialize Google authentication prompt',
          life: 4000,
        });
      },
    });

    tokenClient.requestAccessToken();
  } catch (err: any) {
    isLoading.value = false;
    toast.add({
      severity: 'error',
      summary: 'Google Service Error',
      detail: err.message || 'Could not initialize Google authentication',
      life: 5000,
    });
  }
}

function saveClientId() {
  const val = clientIdInput.value.trim();
  if (val) {
    localStorage.setItem('google_client_id', val);
    toast.add({
      severity: 'success',
      summary: 'Client ID Saved',
      detail: 'Google OAuth Client ID has been configured for this device.',
      life: 3000,
    });
    showConfigModal.value = false;
    handleGoogleClick();
  } else {
    localStorage.removeItem('google_client_id');
    toast.add({
      severity: 'info',
      summary: 'Reset',
      detail: 'Client ID cleared.',
      life: 2000,
    });
  }
}
</script>

<template>
  <div class="w-full">
    <button
      type="button"
      :disabled="isLoading"
      @click="handleGoogleClick"
      class="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-200 font-semibold text-sm transition-all shadow-sm active:scale-[0.99] disabled:opacity-50"
    >
      <i v-if="isLoading" class="pi pi-spin pi-spinner text-base text-emerald-600"></i>
      <svg v-else class="w-4 h-4 shrink-0" viewBox="0 0 24 24">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        />
      </svg>
      <span>{{ mode === 'signup' ? 'Sign up with Google' : 'Sign in with Google' }}</span>
    </button>

    <!-- Google Client ID Setup Dialog (If not configured in .env) -->
    <Dialog
      v-model:visible="showConfigModal"
      modal
      header="Google OAuth Setup"
      :style="{ width: '92vw', maxWidth: '30rem' }"
    >
      <div class="space-y-4 pt-1">
        <div class="flex items-start gap-3 p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60 text-xs">
          <i class="pi pi-info-circle text-base shrink-0 mt-0.5"></i>
          <p>
            To enable Gmail Sign-In, please enter your <strong>Google Cloud OAuth 2.0 Client ID</strong> (Web application). You can obtain one from the
            <a href="https://console.cloud.google.com/apis/credentials" target="_blank" class="underline font-bold">Google Cloud Console</a>.
          </p>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Google Client ID
          </label>
          <input
            v-model="clientIdInput"
            type="text"
            placeholder="123456789-xxxxxx.apps.googleusercontent.com"
            class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
          <p class="text-[11px] text-slate-400 mt-1">
            Tip: You can also permanently set <code>VITE_GOOGLE_CLIENT_ID</code> in your frontend <code>.env</code> file.
          </p>
        </div>

        <div class="flex justify-end gap-2 pt-2">
          <button
            type="button"
            @click="showConfigModal = false"
            class="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            @click="saveClientId"
            class="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20 transition-all"
          >
            Save & Continue
          </button>
        </div>
      </div>
    </Dialog>
  </div>
</template>
