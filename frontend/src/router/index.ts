import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import AppLayout from '../layouts/AppLayout.vue';
import LoginView from '../views/LoginView.vue';
import RegisterView from '../views/RegisterView.vue';
import DashboardView from '../views/DashboardView.vue';
import AccountsView from '../views/AccountsView.vue';
import IncomeView from '../views/IncomeView.vue';
import ExpenseView from '../views/ExpenseView.vue';
import TransactionsView from '../views/TransactionsView.vue';
import TransfersView from '../views/TransfersView.vue';
import BudgetsView from '../views/BudgetsView.vue';
import CategoriesView from '../views/CategoriesView.vue';
import ReportsView from '../views/ReportsView.vue';
import SettingsView from '../views/SettingsView.vue';
import AdminView from '../views/AdminView.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
    meta: { guestOnly: true },
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterView,
    meta: { guestOnly: true },
  },
  {
    path: '/',
    component: AppLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/dashboard',
      },
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: DashboardView,
      },
      {
        path: 'income',
        name: 'Income',
        component: IncomeView,
      },
      {
        path: 'expenses',
        name: 'Expenses',
        component: ExpenseView,
      },
      {
        path: 'transactions',
        name: 'Transactions',
        component: TransactionsView,
      },
      {
        path: 'transfers',
        name: 'Transfers',
        component: TransfersView,
      },
      {
        path: 'accounts',
        name: 'Accounts',
        component: AccountsView,
      },
      {
        path: 'categories',
        name: 'Categories',
        component: CategoriesView,
      },
      {
        path: 'budgets',
        name: 'Budgets',
        component: BudgetsView,
      },
      {
        path: 'reports',
        name: 'Reports',
        component: ReportsView,
      },
      {
        path: 'settings',
        name: 'Settings',
        component: SettingsView,
      },
      {
        path: 'admin',
        name: 'Admin',
        component: AdminView,
        meta: { requiresAdmin: true },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/dashboard',
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('access_token');
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  if (to.meta.requiresAuth && !token) {
    return next({ name: 'Login' });
  }

  if (to.meta.guestOnly && token) {
    return next({ name: 'Dashboard' });
  }

  if (to.meta.requiresAdmin && (!user || !user.roles.includes('SUPER_ADMIN'))) {
    return next({ name: 'Dashboard' });
  }

  next();
});
