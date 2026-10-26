<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useThemeStore } from '../stores/theme';
import Menu from 'primevue/menu';

const props = defineProps<{
  sidebarCollapsed: boolean;
}>();

const emit = defineEmits<{
  (e: 'toggleSidebar'): void;
}>();

const router = useRouter();
const authStore = useAuthStore();
const themeStore = useThemeStore();
const userMenu = ref();

const menuItems = ref([
  {
    label: 'Profile Settings',
    icon: 'pi pi-user',
    command: () => router.push('/settings'),
  },
  {
    label: 'Accounts',
    icon: 'pi pi-wallet',
    command: () => router.push('/accounts'),
  },
  {
    separator: true,
  },
  {
    label: 'Sign Out',
    icon: 'pi pi-sign-out',
    command: async () => {
      await authStore.logout();
      router.push('/login');
    },
  },
]);

function toggleUserMenu(event: Event) {
  userMenu.value.toggle(event);
}
</script>

<template>
  <header class="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-20 px-4 lg:px-8 flex items-center justify-between">
    <!-- Left: Mobile Toggle & Page context -->
    <div class="flex items-center gap-3">
      <button
        @click="emit('toggleSidebar')"
        class="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        <i class="pi pi-bars text-lg"></i>
      </button>

      <div class="hidden sm:flex items-center gap-2 text-xs text-slate-400">
        <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-semibold text-xs border border-emerald-200/50 dark:border-emerald-800/50">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          {{ authStore.user?.defaultCurrency || 'BDT' }} Currency
        </span>
        <span class="text-slate-300 dark:text-slate-700">|</span>
        <span>{{ authStore.user?.timezone || 'Asia/Dhaka' }}</span>
      </div>
    </div>

    <!-- Right Actions -->
    <div class="flex items-center gap-3">
      <!-- Quick Action Buttons -->
      <button
        @click="router.push('/income')"
        class="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm transition-colors"
      >
        <i class="pi pi-plus text-xs"></i>
        <span>Add Income</span>
      </button>

      <button
        @click="router.push('/expenses')"
        class="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-500 hover:bg-rose-600 text-white shadow-sm transition-colors"
      >
        <i class="pi pi-minus text-xs"></i>
        <span>Add Expense</span>
      </button>

      <button
        @click="router.push('/transfers')"
        class="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-500 hover:bg-blue-600 text-white shadow-sm transition-colors"
      >
        <i class="pi pi-arrows-h text-xs"></i>
        <span>Transfer</span>
      </button>

      <!-- Theme Switcher -->
      <button
        @click="themeStore.toggleTheme"
        class="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        :title="themeStore.isDark ? 'Switch to light theme' : 'Switch to dark theme'"
      >
        <i :class="themeStore.isDark ? 'pi pi-sun text-amber-400 text-base' : 'pi pi-moon text-slate-600 text-base'"></i>
      </button>

      <!-- User Profile Menu -->
      <button
        @click="toggleUserMenu"
        class="flex items-center gap-2 p-1 pl-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        <div class="text-right hidden sm:block">
          <p class="text-xs font-semibold text-slate-700 dark:text-slate-200">
            {{ authStore.user?.firstName }} {{ authStore.user?.lastName }}
          </p>
          <p class="text-[10px] text-slate-400 uppercase font-medium">
            {{ authStore.user?.roles?.[0] || 'User' }}
          </p>
        </div>
        <div class="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
          {{ authStore.user?.firstName?.[0] || 'U' }}
        </div>
        <i class="pi pi-angle-down text-slate-400 text-xs"></i>
      </button>

      <Menu ref="userMenu" :model="menuItems" :popup="true" />
    </div>
  </header>
</template>
