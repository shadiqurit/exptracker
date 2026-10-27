<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { apiClient } from '../api/client';
import { Budget, Category } from '../types';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import Dialog from 'primevue/dialog';
import dayjs from 'dayjs';

const toast = useToast();
const confirm = useConfirm();

const budgets = ref<Budget[]>([]);
const categories = ref<Category[]>([]);
const isLoading = ref(true);

const selectedMonth = ref(dayjs().month() + 1);
const selectedYear = ref(dayjs().year());

const showDialog = ref(false);
const isEditing = ref(false);
const editingId = ref<string | null>(null);

const form = ref({
  categoryId: null as string | null,
  amount: 0,
  month: selectedMonth.value,
  year: selectedYear.value,
  alertThreshold80: true,
  alertThreshold100: true,
});

const months = [
  { label: 'January', value: 1 },
  { label: 'February', value: 2 },
  { label: 'March', value: 3 },
  { label: 'April', value: 4 },
  { label: 'May', value: 5 },
  { label: 'June', value: 6 },
  { label: 'July', value: 7 },
  { label: 'August', value: 8 },
  { label: 'September', value: 9 },
  { label: 'October', value: 10 },
  { label: 'November', value: 11 },
  { label: 'December', value: 12 },
];

async function loadData() {
  isLoading.value = true;
  try {
    const [bRes, catRes] = await Promise.all([
      apiClient.get('/budgets', {
        params: { month: selectedMonth.value, year: selectedYear.value },
      }),
      apiClient.get('/categories', { params: { type: 'EXPENSE' } }),
    ]);

    budgets.value = bRes.data.data;
    categories.value = catRes.data.data;
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Could not load budgets', life: 3000 });
  } finally {
    isLoading.value = false;
  }
}

onMounted(() => {
  loadData();
});

function openCreateModal() {
  isEditing.value = false;
  editingId.value = null;
  form.value = {
    categoryId: null,
    amount: 0,
    month: selectedMonth.value,
    year: selectedYear.value,
    alertThreshold80: true,
    alertThreshold100: true,
  };
  showDialog.value = true;
}

function openEditModal(b: Budget) {
  isEditing.value = true;
  editingId.value = b.id;
  form.value = {
    categoryId: b.categoryId || null,
    amount: b.amount,
    month: b.month,
    year: b.year,
    alertThreshold80: b.alertThreshold80,
    alertThreshold100: b.alertThreshold100,
  };
  showDialog.value = true;
}

async function handleSaveBudget() {
  if (form.value.amount <= 0) {
    toast.add({ severity: 'warn', summary: 'Invalid Amount', detail: 'Budget amount must be positive', life: 3000 });
    return;
  }

  try {
    if (isEditing.value && editingId.value) {
      await apiClient.patch(`/budgets/${editingId.value}`, {
        amount: form.value.amount,
        alertThreshold80: form.value.alertThreshold80,
        alertThreshold100: form.value.alertThreshold100,
      });
      toast.add({ severity: 'success', summary: 'Updated', detail: 'Budget updated successfully', life: 3000 });
    } else {
      await apiClient.post('/budgets', form.value);
      toast.add({ severity: 'success', summary: 'Created', detail: 'Budget established successfully', life: 3000 });
    }
    showDialog.value = false;
    loadData();
  } catch (error: any) {
    toast.add({ severity: 'error', summary: 'Error', detail: error.response?.data?.message || 'Could not save budget', life: 4000 });
  }
}

function confirmDelete(b: Budget) {
  confirm.require({
    message: `Delete budget for "${b.categoryName}"?`,
    header: 'Delete Budget',
    icon: 'pi pi-trash',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await apiClient.delete(`/budgets/${b.id}`);
        toast.add({ severity: 'info', summary: 'Deleted', detail: 'Budget removed', life: 3000 });
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
        <h1 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Budget Management</h1>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Plan monthly spending limits with proactive 80% & 100% threshold alerts</p>
      </div>

      <div class="flex items-center gap-3">
        <select
          v-model.number="selectedMonth"
          @change="loadData"
          class="text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none"
        >
          <option v-for="m in months" :key="m.value" :value="m.value">{{ m.label }}</option>
        </select>

        <button
          @click="openCreateModal"
          class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20 transition-all"
        >
          <i class="pi pi-plus text-xs"></i>
          <span>Set Budget</span>
        </button>
      </div>
    </div>

    <!-- Budgets Grid -->
    <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      <div v-for="n in 3" :key="n" class="h-44 rounded-3xl bg-slate-100 dark:bg-slate-800 animate-pulse"></div>
    </div>

    <div v-else-if="budgets.length === 0" class="p-12 text-center bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700/60 shadow-sm space-y-3">
      <div class="w-12 h-12 mx-auto rounded-full bg-blue-50 dark:bg-blue-950 text-blue-500 flex items-center justify-center text-xl">
        <i class="pi pi-chart-pie"></i>
      </div>
      <p class="text-sm font-bold text-slate-700 dark:text-slate-200">No budgets created for this month</p>
      <p class="text-xs text-slate-400 max-w-sm mx-auto">Set an overall monthly spending limit or category-wise targets to keep your budget under control.</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      <div
        v-for="b in budgets"
        :key="b.id"
        class="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-700/60 shadow-sm hover:shadow-md transition-shadow space-y-4"
      >
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-3">
            <div
              :class="[
                'w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-base',
                b.isExceeded100
                  ? 'bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-300'
                  : b.isWarning80
                  ? 'bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-300'
                  : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300'
              ]"
            >
              <i :class="b.categoryIcon || 'pi pi-chart-pie'"></i>
            </div>
            <div>
              <h3 class="text-sm font-bold text-slate-900 dark:text-white">{{ b.categoryName }}</h3>
              <p class="text-xs text-slate-400">Limit: ৳{{ b.amount.toLocaleString() }}</p>
            </div>
          </div>

          <span
            :class="[
              'text-[10px] font-black uppercase px-2 py-0.5 rounded-full',
              b.isExceeded100
                ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                : b.isWarning80
                ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
            ]"
          >
            {{ b.percentage }}%
          </span>
        </div>

        <!-- Alert Notification Box -->
        <div
          v-if="b.isExceeded100"
          class="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200/60 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-[11px] font-semibold flex items-center gap-2"
        >
          <i class="pi pi-exclamation-circle text-xs shrink-0"></i>
          <span>Budget limit exceeded by ৳{{ (b.actualSpent - b.amount).toLocaleString() }}!</span>
        </div>
        <div
          v-else-if="b.isWarning80"
          class="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-900 text-amber-700 dark:text-amber-300 text-[11px] font-semibold flex items-center gap-2"
        >
          <i class="pi pi-exclamation-triangle text-xs shrink-0"></i>
          <span>Attention: 80% threshold reached. ৳{{ b.remaining.toLocaleString() }} remaining.</span>
        </div>

        <!-- Progress Bar -->
        <div class="space-y-1">
          <div class="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
            <div
              :class="[
                'h-full rounded-full transition-all duration-500',
                b.isExceeded100 ? 'bg-rose-500' : b.isWarning80 ? 'bg-amber-500' : 'bg-emerald-500'
              ]"
              :style="{ width: `${Math.min(100, b.percentage)}%` }"
            ></div>
          </div>
          <div class="flex items-center justify-between text-xs text-slate-500 pt-1">
            <span>Spent: ৳{{ b.actualSpent.toLocaleString() }}</span>
            <span class="font-bold text-slate-700 dark:text-slate-300">Remaining: ৳{{ b.remaining.toLocaleString() }}</span>
          </div>
        </div>

        <!-- Action Footer -->
        <div class="pt-3 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-end gap-1">
          <button
            @click="openEditModal(b)"
            class="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center transition-colors"
          >
            <i class="pi pi-pencil text-xs"></i>
          </button>
          <button
            @click="confirmDelete(b)"
            class="w-7 h-7 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center justify-center transition-colors"
          >
            <i class="pi pi-trash text-xs"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Create/Edit Budget Dialog -->
    <Dialog v-model:visible="showDialog" modal :header="isEditing ? 'Update Budget' : 'Define Monthly Budget'" :style="{ width: '92vw', maxWidth: '28rem' }">
      <form @submit.prevent="handleSaveBudget" class="space-y-4 pt-2">
        <div>
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Budget Scope</label>
          <select
            v-model="form.categoryId"
            :disabled="isEditing"
            class="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50"
          >
            <option :value="null">Overall Monthly Budget (All Expenses)</option>
            <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Monthly Spending Limit (BDT)</label>
          <input
            v-model.number="form.amount"
            type="number"
            step="100"
            required
            min="1"
            class="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-bold"
          />
        </div>

        <div class="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-700">
          <p class="text-xs font-bold text-slate-700 dark:text-slate-300">Alert Notifications</p>
          <label class="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
            <input type="checkbox" v-model="form.alertThreshold80" class="rounded text-emerald-600" />
            <span>Enable 80% usage warning alert</span>
          </label>
          <label class="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
            <input type="checkbox" v-model="form.alertThreshold100" class="rounded text-rose-600" />
            <span>Enable 100% budget exceeded alert</span>
          </label>
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
            Save Budget
          </button>
        </div>
      </form>
    </Dialog>
  </div>
</template>
