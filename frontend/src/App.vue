<script setup lang="ts">
import { onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import Toast from 'primevue/toast';
import ConfirmDialog from 'primevue/confirmdialog';
import { useThemeStore } from './stores/theme';
import { usePWAStore } from './stores/pwa';
import InstallPromptModal from './components/InstallPromptModal.vue';
import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';

const router = useRouter();
const themeStore = useThemeStore();
const pwaStore = usePWAStore();

async function initCapacitor() {
  if (!Capacitor.isNativePlatform()) return;

  try {
    // Ensure native status bar does not overlap the web content
    await StatusBar.setOverlaysWebView({ overlay: false });
    await StatusBar.show();

    // Hide splash screen smoothly after app is ready
    await SplashScreen.hide();

    // Style native status bar
    await updateStatusBar();

    // Handle Android hardware back button
    CapApp.addListener('backButton', ({ canGoBack }) => {
      const currentPath = router.currentRoute.value.path;
      if (currentPath === '/dashboard' || currentPath === '/login' || !canGoBack) {
        CapApp.exitApp();
      } else {
        router.back();
      }
    });
  } catch (e) {
    console.warn('[Capacitor] Init error:', e);
  }
}

async function updateStatusBar() {
  if (!Capacitor.isNativePlatform()) return;
  try {
    await StatusBar.setOverlaysWebView({ overlay: false });
    if (themeStore.isDark) {
      await StatusBar.setStyle({ style: Style.Dark });
      await StatusBar.setBackgroundColor({ color: '#0f172a' });
    } else {
      await StatusBar.setStyle({ style: Style.Light });
      await StatusBar.setBackgroundColor({ color: '#ffffff' });
    }
  } catch (e) {
    // Ignore in non-mobile
  }
}

watch(() => themeStore.isDark, () => {
  updateStatusBar();
});

onMounted(() => {
  themeStore.initTheme();
  pwaStore.initPWA();
  initCapacitor();
});
</script>

<template>
  <Toast position="top-right" />
  <ConfirmDialog :style="{ width: '92vw', maxWidth: '28rem' }" />
  <InstallPromptModal />
  <router-view />
</template>
