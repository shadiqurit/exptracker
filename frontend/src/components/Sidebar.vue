<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const props = defineProps<{
  collapsed: boolean;
}>();

const emit = defineEmits<{
  (e: 'toggle'): void;
}>();

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const navItems = computed(() => {
  const items = [
    { label: 'Dashboard', route: '/dashboard', icon: 'pi pi-home' },
    { label: 'Income', route: '/income', icon: 'pi pi-arrow-down-left', color: 'text-emerald-500' },
    { label: 'Expenses', route: '/expenses', icon: 'pi pi-arrow-up-right', color: 'text-rose-500' },
    { label: 'All Transactions', route: '/transactions', icon: 'pi pi-list' },
    { label: 'Fund Transfers', route: '/transfers', icon: 'pi pi-arrows-h' },
    { label: 'Financial Accounts', route: '/accounts', icon: 'pi pi-wallet' },
    { label: 'Categories', route: '/categories', icon: 'pi pi-tags' },
    { label: 'Budgets', route: '/budgets', icon: 'pi pi-chart-pie' },
    { label: 'Reports', route: '/reports', icon: 'pi pi-file' },
    { label: 'Settings', route: '/settings', icon: 'pi pi-cog' },
  ];

  if (authStore.isSuperAdmin) {
    items.push({
      label: 'Administration',
      route: '/admin',
      icon: 'pi pi-shield',
      color: 'text-amber-500',
    });
  }

  return items;
});

function navigate(path: string) {
  router.push(path);
}
</script>

<template>
  <aside
    :class="[
      'fixed left-0 top-0 bottom-0 z-30 transition-all duration-300 ease-in-out border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col',
      collapsed ? 'w-20' : 'w-64'
    ]"
  >
    <!-- Brand Logo -->
    <div class="h-16 flex items-center px-4 border-b border-slate-100 dark:border-slate-800/80 justify-between">
      <div v-if="!collapsed" class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
          <i class="pi pi-dollar text-lg font-bold"></i>
        </div>
        <div>
          <span class="text-base font-extrabold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">ExpTracker</span>
          <span class="block text-[10px] uppercase font-semibold tracking-wider text-emerald-600 dark:text-emerald-400">Financial SaaS</span>
        </div>
      </div>
      <div v-else class="mx-auto">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-md">
          <i class="pi pi-dollar text-xl font-bold"></i>
        </div>
      </div>

      <button
        @click="emit('toggle')"
        class="hidden lg:flex w-7 h-7 rounded-lg items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        :title="collapsed ? 'Expand sidebar' : 'Collapse sidebar'"
      >
        <i :class="collapsed ? 'pi pi-chevron-right text-xs' : 'pi pi-chevron-left text-xs'"></i>
      </button>
    </div>

    <!-- Navigation Links -->
    <nav class="flex-1 overflow-y-auto px-3 py-4 space-y-1">
      <button
        v-for="item in navItems"
        :key="item.route"
        @click="navigate(item.route)"
        :class="[
          'w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group',
          route.path.startsWith(item.route)
            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 shadow-sm'
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white',
          collapsed ? 'justify-center px-0' : ''
        ]"
        :title="collapsed ? item.label : undefined"
      >
        <i
          :class="[
            item.icon,
            'text-base transition-transform group-hover:scale-110',
            route.path.startsWith(item.route) ? 'text-emerald-600 dark:text-emerald-400' : (item.color || 'text-slate-400 dark:text-slate-500')
          ]"
        ></i>
        <span v-if="!collapsed" class="truncate">{{ item.label }}</span>
      </button>
    </nav>

    <!-- User Mini Profile Footer -->
    <div class="p-3 border-t border-slate-100 dark:border-slate-800/80">
      <div
        :class="[
          'flex items-center gap-3 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50',
          collapsed ? 'justify-center' : ''
        ]"
      >
        <div class="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold text-sm shrink-0">
          {{ authStore.user?.firstName?.[0] || 'U' }}
        </div>
        <div v-if="!collapsed" class="truncate">
          <p class="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
            {{ authStore.user?.firstName }} {{ authStore.user?.lastName }}
          </p>
          <p class="text-[11px] text-slate-400 truncate">{{ authStore.user?.email }}</p>
        </div>
      </div>
    </div>
  </aside>
</template>
