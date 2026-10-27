<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { apiClient } from '../api/client';
import KpiCard from '../components/KpiCard.vue';
import { DashboardSummary } from '../types';
import dayjs from 'dayjs';

const summary = ref<DashboardSummary>({
  totalAccountBalance: 0,
  totalIncomeThisMonth: 0,
  totalExpensesThisMonth: 0,
  netSavingsThisMonth: 0,
  totalIncomeThisYear: 0,
  totalExpensesThisYear: 0,
  totalTransactions: 0,
  monthlyBudgetTotal: null,
  monthlyBudgetRemaining: null,
});

const monthlyTrends = ref<any[]>([]);
const categoryExpenses = ref<{ grandTotal: number; categories: any[] }>({ grandTotal: 0, categories: [] });
const accountBalances = ref<any[]>([]);
const dailyTrend = ref<any[]>([]);
const budgets = ref<any[]>([]);
const accounts = ref<any[]>([]);

const selectedAccount = ref<string>('');
const selectedPeriod = ref<string>('thisMonth');
const isLoading = ref(true);

async function loadDashboardData() {
  isLoading.value = true;
  try {
    const [sumRes, trendsRes, catRes, accBalRes, dailyRes, budgetsRes, accountsListRes] = await Promise.all([
      apiClient.get('/dashboard/summary', { params: { accountId: selectedAccount.value || undefined } }),
      apiClient.get('/dashboard/monthly-trends'),
      apiClient.get('/dashboard/category-expenses'),
      apiClient.get('/dashboard/account-balances'),
      apiClient.get('/dashboard/daily-expense-trend'),
      apiClient.get('/budgets'),
      apiClient.get('/accounts'),
    ]);

    summary.value = sumRes.data.data;
    monthlyTrends.value = trendsRes.data.data;
    categoryExpenses.value = catRes.data.data;
    accountBalances.value = accBalRes.data.data;
    dailyTrend.value = dailyRes.data.data;
    budgets.value = budgetsRes.data.data;
    accounts.value = accountsListRes.data.data;
  } catch (error) {
    console.error('Error loading dashboard data:', error);
  } finally {
    isLoading.value = false;
  }
}

watch(selectedAccount, () => {
  loadDashboardData();
});

onMounted(() => {
  loadDashboardData();
});

// Chart 1: Monthly Income vs Expenses (Bar Chart)
const monthlyTrendsOption = computed(() => ({
  tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
  legend: { data: ['Income', 'Expense'], bottom: 0 },
  grid: { top: '10%', left: '3%', right: '4%', bottom: '15%', containLabel: true },
  xAxis: {
    type: 'category',
    data: monthlyTrends.value.map((m) => m.month),
    axisLine: { lineStyle: { color: '#94a3b8' } },
  },
  yAxis: {
    type: 'value',
    splitLine: { lineStyle: { color: '#f1f5f9' } },
  },
  series: [
    {
      name: 'Income',
      type: 'bar',
      data: monthlyTrends.value.map((m) => m.income),
      itemStyle: { color: '#10b981', borderRadius: [4, 4, 0, 0] },
    },
    {
      name: 'Expense',
      type: 'bar',
      data: monthlyTrends.value.map((m) => m.expense),
      itemStyle: { color: '#f43f5e', borderRadius: [4, 4, 0, 0] },
    },
  ],
}));

// Chart 2: Category Expenses (Donut Chart)
const categoryExpensesOption = computed(() => ({
  tooltip: { trigger: 'item', formatter: '{b}: ৳{c} ({d}%)' },
  legend: { orient: 'vertical', right: '5%', top: 'center', itemWidth: 10, itemHeight: 10 },
  series: [
    {
      name: 'Expenses by Category',
      type: 'pie',
      radius: ['50%', '75%'],
      center: ['35%', '50%'],
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
      label: { show: false },
      data: categoryExpenses.value.categories.map((c) => ({
        name: c.name,
        value: c.total,
        itemStyle: { color: c.color },
      })),
    },
  ],
}));

// Chart 3: Financial Trend (Line Chart)
const financialTrendOption = computed(() => ({
  tooltip: { trigger: 'axis' },
  legend: { data: ['Income', 'Expense', 'Net Savings'], bottom: 0 },
  grid: { top: '10%', left: '3%', right: '4%', bottom: '15%', containLabel: true },
  xAxis: {
    type: 'category',
    data: monthlyTrends.value.map((m) => m.month),
  },
  yAxis: { type: 'value' },
  series: [
    {
      name: 'Income',
      type: 'line',
      smooth: true,
      data: monthlyTrends.value.map((m) => m.income),
      itemStyle: { color: '#10b981' },
    },
    {
      name: 'Expense',
      type: 'line',
      smooth: true,
      data: monthlyTrends.value.map((m) => m.expense),
      itemStyle: { color: '#f43f5e' },
    },
    {
      name: 'Net Savings',
      type: 'line',
      smooth: true,
      data: monthlyTrends.value.map((m) => m.netSavings),
      itemStyle: { color: '#3b82f6' },
    },
  ],
}));

// Chart 4: Account Balances (Horizontal Bar)
const accountBalancesOption = computed(() => ({
  tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
  grid: { top: '5%', left: '3%', right: '8%', bottom: '5%', containLabel: true },
  xAxis: { type: 'value' },
  yAxis: {
    type: 'category',
    data: accountBalances.value.map((a) => a.name),
  },
  series: [
    {
      name: 'Current Balance',
      type: 'bar',
      data: accountBalances.value.map((a) => a.currentBalance),
      itemStyle: { color: '#6366f1', borderRadius: [0, 4, 4, 0] },
      label: { show: true, position: 'right', formatter: '৳{c}' },
    },
  ],
}));

// Chart 5: Daily Expense Trend (Area Chart)
const dailyTrendOption = computed(() => ({
  tooltip: { trigger: 'axis' },
  grid: { top: '10%', left: '3%', right: '4%', bottom: '10%', containLabel: true },
  xAxis: {
    type: 'category',
    data: dailyTrend.value.map((d) => d.date),
  },
  yAxis: { type: 'value' },
  series: [
    {
      name: 'Daily Expense',
      type: 'line',
      smooth: true,
      data: dailyTrend.value.map((d) => d.amount),
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(244, 63, 94, 0.4)' },
            { offset: 1, color: 'rgba(244, 63, 94, 0.02)' },
          ],
        },
      },
      itemStyle: { color: '#f43f5e' },
    },
  ],
}));
</script>

<template>
  <div class="space-y-6">
    <!-- Page Header & Filters -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/60 dark:border-slate-800">
      <div>
        <h1 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Financial Dashboard</h1>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Overview of multi-account balances, income, expenses & budgets</p>
      </div>

      <div class="flex items-center gap-2.5 w-full md:w-auto">
        <!-- Account Filter -->
        <select
          v-model="selectedAccount"
          class="flex-1 md:flex-none text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        >
          <option value="">All Financial Accounts</option>
          <option v-for="acc in accounts" :key="acc.id" :value="acc.id">
            {{ acc.name }} (৳{{ acc.currentBalance.toLocaleString() }})
          </option>
        </select>

        <button
          @click="loadDashboardData"
          class="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-800 transition-colors shrink-0"
          title="Refresh dashboard"
        >
          <i :class="['pi pi-refresh text-xs', isLoading ? 'pi-spin' : '']"></i>
        </button>
      </div>
    </div>

    <!-- KPI Summary Grid (8 KPI Cards) -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <KpiCard
        title="Total Net Wealth"
        :value="`৳${summary.totalAccountBalance.toLocaleString()}`"
        subtitle="Across all active accounts"
        icon="pi pi-wallet"
        icon-bg-color="bg-emerald-50 dark:bg-emerald-950/50"
        icon-color="text-emerald-600 dark:text-emerald-400"
        badge="Asset Total"
        badge-color="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300"
      />

      <KpiCard
        title="Income (This Month)"
        :value="`৳${summary.totalIncomeThisMonth.toLocaleString()}`"
        subtitle="Current month deposit"
        icon="pi pi-arrow-down-left"
        icon-bg-color="bg-teal-50 dark:bg-teal-950/50"
        icon-color="text-teal-600 dark:text-teal-400"
        badge="Inflow"
        badge-color="bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-300"
      />

      <KpiCard
        title="Expenses (This Month)"
        :value="`৳${summary.totalExpensesThisMonth.toLocaleString()}`"
        subtitle="Current month spending"
        icon="pi pi-arrow-up-right"
        icon-bg-color="bg-rose-50 dark:bg-rose-950/50"
        icon-color="text-rose-600 dark:text-rose-400"
        badge="Outflow"
        badge-color="bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300"
      />

      <KpiCard
        title="Net Savings (This Month)"
        :value="`৳${summary.netSavingsThisMonth.toLocaleString()}`"
        subtitle="Income minus expenses"
        icon="pi pi-sparkles"
        icon-bg-color="bg-blue-50 dark:bg-blue-950/50"
        icon-color="text-blue-600 dark:text-blue-400"
        :badge="summary.netSavingsThisMonth >= 0 ? '+Surplus' : '-Deficit'"
        :badge-color="summary.netSavingsThisMonth >= 0 ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300' : 'bg-red-100 text-red-800 dark:bg-red-900/60 dark:text-red-300'"
      />

      <KpiCard
        title="Yearly Income"
        :value="`৳${summary.totalIncomeThisYear.toLocaleString()}`"
        subtitle="Year to date income"
        icon="pi pi-chart-line"
        icon-bg-color="bg-indigo-50 dark:bg-indigo-950/50"
        icon-color="text-indigo-600 dark:text-indigo-400"
      />

      <KpiCard
        title="Yearly Expenses"
        :value="`৳${summary.totalExpensesThisYear.toLocaleString()}`"
        subtitle="Year to date spending"
        icon="pi pi-chart-bar"
        icon-bg-color="bg-amber-50 dark:bg-amber-950/50"
        icon-color="text-amber-600 dark:text-amber-400"
      />

      <KpiCard
        title="Total Transactions"
        :value="summary.totalTransactions"
        subtitle="Ledger records recorded"
        icon="pi pi-list"
        icon-bg-color="bg-purple-50 dark:bg-purple-950/50"
        icon-color="text-purple-600 dark:text-purple-400"
      />

      <KpiCard
        title="Monthly Budget Left"
        :value="summary.monthlyBudgetRemaining != null ? `৳${summary.monthlyBudgetRemaining.toLocaleString()}` : 'No Budget Set'"
        :subtitle="summary.monthlyBudgetTotal != null ? `Out of ৳${summary.monthlyBudgetTotal.toLocaleString()}` : 'Set in Budgets module'"
        icon="pi pi-shield"
        icon-bg-color="bg-emerald-50 dark:bg-emerald-950/50"
        icon-color="text-emerald-600 dark:text-emerald-400"
      />
    </div>

    <!-- Charts Row 1: Monthly In/Out & Category Donut -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-700/60 shadow-sm space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-sm font-bold text-slate-800 dark:text-white">Monthly Income vs Expenses</h3>
            <p class="text-xs text-slate-400">Past 12 months financial performance</p>
          </div>
          <span class="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
            Last 12 Months
          </span>
        </div>
        <div class="h-72 w-full">
          <v-chart :option="monthlyTrendsOption" autoresize />
        </div>
      </div>

      <div class="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-700/60 shadow-sm space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-sm font-bold text-slate-800 dark:text-white">Expense by Category</h3>
            <p class="text-xs text-slate-400">Total: ৳{{ categoryExpenses.grandTotal.toLocaleString() }}</p>
          </div>
        </div>
        <div class="h-72 w-full flex items-center justify-center">
          <v-chart v-if="categoryExpenses.categories.length > 0" :option="categoryExpensesOption" autoresize />
          <div v-else class="text-xs text-slate-400 text-center py-10">
            No expenses recorded this month
          </div>
        </div>
      </div>
    </div>

    <!-- Charts Row 2: Account Balances & Daily Expense Trend -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-700/60 shadow-sm space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-sm font-bold text-slate-800 dark:text-white">Account Balances</h3>
            <p class="text-xs text-slate-400">Live distribution across individual financial accounts</p>
          </div>
        </div>
        <div class="h-64 w-full">
          <v-chart :option="accountBalancesOption" autoresize />
        </div>
      </div>

      <div class="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-700/60 shadow-sm space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-sm font-bold text-slate-800 dark:text-white">Daily Expense Velocity</h3>
            <p class="text-xs text-slate-400">Daily spending trend throughout the current month</p>
          </div>
        </div>
        <div class="h-64 w-full">
          <v-chart :option="dailyTrendOption" autoresize />
        </div>
      </div>
    </div>

    <!-- Budget Utilization Section -->
    <div v-if="budgets.length > 0" class="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-700/60 shadow-sm space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-sm font-bold text-slate-800 dark:text-white">Active Budget Monitoring</h3>
          <p class="text-xs text-slate-400">Spending limits vs actual outlays for current month</p>
        </div>
        <router-link to="/budgets" class="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">
          Manage Budgets &rarr;
        </router-link>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="b in budgets"
          :key="b.id"
          class="p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-900/30 space-y-2"
        >
          <div class="flex items-center justify-between text-xs">
            <span class="font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
              <i :class="[b.categoryIcon, 'text-emerald-500']"></i>
              {{ b.categoryName }}
            </span>
            <span
              :class="[
                'font-bold px-2 py-0.5 rounded-full text-[10px]',
                b.isExceeded100
                  ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                  : b.isWarning80
                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                  : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
              ]"
            >
              {{ b.percentage }}% Spent
            </span>
          </div>

          <!-- Progress Bar -->
          <div class="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
            <div
              :class="[
                'h-full rounded-full transition-all duration-500',
                b.isExceeded100 ? 'bg-rose-500' : b.isWarning80 ? 'bg-amber-500' : 'bg-emerald-500'
              ]"
              :style="{ width: `${Math.min(100, b.percentage)}%` }"
            ></div>
          </div>

          <div class="flex items-center justify-between text-[11px] text-slate-400 pt-1">
            <span>Spent: ৳{{ b.actualSpent.toLocaleString() }}</span>
            <span>Limit: ৳{{ b.amount.toLocaleString() }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
