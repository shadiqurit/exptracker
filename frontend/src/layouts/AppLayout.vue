<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Sidebar from '../components/Sidebar.vue';
import Navbar from '../components/Navbar.vue';

const route = useRoute();
const router = useRouter();

const desktopCollapsed = ref(false);
const mobileOpen = ref(false);

function toggleDesktop() {
  desktopCollapsed.value = !desktopCollapsed.value;
}

function toggleMobile() {
  mobileOpen.value = !mobileOpen.value;
}

function closeMobile() {
  mobileOpen.value = false;
}

// Automatically close mobile drawer when navigating
watch(
  () => route.path,
  () => {
    mobileOpen.value = false;
  }
);

// Close on Escape key press
function onKeyDown(e: KeyboardEvent) {
  if (e.key === 'Escape' && mobileOpen.value) {
    mobileOpen.value = false;
  }
}

// Prevent body scroll when mobile drawer is open
watch(mobileOpen, (isOpen) => {
  if (typeof document !== 'undefined') {
    if (isOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
  }
});

onMounted(() => {
  window.addEventListener('keydown', onKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', onKeyDown);
  if (typeof document !== 'undefined') {
    document.body.classList.remove('overflow-hidden');
  }
});
</script>

<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex flex-col lg:flex-row">
    <!-- Backdrop for Mobile Sidebar Drawer -->
    <transition
      enter-active-class="transition-opacity duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="mobileOpen"
        @click="closeMobile"
        class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
        aria-hidden="true"
      />
    </transition>

    <!-- Sidebar Drawer / Persistent Rail -->
    <Sidebar
      :desktop-collapsed="desktopCollapsed"
      :mobile-open="mobileOpen"
      @toggle-desktop="toggleDesktop"
      @close-mobile="closeMobile"
    />

    <!-- Main Content Area -->
    <div
      :class="[
        'flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out',
        desktopCollapsed ? 'lg:pl-20' : 'lg:pl-64'
      ]"
    >
      <Navbar
        :desktop-collapsed="desktopCollapsed"
        @toggle-sidebar="toggleMobile"
      />

      <main class="flex-1 p-3.5 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] md:pb-8">
        <router-view />
      </main>

      <footer class="py-4 px-6 border-t border-slate-200/80 dark:border-slate-800/80 text-center text-xs text-slate-400 hidden sm:block">
        Expense Tracker & Income Management System &copy; 2026. Production Financial Ledger.
      </footer>
    </div>

    <!-- Mobile Bottom Navigation Bar (Phone-friendly thumb navigation) -->
    <nav class="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-2 pt-1.5 pb-[calc(0.375rem+env(safe-area-inset-bottom,0px))] flex items-center justify-around shadow-[0_-4px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.4)]">
      <button
        @click="router.push('/dashboard')"
        :class="[
          'flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-[10px] font-semibold transition-all',
          route.path === '/dashboard'
            ? 'text-emerald-600 dark:text-emerald-400 font-bold scale-105'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
        ]"
      >
        <i class="pi pi-home text-lg mb-0.5"></i>
        <span>Dashboard</span>
      </button>

      <button
        @click="router.push('/income')"
        :class="[
          'flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-[10px] font-semibold transition-all',
          route.path.startsWith('/income')
            ? 'text-emerald-600 dark:text-emerald-400 font-bold scale-105'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
        ]"
      >
        <i class="pi pi-arrow-down-left text-lg mb-0.5"></i>
        <span>Income</span>
      </button>

      <button
        @click="router.push('/expenses')"
        :class="[
          'flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-[10px] font-semibold transition-all',
          route.path.startsWith('/expenses')
            ? 'text-rose-600 dark:text-rose-400 font-bold scale-105'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
        ]"
      >
        <i class="pi pi-arrow-up-right text-lg mb-0.5"></i>
        <span>Expense</span>
      </button>

      <button
        @click="router.push('/transactions')"
        :class="[
          'flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-[10px] font-semibold transition-all',
          route.path.startsWith('/transactions')
            ? 'text-emerald-600 dark:text-emerald-400 font-bold scale-105'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
        ]"
      >
        <i class="pi pi-list text-lg mb-0.5"></i>
        <span>Ledger</span>
      </button>

      <button
        @click="toggleMobile"
        :class="[
          'flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-[10px] font-semibold transition-all',
          mobileOpen
            ? 'text-emerald-600 dark:text-emerald-400 font-bold'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
        ]"
      >
        <i class="pi pi-bars text-lg mb-0.5"></i>
        <span>Menu</span>
      </button>
    </nav>
  </div>
</template>
