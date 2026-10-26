<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { apiClient } from '../api/client';
import { Account } from '../types';
import dayjs from 'dayjs';

const activeTab = ref<'daily' | 'monthly' | 'yearly' | 'account' | 'category'>('monthly');
const isLoading = ref(false);

const accounts = ref<Account[]>([]);
const selectedAccountId = ref('');

// Date selectors
const selectedDate = ref(dayjs().format('YYYY-MM-DD'));
const selectedMonth = ref(dayjs().month() + 1);
const selectedYear = ref(dayjs().year());

// Data holders
const dailyData = ref<any>(null);
const monthlyData = ref<any>(null);
const yearlyData = ref<any>(null);
const accountData = ref<any>(null);
const categoryData = ref<any>(null);

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

async function loadAccounts() {
  try {
    const res = await apiClient.get('/accounts');
    accounts.value = res.data.data;
    if (accounts.value.length > 0 && !selectedAccountId.value) {
      selectedAccountId.value = accounts.value[0].id;
    }
  } catch (e) {
    console.error(e);
  }
}

async function loadReport() {
  isLoading.value = true;
  try {
    if (activeTab.value === 'daily') {
      const res = await apiClient.get('/reports/daily', { params: { date: selectedDate.value } });
      dailyData.value = res.data.data;
    } else if (activeTab.value === 'monthly') {
      const res = await apiClient.get('/reports/monthly', { params: { month: selectedMonth.value, year: selectedYear.value } });
      monthlyData.value = res.data.data;
    } else if (activeTab.value === 'yearly') {
      const res = await apiClient.get('/reports/yearly', { params: { year: selectedYear.value } });
      yearlyData.value = res.data.data;
    } else if (activeTab.value === 'account' && selectedAccountId.value) {
      const res = await apiClient.get(`/accounts/${selectedAccountId.value}/statement`);
      accountData.value = res.data.data;
    } else if (activeTab.value === 'category') {
      const res = await apiClient.get('/reports/categories');
      categoryData.value = res.data.data;
    }
  } catch (error) {
    console.error('Failed to load report:', error);
  } finally {
    isLoading.value = false;
  }
}

watch([activeTab, selectedDate, selectedMonth, selectedYear, selectedAccountId], () => {
  loadReport();
});

onMounted(async () => {
  await loadAccounts();
  loadReport();
});

function downloadExport(format: 'pdf' | 'excel' | 'csv') {
  const params: Record<string, any> = {
    reportType: activeTab.value,
    format,
  };

  if (activeTab.value === 'daily') params.date = selectedDate.value;
  if (activeTab.value === 'monthly') {
    params.month = selectedMonth.value;
    params.year = selectedYear.value;
  }
  if (activeTab.value === 'yearly') params.year = selectedYear.value;
  if (activeTab.value === 'account') params.accountId = selectedAccountId.value;

  const url = `${import.meta.env.VITE_API_URL || '/api/v1'}/reports/export?${new URLSearchParams(params).toString()}`;
  window.open(url, '_blank');
}

function handlePrint() {
  window.print();
}
</script>

<template>
  <div class="space-y-6 print:m-0 print:p-0">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60 dark:border-slate-800 print:hidden">
      <div>
        <h1 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Financial Reports & Statements</h1>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Audited daily, monthly, yearly, and account ledger reports with multi-format export</p>
      </div>

      <!-- Export Buttons -->
      <div class="flex items-center gap-2 self-start sm:self-auto">
        <button
          @click="downloadExport('pdf')"
          class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200/60 dark:border-rose-900 hover:bg-rose-100 transition-colors"
          title="Download PDF"
        >
          <i class="pi pi-file-pdf"></i>
          <span>PDF</span>
        </button>

        <button
          @click="downloadExport('excel')"
          class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-900 hover:bg-emerald-100 transition-colors"
          title="Download Excel (.xlsx)"
        >
          <i class="pi pi-file-excel"></i>
          <span>Excel</span>
        </button>

        <button
          @click="downloadExport('csv')"
          class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 transition-colors"
          title="Download CSV"
        >
          <i class="pi pi-file"></i>
          <span>CSV</span>
        </button>

        <button
          @click="handlePrint"
          class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 transition-colors"
          title="Print Report"
        >
          <i class="pi pi-print"></i>
          <span>Print</span>
        </button>
      </div>
    </div>

    <!-- Report Navigation Tabs & Selectors -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-2 print:hidden">
      <div class="flex flex-wrap items-center gap-1">
        <button
          v-for="tab in [
            { id: 'monthly', label: 'Monthly Financial Report', icon: 'pi pi-calendar' },
            { id: 'daily', label: 'Daily Transaction Report', icon: 'pi pi-clock' },
            { id: 'yearly', label: 'Yearly Financial Report', icon: 'pi pi-chart-line' },
            { id: 'account', label: 'Account Statement', icon: 'pi pi-wallet' },
            { id: 'category', label: 'Category Expense Summary', icon: 'pi pi-tags' }
          ]"
          :key="tab.id"
          @click="activeTab = (tab.id as any)"
          :class="[
            'px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5',
            activeTab === tab.id
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
              : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
          ]"
        >
          <i :class="tab.icon"></i>
          <span>{{ tab.label }}</span>
        </button>
      </div>

      <!-- Context Filters depending on Tab -->
      <div class="flex items-center gap-2">
        <template v-if="activeTab === 'daily'">
          <input
            v-model="selectedDate"
            type="date"
            class="text-xs px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
          />
        </template>

        <template v-else-if="activeTab === 'monthly'">
          <select
            v-model.number="selectedMonth"
            class="text-xs px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
          >
            <option v-for="m in months" :key="m.value" :value="m.value">{{ m.label }}</option>
          </select>
          <input
            v-model.number="selectedYear"
            type="number"
            class="w-20 text-xs px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
          />
        </template>

        <template v-else-if="activeTab === 'yearly'">
          <input
            v-model.number="selectedYear"
            type="number"
            class="w-24 text-xs px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
          />
        </template>

        <template v-else-if="activeTab === 'account'">
          <select
            v-model="selectedAccountId"
            class="text-xs px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
          >
            <option v-for="a in accounts" :key="a.id" :value="a.id">{{ a.name }}</option>
          </select>
        </template>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="p-16 text-center text-slate-400 text-xs">
      <i class="pi pi-spin pi-spinner text-xl mb-3"></i>
      <p>Compiling audited financial figures...</p>
    </div>

    <!-- TAB 1: MONTHLY FINANCIAL REPORT -->
    <div v-else-if="activeTab === 'monthly' && monthlyData" class="space-y-6">
      <!-- KPI Top Summary -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 shadow-sm space-y-1">
          <p class="text-xs text-slate-400 font-semibold uppercase">Month Opening</p>
          <p class="text-2xl font-black text-slate-900 dark:text-white">৳{{ monthlyData.openingBalance.toLocaleString() }}</p>
        </div>
        <div class="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 shadow-sm space-y-1">
          <p class="text-xs text-slate-400 font-semibold uppercase">Total Income</p>
          <p class="text-2xl font-black text-emerald-600 dark:text-emerald-400">+৳{{ monthlyData.totalIncome.toLocaleString() }}</p>
        </div>
        <div class="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 shadow-sm space-y-1">
          <p class="text-xs text-slate-400 font-semibold uppercase">Total Expense</p>
          <p class="text-2xl font-black text-rose-600 dark:text-rose-400">-৳{{ monthlyData.totalExpense.toLocaleString() }}</p>
        </div>
        <div class="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 shadow-sm space-y-1">
          <p class="text-xs text-slate-400 font-semibold uppercase">Month Closing</p>
          <p class="text-2xl font-black text-blue-600 dark:text-blue-400">৳{{ monthlyData.closingBalance.toLocaleString() }}</p>
        </div>
      </div>

      <!-- Account-wise Breakdown -->
      <div class="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700/60 shadow-sm overflow-hidden">
        <div class="p-5 border-b border-slate-100 dark:border-slate-700">
          <h3 class="text-sm font-bold text-slate-900 dark:text-white">Account-Wise Reconciliation ({{ monthlyData.monthName }})</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50 dark:bg-slate-800/80 text-slate-500 font-bold uppercase text-[10px]">
              <tr>
                <th class="py-3 px-4">Account</th>
                <th class="py-3 px-4 text-right">Opening</th>
                <th class="py-3 px-4 text-right text-emerald-600">Income</th>
                <th class="py-3 px-4 text-right text-rose-600">Expense</th>
                <th class="py-3 px-4 text-right">Net Transfers</th>
                <th class="py-3 px-4 text-right font-black">Closing Balance</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
              <tr v-for="a in monthlyData.accountBreakdown" :key="a.id">
                <td class="py-3 px-4 font-bold text-slate-800 dark:text-white">{{ a.name }}</td>
                <td class="py-3 px-4 text-right text-slate-500">৳{{ a.openingBalance.toLocaleString() }}</td>
                <td class="py-3 px-4 text-right text-emerald-600 font-semibold">+৳{{ a.income.toLocaleString() }}</td>
                <td class="py-3 px-4 text-right text-rose-600 font-semibold">-৳{{ a.expense.toLocaleString() }}</td>
                <td class="py-3 px-4 text-right text-slate-600 dark:text-slate-300">
                  {{ a.netTransfers >= 0 ? '+' : '' }}৳{{ a.netTransfers.toLocaleString() }}
                </td>
                <td class="py-3 px-4 text-right font-black text-slate-900 dark:text-white">৳{{ a.closingBalance.toLocaleString() }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- TAB 2: DAILY REPORT -->
    <div v-else-if="activeTab === 'daily' && dailyData" class="space-y-6">
      <div class="grid grid-cols-3 gap-4">
        <div class="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 shadow-sm space-y-1">
          <p class="text-xs text-slate-400 font-semibold uppercase">Daily Income</p>
          <p class="text-xl font-bold text-emerald-600">+৳{{ dailyData.totalIncome.toLocaleString() }}</p>
        </div>
        <div class="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 shadow-sm space-y-1">
          <p class="text-xs text-slate-400 font-semibold uppercase">Daily Expense</p>
          <p class="text-xl font-bold text-rose-600">-৳{{ dailyData.totalExpense.toLocaleString() }}</p>
        </div>
        <div class="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 shadow-sm space-y-1">
          <p class="text-xs text-slate-400 font-semibold uppercase">Daily Net</p>
          <p class="text-xl font-bold text-slate-900 dark:text-white">৳{{ dailyData.net.toLocaleString() }}</p>
        </div>
      </div>

      <div class="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700/60 shadow-sm overflow-hidden">
        <div class="p-4 border-b border-slate-100 dark:border-slate-700 font-bold text-sm">
          Transactions on {{ dailyData.date }}
        </div>
        <div v-if="dailyData.transactions.length === 0" class="p-8 text-center text-slate-400 text-xs">
          No transactions recorded on this date.
        </div>
        <table v-else class="w-full text-left text-xs">
          <thead class="bg-slate-50 dark:bg-slate-800/80 text-slate-500 font-bold uppercase text-[10px]">
            <tr>
              <th class="py-3 px-4">Time</th>
              <th class="py-3 px-4">Account</th>
              <th class="py-3 px-4">Category</th>
              <th class="py-3 px-4">Description</th>
              <th class="py-3 px-4 text-right">Income</th>
              <th class="py-3 px-4 text-right">Expense</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
            <tr v-for="t in dailyData.transactions" :key="t.id">
              <td class="py-3 px-4 text-slate-500">{{ dayjs(t.date).format('hh:mm A') }}</td>
              <td class="py-3 px-4 font-semibold">{{ t.account }}</td>
              <td class="py-3 px-4">{{ t.category }}</td>
              <td class="py-3 px-4 text-slate-600 dark:text-slate-300">{{ t.description }}</td>
              <td class="py-3 px-4 text-right text-emerald-600 font-bold">{{ t.income ? `+৳${t.income}` : '-' }}</td>
              <td class="py-3 px-4 text-right text-rose-600 font-bold">{{ t.expense ? `-৳${t.expense}` : '-' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- TAB 3: YEARLY REPORT -->
    <div v-else-if="activeTab === 'yearly' && yearlyData" class="space-y-6">
      <div class="grid grid-cols-3 gap-4">
        <div class="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 shadow-sm space-y-1">
          <p class="text-xs text-slate-400 font-semibold uppercase">Total Year Income</p>
          <p class="text-2xl font-black text-emerald-600">+৳{{ yearlyData.yearlyIncome.toLocaleString() }}</p>
        </div>
        <div class="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 shadow-sm space-y-1">
          <p class="text-xs text-slate-400 font-semibold uppercase">Total Year Expense</p>
          <p class="text-2xl font-black text-rose-600">-৳{{ yearlyData.yearlyExpense.toLocaleString() }}</p>
        </div>
        <div class="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 shadow-sm space-y-1">
          <p class="text-xs text-slate-400 font-semibold uppercase">Annual Net Savings</p>
          <p class="text-2xl font-black text-blue-600">৳{{ yearlyData.yearlyNetSavings.toLocaleString() }}</p>
        </div>
      </div>

      <div class="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700/60 shadow-sm overflow-hidden">
        <div class="p-4 border-b border-slate-100 dark:border-slate-700 font-bold text-sm">
          Annual Month-by-Month Breakdown ({{ yearlyData.year }})
        </div>
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-50 dark:bg-slate-800/80 text-slate-500 font-bold uppercase text-[10px]">
            <tr>
              <th class="py-3 px-4">Month</th>
              <th class="py-3 px-4 text-right">Income</th>
              <th class="py-3 px-4 text-right">Expense</th>
              <th class="py-3 px-4 text-right">Net Savings</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
            <tr v-for="m in yearlyData.monthlyBreakdown" :key="m.monthNumber">
              <td class="py-3 px-4 font-bold">{{ m.month }}</td>
              <td class="py-3 px-4 text-right text-emerald-600 font-semibold">+৳{{ m.income.toLocaleString() }}</td>
              <td class="py-3 px-4 text-right text-rose-600 font-semibold">-৳{{ m.expense.toLocaleString() }}</td>
              <td :class="['py-3 px-4 text-right font-black', m.netSavings >= 0 ? 'text-blue-600' : 'text-red-500']">
                ৳{{ m.netSavings.toLocaleString() }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- TAB 4: ACCOUNT STATEMENT -->
    <div v-else-if="activeTab === 'account' && accountData" class="space-y-6">
      <div class="grid grid-cols-2 gap-4 p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 shadow-sm">
        <div>
          <p class="text-xs text-slate-400 font-semibold uppercase">Opening Balance</p>
          <p class="text-2xl font-black text-slate-900 dark:text-white">৳{{ accountData.periodOpeningBalance.toLocaleString() }}</p>
        </div>
        <div>
          <p class="text-xs text-slate-400 font-semibold uppercase">Current Closing Balance</p>
          <p class="text-2xl font-black text-emerald-600">৳{{ accountData.periodClosingBalance.toLocaleString() }}</p>
        </div>
      </div>

      <div class="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700/60 shadow-sm overflow-hidden">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-50 dark:bg-slate-800/80 text-slate-500 font-bold uppercase text-[10px]">
            <tr>
              <th class="py-3 px-4">Date</th>
              <th class="py-3 px-4">Description</th>
              <th class="py-3 px-4">Entry Type</th>
              <th class="py-3 px-4 text-right">In / Out</th>
              <th class="py-3 px-4 text-right">Running Balance</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
            <tr v-for="st in accountData.statements" :key="st.id">
              <td class="py-3 px-4 text-slate-500">{{ dayjs(st.date).format('DD MMM YYYY, hh:mm A') }}</td>
              <td class="py-3 px-4 font-semibold text-slate-800 dark:text-white">{{ st.description || '-' }}</td>
              <td class="py-3 px-4 text-slate-400 font-mono text-[10px]">{{ st.type }}</td>
              <td :class="['py-3 px-4 text-right font-bold', st.direction === 'CREDIT' ? 'text-emerald-600' : 'text-rose-600']">
                {{ st.direction === 'CREDIT' ? '+' : '-' }}৳{{ st.amount.toLocaleString() }}
              </td>
              <td class="py-3 px-4 text-right font-extrabold text-slate-900 dark:text-white">৳{{ st.runningBalance.toLocaleString() }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- TAB 5: CATEGORY REPORT -->
    <div v-else-if="activeTab === 'category' && categoryData" class="space-y-6">
      <div class="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700/60 shadow-sm overflow-hidden">
        <div class="p-5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <h3 class="text-sm font-bold text-slate-900 dark:text-white">Category-Wise Spending Breakdown</h3>
          <span class="text-xs font-bold text-rose-600">Total: ৳{{ categoryData.totalExpense.toLocaleString() }}</span>
        </div>
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-50 dark:bg-slate-800/80 text-slate-500 font-bold uppercase text-[10px]">
            <tr>
              <th class="py-3 px-4">Category</th>
              <th class="py-3 px-4 text-center">Transactions Count</th>
              <th class="py-3 px-4 text-right">Total Amount Spent</th>
              <th class="py-3 px-4 text-right">Percentage of Total</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
            <tr v-for="c in categoryData.categories" :key="c.id">
              <td class="py-3 px-4 font-bold flex items-center gap-2">
                <i :class="[c.icon, 'text-xs text-rose-500']"></i>
                {{ c.name }}
              </td>
              <td class="py-3 px-4 text-center text-slate-500">{{ c.count }}</td>
              <td class="py-3 px-4 text-right font-black text-rose-600">৳{{ c.total.toLocaleString() }}</td>
              <td class="py-3 px-4 text-right font-semibold text-slate-600 dark:text-slate-300">{{ c.percentage }}%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
