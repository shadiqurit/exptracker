<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { apiClient } from '../api/client';
import { Transaction, Account, Category } from '../types';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import Dialog from 'primevue/dialog';
import dayjs from 'dayjs';

const toast = useToast();
const confirm = useConfirm();

const incomes = ref<Transaction[]>([]);
const accounts = ref<Account[]>([]);
const categories = ref<Category[]>([]);
const isLoading = ref(true);

const filterAccount = ref('');
const filterCategory = ref('');
const filterSearch = ref('');

const showDialog = ref(false);
const isEditing = ref(false);
const editingId = ref<string | null>(null);

const form = ref({
  accountId: '',
  categoryId: '',
  amount: 0,
  transactionDate: dayjs().format('YYYY-MM-DDTHH:mm'),
  description: '',
  referenceNumber: '',
  merchant: '',
});

async function loadData() {
  isLoading.value = true;
  try {
    const [incRes, accRes, catRes] = await Promise.all([
      apiClient.get('/transactions', {
        params: {
          type: 'INCOME',
          accountId: filterAccount.value || undefined,
          categoryId: filterCategory.value || undefined,
          search: filterSearch.value || undefined,
          limit: 100,
        },
      }),
      apiClient.get('/accounts'),
      apiClient.get('/categories', { params: { type: 'INCOME' } }),
    ]);

    incomes.value = incRes.data.data;
    accounts.value = accRes.data.data;
    categories.value = catRes.data.data;
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Could not load income records', life: 3000 });
  } finally {
    isLoading.value = false;
  }
}

watch([filterAccount, filterCategory], () => {
  loadData();
});

onMounted(() => {
  loadData();
});

function openCreateModal() {
  isEditing.value = false;
  editingId.value = null;
  form.value = {
    accountId: accounts.value[0]?.id || '',
    categoryId: categories.value[0]?.id || '',
    amount: 0,
    transactionDate: dayjs().format('YYYY-MM-DDTHH:mm'),
    description: '',
    referenceNumber: '',
    merchant: '',
  };
  showDialog.value = true;
}

function openEditModal(tx: Transaction) {
  isEditing.value = true;
  editingId.value = tx.id;
  form.value = {
    accountId: tx.accountId,
    categoryId: tx.categoryId,
    amount: tx.amount,
    transactionDate: dayjs(tx.transactionDate).format('YYYY-MM-DDTHH:mm'),
    description: tx.description || '',
    referenceNumber: tx.referenceNumber || '',
    merchant: tx.merchant || '',
  };
  showDialog.value = true;
}

async function handleSaveIncome() {
  if (form.value.amount <= 0) {
    toast.add({ severity: 'warn', summary: 'Invalid Amount', detail: 'Income amount must be greater than zero', life: 3000 });
    return;
  }

  try {
    if (isEditing.value && editingId.value) {
      await apiClient.patch(`/transactions/${editingId.value}`, {
        ...form.value,
        type: 'INCOME',
      });
      toast.add({ severity: 'success', summary: 'Updated', detail: 'Income transaction updated', life: 3000 });
    } else {
      await apiClient.post('/transactions', {
        ...form.value,
        type: 'INCOME',
      });
      toast.add({ severity: 'success', summary: 'Recorded', detail: 'Income recorded successfully', life: 3000 });
    }
    showDialog.value = false;
    loadData();
  } catch (error: any) {
    toast.add({ severity: 'error', summary: 'Error', detail: error.response?.data?.message || 'Failed to save income', life: 4000 });
  }
}

function confirmDelete(tx: Transaction) {
  confirm.require({
    message: `Delete income transaction of ৳${tx.amount.toLocaleString()}? The ledger balance will adjust automatically.`,
    header: 'Confirm Delete',
    icon: 'pi pi-trash',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await apiClient.delete(`/transactions/${tx.id}`);
        toast.add({ severity: 'info', summary: 'Deleted', detail: 'Transaction deleted', life: 3000 });
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
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60 dark:border-slate-800">
      <div>
        <h1 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Income Management</h1>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Track salary, freelancing, investments, bonuses & incoming funds</p>
      </div>

      <button
        @click="openCreateModal"
        class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20 transition-all self-start sm:self-auto"
      >
        <i class="pi pi-plus text-xs"></i>
        <span>Record Income</span>
      </button>
    </div>

    <!-- Filters Strip -->
    <div class="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-sm">
      <div class="flex-1 min-w-[200px]">
        <div class="relative">
          <i class="pi pi-search absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
          <input
            v-model="filterSearch"
            @keyup.enter="loadData"
            placeholder="Search description, reference..."
            class="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>
      </div>

      <select
        v-model="filterAccount"
        class="text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none"
      >
        <option value="">All Accounts</option>
        <option v-for="a in accounts" :key="a.id" :value="a.id">{{ a.name }}</option>
      </select>

      <select
        v-model="filterCategory"
        class="text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none"
      >
        <option value="">All Categories</option>
        <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
      </select>
    </div>

    <!-- Data Table -->
    <div class="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700/60 shadow-sm overflow-hidden">
      <div v-if="isLoading" class="p-8 text-center text-slate-400 text-xs">
        <i class="pi pi-spin pi-spinner text-lg mb-2"></i>
        <p>Loading income records...</p>
      </div>

      <div v-else-if="incomes.length === 0" class="p-12 text-center space-y-3">
        <div class="w-12 h-12 mx-auto rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-500 flex items-center justify-center text-xl">
          <i class="pi pi-inbox"></i>
        </div>
        <p class="text-sm font-bold text-slate-700 dark:text-slate-200">No income transactions found</p>
        <p class="text-xs text-slate-400 max-w-sm mx-auto">Get started by clicking "Record Income" above to register your first earnings.</p>
      </div>

      <div v-else class="overflow-x-auto touch-scroll">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-50/80 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-700/60 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px]">
            <tr>
              <th class="py-3.5 px-4">Date</th>
              <th class="py-3.5 px-4">Category</th>
              <th class="py-3.5 px-4">Account</th>
              <th class="py-3.5 px-4">Description</th>
              <th class="py-3.5 px-4">Reference</th>
              <th class="py-3.5 px-4 text-right">Amount</th>
              <th class="py-3.5 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
            <tr v-for="item in incomes" :key="item.id" class="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
              <td class="py-3 px-4 text-slate-500 whitespace-nowrap">
                {{ dayjs(item.transactionDate).format('DD MMM YYYY, hh:mm A') }}
              </td>
              <td class="py-3 px-4">
                <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  <i :class="[item.category.icon || 'pi pi-wallet', 'text-[11px]']"></i>
                  {{ item.category.name }}
                </span>
              </td>
              <td class="py-3 px-4 font-semibold text-slate-700 dark:text-slate-200">{{ item.account.name }}</td>
              <td class="py-3 px-4 text-slate-600 dark:text-slate-300">{{ item.description || '-' }}</td>
              <td class="py-3 px-4 text-slate-400 font-mono text-[11px]">{{ item.referenceNumber || '-' }}</td>
              <td class="py-3 px-4 text-right font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">
                +৳{{ item.amount.toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
              </td>
              <td class="py-3 px-4 text-center">
                <div class="inline-flex items-center gap-1">
                  <button
                    @click="openEditModal(item)"
                    class="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center transition-colors"
                  >
                    <i class="pi pi-pencil text-xs"></i>
                  </button>
                  <button
                    @click="confirmDelete(item)"
                    class="w-7 h-7 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center justify-center transition-colors"
                  >
                    <i class="pi pi-trash text-xs"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Income Dialog -->
    <Dialog v-model:visible="showDialog" modal :header="isEditing ? 'Edit Income Transaction' : 'Record New Income'" :style="{ width: '92vw', maxWidth: '32rem' }">
      <form @submit.prevent="handleSaveIncome" class="space-y-4 pt-2">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Financial Account</label>
            <select
              v-model="form.accountId"
              required
              class="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option v-for="a in accounts" :key="a.id" :value="a.id">{{ a.name }}</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Income Category</label>
            <select
              v-model="form.categoryId"
              required
              class="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Amount (BDT)</label>
            <input
              v-model.number="form.amount"
              type="number"
              step="0.01"
              required
              min="0.01"
              class="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-bold"
            />
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Transaction Date</label>
            <input
              v-model="form.transactionDate"
              type="datetime-local"
              required
              class="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Description / Memo</label>
          <input
            v-model="form.description"
            placeholder="e.g. October Monthly Salary, Freelance project payout"
            class="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Payer / Source</label>
            <input
              v-model="form.merchant"
              placeholder="e.g. Acme Corp, Upwork"
              class="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Reference No.</label>
            <input
              v-model="form.referenceNumber"
              placeholder="e.g. PAY-92812"
              class="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
        </div>

        <div class="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-4">
          <button
            type="button"
            @click="showDialog = false"
            class="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-center"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
          >
            {{ isEditing ? 'Update Income' : 'Record Income' }}
          </button>
        </div>
      </form>
    </Dialog>
  </div>
</template>
