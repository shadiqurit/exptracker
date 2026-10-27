<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { apiClient } from '../api/client';
import { Account, AccountType } from '../types';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import Dialog from 'primevue/dialog';

const toast = useToast();
const confirm = useConfirm();

const accounts = ref<Account[]>([]);
const isLoading = ref(true);

const showCreateDialog = ref(false);
const showEditDialog = ref(false);
const showStatementDialog = ref(false);

const selectedAccount = ref<Account | null>(null);
const statementData = ref<any>(null);
const isStatementLoading = ref(false);

const form = ref({
  name: '',
  type: 'CASH' as AccountType,
  accountNumber: '',
  bankName: '',
  currency: 'BDT',
  openingBalance: 0,
  description: '',
});

const accountTypes: { label: string; value: AccountType; icon: string }[] = [
  { label: 'Cash in Hand', value: 'CASH', icon: 'pi pi-money-bill' },
  { label: 'Bank Account', value: 'BANK', icon: 'pi pi-building' },
  { label: 'Mobile Banking (bKash/Nagad)', value: 'MOBILE_BANKING', icon: 'pi pi-mobile' },
  { label: 'Savings Account', value: 'SAVINGS', icon: 'pi pi-shield' },
  { label: 'Debit Card', value: 'DEBIT_CARD', icon: 'pi pi-credit-card' },
  { label: 'Credit Card', value: 'CREDIT_CARD', icon: 'pi pi-credit-card' },
  { label: 'Digital Wallet', value: 'DIGITAL_WALLET', icon: 'pi pi-wallet' },
  { label: 'Other Account', value: 'OTHER', icon: 'pi pi-tag' },
];

async function loadAccounts() {
  isLoading.value = true;
  try {
    const res = await apiClient.get('/accounts', { params: { includeArchived: true } });
    accounts.value = res.data.data;
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Could not load accounts', life: 3000 });
  } finally {
    isLoading.value = false;
  }
}

onMounted(() => {
  loadAccounts();
});

function openCreateModal() {
  form.value = {
    name: '',
    type: 'CASH',
    accountNumber: '',
    bankName: '',
    currency: 'BDT',
    openingBalance: 0,
    description: '',
  };
  showCreateDialog.value = true;
}

async function handleCreateAccount() {
  try {
    await apiClient.post('/accounts', form.value);
    toast.add({ severity: 'success', summary: 'Success', detail: 'Account created successfully', life: 3000 });
    showCreateDialog.value = false;
    loadAccounts();
  } catch (error: any) {
    toast.add({ severity: 'error', summary: 'Error', detail: error.response?.data?.message || 'Failed to create account', life: 4000 });
  }
}

function openEditModal(acc: Account) {
  selectedAccount.value = acc;
  form.value = {
    name: acc.name,
    type: acc.type,
    accountNumber: acc.accountNumber || '',
    bankName: acc.bankName || '',
    currency: acc.currency,
    openingBalance: acc.openingBalance,
    description: acc.description || '',
  };
  showEditDialog.value = true;
}

async function handleUpdateAccount() {
  if (!selectedAccount.value) return;
  try {
    await apiClient.patch(`/accounts/${selectedAccount.value.id}`, form.value);
    toast.add({ severity: 'success', summary: 'Success', detail: 'Account updated successfully', life: 3000 });
    showEditDialog.value = false;
    loadAccounts();
  } catch (error: any) {
    toast.add({ severity: 'error', summary: 'Error', detail: error.response?.data?.message || 'Failed to update account', life: 4000 });
  }
}

function confirmArchive(acc: Account) {
  confirm.require({
    message: `Archive "${acc.name}"? Transactions will be retained for historical ledger balance.`,
    header: 'Archive Account',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-warning',
    accept: async () => {
      try {
        await apiClient.post(`/accounts/${acc.id}/archive`);
        toast.add({ severity: 'info', summary: 'Archived', detail: 'Account archived', life: 3000 });
        loadAccounts();
      } catch (e: any) {
        toast.add({ severity: 'error', summary: 'Error', detail: e.response?.data?.message, life: 3000 });
      }
    },
  });
}

async function viewStatement(acc: Account) {
  selectedAccount.value = acc;
  showStatementDialog.value = true;
  isStatementLoading.value = true;
  try {
    const res = await apiClient.get(`/accounts/${acc.id}/statement`);
    statementData.value = res.data.data;
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch statement', life: 3000 });
  } finally {
    isStatementLoading.value = false;
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60 dark:border-slate-800">
      <div>
        <h1 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Financial Accounts</h1>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Manage bank accounts, physical cash, digital wallets, and cards</p>
      </div>

      <button
        @click="openCreateModal"
        class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20 transition-all self-start sm:self-auto"
      >
        <i class="pi pi-plus text-xs"></i>
        <span>Add Account</span>
      </button>
    </div>

    <!-- Accounts Cards Grid -->
    <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      <div v-for="n in 3" :key="n" class="h-44 rounded-3xl bg-slate-100 dark:bg-slate-800 animate-pulse"></div>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      <div
        v-for="acc in accounts"
        :key="acc.id"
        :class="[
          'bg-white dark:bg-slate-800 rounded-3xl p-6 border transition-all relative overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-md',
          acc.status === 'ARCHIVED'
            ? 'opacity-60 border-slate-200 dark:border-slate-700'
            : 'border-slate-200/80 dark:border-slate-700/60'
        ]"
      >
        <!-- Top Row -->
        <div>
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-3">
              <div class="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-lg">
                <i class="pi pi-wallet"></i>
              </div>
              <div>
                <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  {{ acc.name }}
                  <span v-if="acc.status === 'ARCHIVED'" class="text-[10px] uppercase px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500">
                    Archived
                  </span>
                </h3>
                <p class="text-xs text-slate-400">{{ acc.bankName || acc.type.replace('_', ' ') }}</p>
              </div>
            </div>

            <span class="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
              {{ acc.currency }}
            </span>
          </div>

          <!-- Balance Area -->
          <div class="mt-5 space-y-1">
            <p class="text-xs uppercase tracking-wider font-semibold text-slate-400">Current Balance</p>
            <p class="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              ৳{{ acc.currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
            </p>
          </div>

          <div class="mt-2 text-xs text-slate-400 flex items-center gap-4">
            <span>Opening: ৳{{ acc.openingBalance.toLocaleString() }}</span>
            <span v-if="acc.accountNumber">• {{ acc.accountNumber }}</span>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="pt-5 mt-4 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-between">
          <button
            @click="viewStatement(acc)"
            class="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
          >
            <i class="pi pi-list text-[10px]"></i>
            <span>Statement</span>
          </button>

          <div class="flex items-center gap-1.5">
            <button
              @click="openEditModal(acc)"
              class="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center transition-colors"
              title="Edit account"
            >
              <i class="pi pi-pencil text-xs"></i>
            </button>
            <button
              v-if="acc.status === 'ACTIVE'"
              @click="confirmArchive(acc)"
              class="w-7 h-7 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 flex items-center justify-center transition-colors"
              title="Archive account"
            >
              <i class="pi pi-inbox text-xs"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Account Modal -->
    <Dialog v-model:visible="showCreateDialog" modal header="Create Financial Account" :style="{ width: '92vw', maxWidth: '30rem' }">
      <form @submit.prevent="handleCreateAccount" class="space-y-4 pt-2">
        <div>
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Account Name</label>
          <input
            v-model="form.name"
            required
            placeholder="e.g. City Bank Primary, Cash, bKash"
            class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Account Type</label>
            <select
              v-model="form.type"
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option v-for="t in accountTypes" :key="t.value" :value="t.value">{{ t.label }}</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Opening Balance</label>
            <input
              v-model.number="form.openingBalance"
              type="number"
              step="0.01"
              min="0"
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Bank / Provider</label>
            <input
              v-model="form.bankName"
              placeholder="e.g. City Bank Ltd."
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Account Number</label>
            <input
              v-model="form.accountNumber"
              placeholder="e.g. •••• 1234"
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
        </div>

        <div class="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-4">
          <button
            type="button"
            @click="showCreateDialog = false"
            class="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-center"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
          >
            Save Account
          </button>
        </div>
      </form>
    </Dialog>

    <!-- Edit Account Modal -->
    <Dialog v-model:visible="showEditDialog" modal header="Edit Account" :style="{ width: '92vw', maxWidth: '30rem' }">
      <form @submit.prevent="handleUpdateAccount" class="space-y-4 pt-2">
        <div>
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Account Name</label>
          <input
            v-model="form.name"
            required
            class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Bank Name</label>
            <input
              v-model="form.bankName"
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Account Number</label>
            <input
              v-model="form.accountNumber"
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
        </div>

        <div class="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-4">
          <button
            type="button"
            @click="showEditDialog = false"
            class="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-center"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
          >
            Update Account
          </button>
        </div>
      </form>
    </Dialog>

    <!-- Account Statement Dialog -->
    <Dialog v-model:visible="showStatementDialog" modal :header="`Account Statement — ${selectedAccount?.name}`" :style="{ width: '94vw', maxWidth: '48rem' }">
      <div v-if="isStatementLoading" class="p-8 text-center text-slate-400 text-xs">
        <i class="pi pi-spin pi-spinner text-lg mb-2"></i>
        <p>Loading ledger entries...</p>
      </div>
      <div v-else-if="statementData" class="space-y-4">
        <!-- Summary Strip -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
          <div>
            <span class="text-[11px] text-slate-400 uppercase font-semibold">Opening Balance</span>
            <p class="text-xl font-bold text-slate-900 dark:text-white">৳{{ statementData.periodOpeningBalance.toLocaleString() }}</p>
          </div>
          <div>
            <span class="text-[11px] text-slate-400 uppercase font-semibold">Closing Balance</span>
            <p class="text-xl font-bold text-emerald-600 dark:text-emerald-400">৳{{ statementData.periodClosingBalance.toLocaleString() }}</p>
          </div>
        </div>

        <!-- Ledger Entries Table -->
        <div class="overflow-x-auto touch-scroll max-h-96">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold sticky top-0">
              <tr>
                <th class="py-2.5 px-3">Date</th>
                <th class="py-2.5 px-3">Description</th>
                <th class="py-2.5 px-3">Type</th>
                <th class="py-2.5 px-3 text-right">In / Out</th>
                <th class="py-2.5 px-3 text-right">Running</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
              <tr v-for="st in statementData.statements" :key="st.id" class="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                <td class="py-2.5 px-3 text-slate-500 whitespace-nowrap">{{ new Date(st.date).toLocaleDateString() }}</td>
                <td class="py-2.5 px-3 font-medium">{{ st.description || '-' }}</td>
                <td class="py-2.5 px-3 text-slate-400">{{ st.type }}</td>
                <td :class="['py-2.5 px-3 text-right font-bold', st.direction === 'CREDIT' ? 'text-emerald-600' : 'text-rose-600']">
                  {{ st.direction === 'CREDIT' ? '+' : '-' }}৳{{ st.amount.toLocaleString() }}
                </td>
                <td class="py-2.5 px-3 text-right font-semibold text-slate-900 dark:text-white">৳{{ st.runningBalance.toLocaleString() }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </Dialog>
  </div>
</template>
