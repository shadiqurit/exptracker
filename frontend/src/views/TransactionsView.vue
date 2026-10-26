<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { apiClient } from '../api/client';
import { Transaction, Account, Category } from '../types';
import dayjs from 'dayjs';

const transactions = ref<Transaction[]>([]);
const accounts = ref<Account[]>([]);
const categories = ref<Category[]>([]);
const isLoading = ref(true);

const filterType = ref('');
const filterAccount = ref('');
const filterCategory = ref('');
const filterSearch = ref('');
const startDate = ref('');
const endDate = ref('');
const page = ref(1);
const totalPages = ref(1);
const total = ref(0);

async function loadTransactions() {
  isLoading.value = true;
  try {
    const res = await apiClient.get('/transactions', {
      params: {
        page: page.value,
        limit: 20,
        type: filterType.value || undefined,
        accountId: filterAccount.value || undefined,
        categoryId: filterCategory.value || undefined,
        search: filterSearch.value || undefined,
        startDate: startDate.value || undefined,
        endDate: endDate.value || undefined,
      },
    });

    transactions.value = res.data.data;
    total.value = res.data.meta.total;
    totalPages.value = res.data.meta.totalPages;
  } catch (error) {
    console.error('Error loading transactions:', error);
  } finally {
    isLoading.value = false;
  }
}

async function loadDropdowns() {
  try {
    const [accRes, catRes] = await Promise.all([
      apiClient.get('/accounts'),
      apiClient.get('/categories'),
    ]);
    accounts.value = accRes.data.data;
    categories.value = catRes.data.data;
  } catch (e) {
    console.error(e);
  }
}

watch([filterType, filterAccount, filterCategory, startDate, endDate], () => {
  page.value = 1;
  loadTransactions();
});

onMounted(() => {
  loadDropdowns();
  loadTransactions();
});

function changePage(p: number) {
  if (p < 1 || p > totalPages.value) return;
  page.value = p;
  loadTransactions();
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60 dark:border-slate-800">
      <div>
        <h1 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight">All Financial Transactions</h1>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Unified ledger view of all earnings and expenses</p>
      </div>

      <span class="text-xs font-semibold px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 self-start sm:self-auto">
        {{ total }} Total Records
      </span>
    </div>

    <!-- Filters Strip -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-sm">
      <div class="sm:col-span-2">
        <div class="relative">
          <i class="pi pi-search absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
          <input
            v-model="filterSearch"
            @keyup.enter="loadTransactions"
            placeholder="Search memo, merchant, ref..."
            class="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>
      </div>

      <select
        v-model="filterType"
        class="text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none"
      >
        <option value="">All Types</option>
        <option value="INCOME">Income Only</option>
        <option value="EXPENSE">Expense Only</option>
      </select>

      <select
        v-model="filterAccount"
        class="text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none"
      >
        <option value="">All Accounts</option>
        <option v-for="a in accounts" :key="a.id" :value="a.id">{{ a.name }}</option>
      </select>

      <input
        v-model="startDate"
        type="date"
        class="text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none"
        placeholder="Start Date"
      />

      <input
        v-model="endDate"
        type="date"
        class="text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none"
        placeholder="End Date"
      />
    </div>

    <!-- Data Table -->
    <div class="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700/60 shadow-sm overflow-hidden">
      <div v-if="isLoading" class="p-8 text-center text-slate-400 text-xs">
        <i class="pi pi-spin pi-spinner text-lg mb-2"></i>
        <p>Loading transactions...</p>
      </div>

      <div v-else-if="transactions.length === 0" class="p-12 text-center text-slate-400 text-xs">
        No transactions matching current filters
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-50/80 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-700/60 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px]">
            <tr>
              <th class="py-3.5 px-4">Date</th>
              <th class="py-3.5 px-4">Type</th>
              <th class="py-3.5 px-4">Category</th>
              <th class="py-3.5 px-4">Account</th>
              <th class="py-3.5 px-4">Description / Merchant</th>
              <th class="py-3.5 px-4 text-right">Amount</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
            <tr v-for="t in transactions" :key="t.id" class="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
              <td class="py-3 px-4 text-slate-500 whitespace-nowrap">
                {{ dayjs(t.transactionDate).format('DD MMM YYYY, hh:mm A') }}
              </td>
              <td class="py-3 px-4">
                <span
                  :class="[
                    'inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-full text-[10px]',
                    t.type === 'INCOME'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                  ]"
                >
                  <i :class="t.type === 'INCOME' ? 'pi pi-arrow-down-left' : 'pi pi-arrow-up-right'"></i>
                  {{ t.type }}
                </span>
              </td>
              <td class="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">{{ t.category.name }}</td>
              <td class="py-3 px-4 text-slate-600 dark:text-slate-300">{{ t.account.name }}</td>
              <td class="py-3 px-4 text-slate-500">
                <span class="font-medium text-slate-700 dark:text-slate-200">{{ t.description || '-' }}</span>
                <span v-if="t.merchant" class="block text-[11px] text-slate-400">Merchant: {{ t.merchant }}</span>
              </td>
              <td :class="['py-3 px-4 text-right font-black text-sm', t.type === 'INCOME' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400']">
                {{ t.type === 'INCOME' ? '+' : '-' }}৳{{ t.amount.toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination Footer -->
      <div v-if="totalPages > 1" class="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
        <span>Page {{ page }} of {{ totalPages }}</span>
        <div class="flex items-center gap-1">
          <button
            @click="changePage(page - 1)"
            :disabled="page <= 1"
            class="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40"
          >
            Previous
          </button>
          <button
            @click="changePage(page + 1)"
            :disabled="page >= totalPages"
            class="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
