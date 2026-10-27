<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { apiClient } from '../api/client';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import dayjs from 'dayjs';

const toast = useToast();
const confirm = useConfirm();

const users = ref<any[]>([]);
const stats = ref<any>(null);
const isLoading = ref(true);
const searchQuery = ref('');
const page = ref(1);
const totalPages = ref(1);

async function loadData() {
  isLoading.value = true;
  try {
    const [usersRes, statsRes] = await Promise.all([
      apiClient.get('/admin/users', { params: { page: page.value, search: searchQuery.value || undefined } }),
      apiClient.get('/admin/stats'),
    ]);

    users.value = usersRes.data.data;
    totalPages.value = usersRes.data.meta.totalPages;
    stats.value = statsRes.data.data;
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Could not load administrative data', life: 3000 });
  } finally {
    isLoading.value = false;
  }
}

onMounted(() => {
  loadData();
});

function confirmToggleStatus(u: any) {
  const willDeactivate = u.status === 'ACTIVE';
  confirm.require({
    message: `${willDeactivate ? 'Deactivate' : 'Activate'} user account "${u.email}"?`,
    header: 'Toggle User Status',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: willDeactivate ? 'p-button-danger' : 'p-button-success',
    accept: async () => {
      try {
        await apiClient.patch(`/admin/users/${u.id}/toggle-status`);
        toast.add({ severity: 'success', summary: 'Status Updated', detail: 'User status successfully modified', life: 3000 });
        loadData();
      } catch (e: any) {
        toast.add({ severity: 'error', summary: 'Error', detail: e.response?.data?.message, life: 3000 });
      }
    },
  });
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="pb-2 border-b border-slate-200/60 dark:border-slate-800">
      <h1 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight">System Administration</h1>
      <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Manage user access permissions, view non-financial operational diagnostics & system health</p>
    </div>

    <!-- System Diagnostics KPI Cards -->
    <div v-if="stats" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      <div class="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 shadow-sm space-y-1">
        <p class="text-[11px] font-bold text-slate-400 uppercase">Total Users</p>
        <p class="text-2xl font-black text-slate-900 dark:text-white">{{ stats.totalUsers }}</p>
      </div>

      <div class="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 shadow-sm space-y-1">
        <p class="text-[11px] font-bold text-emerald-500 uppercase">Active Accounts</p>
        <p class="text-2xl font-black text-emerald-600 dark:text-emerald-400">{{ stats.activeUsers }}</p>
      </div>

      <div class="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 shadow-sm space-y-1">
        <p class="text-[11px] font-bold text-slate-400 uppercase">Financial Accounts</p>
        <p class="text-2xl font-black text-slate-900 dark:text-white">{{ stats.totalAccounts }}</p>
      </div>

      <div class="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 shadow-sm space-y-1">
        <p class="text-[11px] font-bold text-slate-400 uppercase">Total Transactions</p>
        <p class="text-2xl font-black text-slate-900 dark:text-white">{{ stats.totalTransactions }}</p>
      </div>

      <div class="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 shadow-sm space-y-1">
        <p class="text-[11px] font-bold text-slate-400 uppercase">Fund Transfers</p>
        <p class="text-2xl font-black text-slate-900 dark:text-white">{{ stats.totalTransfers }}</p>
      </div>
    </div>

    <!-- User Management Table -->
    <div class="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700/60 shadow-sm overflow-hidden">
      <div class="p-4 border-b border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h3 class="text-sm font-bold text-slate-900 dark:text-white">Registered Users Directory</h3>
        <div class="relative w-full sm:w-64">
          <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
          <input
            v-model="searchQuery"
            @keyup.enter="loadData"
            placeholder="Search email, name..."
            class="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none"
          />
        </div>
      </div>

      <div v-if="isLoading" class="p-8 text-center text-slate-400 text-xs">
        <i class="pi pi-spin pi-spinner text-lg mb-2"></i>
        <p>Loading users...</p>
      </div>

      <div v-else class="overflow-x-auto touch-scroll">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-50 dark:bg-slate-800/80 text-slate-500 font-bold uppercase text-[10px]">
            <tr>
              <th class="py-3 px-4">User</th>
              <th class="py-3 px-4">Role</th>
              <th class="py-3 px-4">Accounts</th>
              <th class="py-3 px-4">Transactions</th>
              <th class="py-3 px-4">Created Date</th>
              <th class="py-3 px-4">Status</th>
              <th class="py-3 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
            <tr v-for="u in users" :key="u.id" class="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
              <td class="py-3 px-4">
                <p class="font-bold text-slate-900 dark:text-white">{{ u.name }}</p>
                <p class="text-[11px] text-slate-400">{{ u.email }}</p>
              </td>
              <td class="py-3 px-4">
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                  {{ u.roles.join(', ') }}
                </span>
              </td>
              <td class="py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">{{ u.accountsCount }}</td>
              <td class="py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">{{ u.transactionsCount }}</td>
              <td class="py-3 px-4 text-slate-500">{{ dayjs(u.createdAt).format('DD MMM YYYY') }}</td>
              <td class="py-3 px-4">
                <span
                  :class="[
                    'text-[10px] font-bold px-2 py-0.5 rounded-full uppercase',
                    u.status === 'ACTIVE'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                  ]"
                >
                  {{ u.status }}
                </span>
              </td>
              <td class="py-3 px-4 text-center">
                <button
                  @click="confirmToggleStatus(u)"
                  :class="[
                    'text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-colors',
                    u.status === 'ACTIVE'
                      ? 'border-rose-200 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                      : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                  ]"
                >
                  {{ u.status === 'ACTIVE' ? 'Deactivate' : 'Activate' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
