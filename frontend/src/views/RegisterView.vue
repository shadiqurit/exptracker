<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useToast } from 'primevue/usetoast';

const router = useRouter();
const authStore = useAuthStore();
const toast = useToast();

const form = ref({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  phone: '',
  defaultCurrency: 'BDT',
});
const isLoading = ref(false);

async function handleRegister() {
  isLoading.value = true;
  try {
    await authStore.register(form.value);
    toast.add({ severity: 'success', summary: 'Account Created', detail: 'Welcome to Expense Tracker!', life: 3000 });
    router.push('/dashboard');
  } catch (error: any) {
    toast.add({
      severity: 'error',
      summary: 'Registration Error',
      detail: error.response?.data?.message || 'Failed to create account',
      life: 4000,
    });
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-900">
    <div class="w-full max-w-lg bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200/80 dark:border-slate-700/60 shadow-xl space-y-6">
      <div class="text-center space-y-2">
        <h1 class="text-2xl font-extrabold text-slate-900 dark:text-white">Create Your Account</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400">Start managing your personal finances today</p>
      </div>

      <form @submit.prevent="handleRegister" class="space-y-4">
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">First Name</label>
            <input
              v-model="form.firstName"
              type="text"
              required
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Last Name</label>
            <input
              v-model="form.lastName"
              type="text"
              required
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Email Address</label>
          <input
            v-model="form.email"
            type="email"
            required
            class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Password (Min 8 chars, 1 uppercase, 1 lowercase, 1 number)</label>
          <input
            v-model="form.password"
            type="password"
            required
            class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Phone Number</label>
            <input
              v-model="form.phone"
              type="text"
              placeholder="+8801700000000"
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Currency</label>
            <select
              v-model="form.defaultCurrency"
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
            >
              <option value="BDT">BDT (৳) - Bangladeshi Taka</option>
              <option value="USD">USD ($) - US Dollar</option>
              <option value="EUR">EUR (€) - Euro</option>
              <option value="GBP">GBP (£) - British Pound</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          :disabled="isLoading"
          class="w-full py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white shadow-md shadow-emerald-500/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <i v-if="isLoading" class="pi pi-spin pi-spinner text-sm"></i>
          <span>{{ isLoading ? 'Creating Account...' : 'Complete Registration' }}</span>
        </button>
      </form>

      <div class="text-center text-xs text-slate-500 dark:text-slate-400">
        Already have an account?
        <router-link to="/login" class="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">
          Sign in
        </router-link>
      </div>
    </div>
  </div>
</template>
