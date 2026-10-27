<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { apiClient } from '../api/client';
import { Transfer, Account } from '../types';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import Dialog from 'primevue/dialog';
import dayjs from 'dayjs';

const toast = useToast();
const confirm = useConfirm();

const transfers = ref<Transfer[]>([]);
const accounts = ref<Account[]>([]);
const isLoading = ref(true);

const showDialog = ref(false);
const form = ref({
  sourceAccountId: '',
  destinationAccountId: '',
  amount: 0,
  transferDate: dayjs().format('YYYY-MM-DDTHH:mm'),
  description: '',
  referenceNumber: '',
});

async function loadData() {
  isLoading.value = true;
  try {
    const [trfRes, accRes] = await Promise.all([
      apiClient.get('/transfers'),
      apiClient.get('/accounts'),
    ]);
    transfers.value = trfRes.data.data;
    accounts.value = accRes.data.data;
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load transfer history', life: 3000 });
  } finally {
    isLoading.value = false;
  }
}

onMounted(() => {
  loadData();
});

function openTransferModal() {
  form.value = {
    sourceAccountId: accounts.value[0]?.id || '',
    destinationAccountId: accounts.value[1]?.id || '',
    amount: 0,
    transferDate: dayjs().format('YYYY-MM-DDTHH:mm'),
    description: '',
    referenceNumber: '',
  };
  showDialog.value = true;
}

async function handleExecuteTransfer() {
  if (form.value.sourceAccountId === form.value.destinationAccountId) {
    toast.add({ severity: 'warn', summary: 'Invalid Transfer', detail: 'Source and destination accounts must be different', life: 3000 });
    return;
  }
  if (form.value.amount <= 0) {
    toast.add({ severity: 'warn', summary: 'Invalid Amount', detail: 'Amount must be greater than zero', life: 3000 });
    return;
  }

  try {
    await apiClient.post('/transfers', form.value);
    toast.add({ severity: 'success', summary: 'Transfer Complete', detail: 'Funds transferred successfully', life: 3000 });
    showDialog.value = false;
    loadData();
  } catch (error: any) {
    toast.add({ severity: 'error', summary: 'Transfer Failed', detail: error.response?.data?.message || 'Could not process transfer', life: 4000 });
  }
}

function confirmReversal(t: Transfer) {
  confirm.require({
    message: `Reverse transfer of ৳${t.amount.toLocaleString()} from ${t.destinationAccount.name} back to ${t.sourceAccount.name}?`,
    header: 'Reverse Fund Transfer',
    icon: 'pi pi-replay',
    acceptClass: 'p-button-warning',
    accept: async () => {
      try {
        await apiClient.post(`/transfers/${t.id}/reverse`, { reason: 'User requested transfer reversal' });
        toast.add({ severity: 'info', summary: 'Reversed', detail: 'Transfer reversed and funds restored', life: 3000 });
        loadData();
      } catch (e: any) {
        toast.add({ severity: 'error', summary: 'Reversal Error', detail: e.response?.data?.message, life: 3000 });
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
        <h1 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Account-to-Account Transfers</h1>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Move funds between your personal accounts with atomic balance updates</p>
      </div>

      <button
        @click="openTransferModal"
        class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition-all self-start sm:self-auto"
      >
        <i class="pi pi-arrows-h text-xs"></i>
        <span>Transfer Funds</span>
      </button>
    </div>

    <!-- Transfer Info Banner -->
    <div class="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-800/40 text-xs text-blue-900 dark:text-blue-200 flex items-start gap-3">
      <i class="pi pi-info-circle text-base text-blue-500 mt-0.5 shrink-0"></i>
      <div>
        <p class="font-bold">Ledger Architecture Rule:</p>
        <p class="text-blue-700 dark:text-blue-300 mt-0.5">
          Transfers between your accounts do not count as Income or Expenses. Your combined total wealth remains unchanged while individual account balances adjust immediately.
        </p>
      </div>
    </div>

    <!-- Transfers Table -->
    <div class="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700/60 shadow-sm overflow-hidden">
      <div v-if="isLoading" class="p-8 text-center text-slate-400 text-xs">
        <i class="pi pi-spin pi-spinner text-lg mb-2"></i>
        <p>Loading transfer history...</p>
      </div>

      <div v-else-if="transfers.length === 0" class="p-12 text-center text-slate-400 text-xs space-y-2">
        <i class="pi pi-arrows-h text-2xl text-slate-300"></i>
        <p class="font-bold text-slate-600 dark:text-slate-300">No transfers recorded</p>
        <p>Click "Transfer Funds" above to move money between your accounts.</p>
      </div>

      <div v-else class="overflow-x-auto touch-scroll">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-50/80 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-700/60 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px]">
            <tr>
              <th class="py-3.5 px-4">Date</th>
              <th class="py-3.5 px-4">Source Account (Debit)</th>
              <th class="py-3.5 px-4">Destination Account (Credit)</th>
              <th class="py-3.5 px-4">Description</th>
              <th class="py-3.5 px-4">Status</th>
              <th class="py-3.5 px-4 text-right">Transfer Amount</th>
              <th class="py-3.5 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
            <tr v-for="t in transfers" :key="t.id" class="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
              <td class="py-3 px-4 text-slate-500 whitespace-nowrap">
                {{ dayjs(t.transferDate).format('DD MMM YYYY, hh:mm A') }}
              </td>
              <td class="py-3 px-4 font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                <i class="pi pi-arrow-up-right text-xs"></i>
                {{ t.sourceAccount.name }}
              </td>
              <td class="py-3 px-4 font-semibold text-emerald-600 dark:text-emerald-400">
                <span class="inline-flex items-center gap-1.5">
                  <i class="pi pi-arrow-down-left text-xs"></i>
                  {{ t.destinationAccount.name }}
                </span>
              </td>
              <td class="py-3 px-4 text-slate-600 dark:text-slate-300">{{ t.description || '-' }}</td>
              <td class="py-3 px-4">
                <span
                  :class="[
                    'text-[10px] font-bold px-2 py-0.5 rounded-full uppercase',
                    t.status === 'COMPLETED'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  ]"
                >
                  {{ t.status }}
                </span>
              </td>
              <td class="py-3 px-4 text-right font-black text-sm text-blue-600 dark:text-blue-400">
                ৳{{ t.amount.toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
              </td>
              <td class="py-3 px-4 text-center">
                <button
                  v-if="t.status === 'COMPLETED'"
                  @click="confirmReversal(t)"
                  class="text-[11px] font-bold px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  Reverse
                </button>
                <span v-else class="text-[11px] text-slate-400 italic">Reversed</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Transfer Dialog -->
    <Dialog v-model:visible="showDialog" modal header="Internal Fund Transfer" :style="{ width: '92vw', maxWidth: '32rem' }">
      <form @submit.prevent="handleExecuteTransfer" class="space-y-4 pt-2">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Source Account (Outflow)</label>
            <select
              v-model="form.sourceAccountId"
              required
              class="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option v-for="a in accounts" :key="a.id" :value="a.id">
                {{ a.name }} (৳{{ a.currentBalance.toLocaleString() }})
              </option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Destination (Inflow)</label>
            <select
              v-model="form.destinationAccountId"
              required
              class="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option v-for="a in accounts" :key="a.id" :value="a.id">
                {{ a.name }} (৳{{ a.currentBalance.toLocaleString() }})
              </option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Transfer Amount (BDT)</label>
            <input
              v-model.number="form.amount"
              type="number"
              step="0.01"
              required
              min="0.01"
              class="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-bold"
            />
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Transfer Date</label>
            <input
              v-model="form.transferDate"
              type="datetime-local"
              required
              class="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Description / Memo</label>
          <input
            v-model="form.description"
            placeholder="e.g. Bank to bKash transfer for daily expenses"
            class="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Reference Number</label>
          <input
            v-model="form.referenceNumber"
            placeholder="e.g. TRF-102938"
            class="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
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
            class="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
          >
            Execute Transfer
          </button>
        </div>
      </form>
    </Dialog>
  </div>
</template>
