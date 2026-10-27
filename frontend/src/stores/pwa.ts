import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const usePWAStore = defineStore('pwa', () => {
  const canInstall = ref(false);
  const isInstalled = ref(false);
  const deferredPrompt = ref<any>(null);
  const showIOSGuide = ref(false);

  const isIOS = computed(() => {
    if (typeof window === 'undefined') return false;
    const userAgent = window.navigator.userAgent.toLowerCase();
    return /iphone|ipad|ipod/.test(userAgent) && !(window as any).MSStream;
  });

  const isStandalone = computed(() => {
    if (typeof window === 'undefined') return false;
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://')
    );
  });

  function initPWA() {
    if (typeof window === 'undefined') return;

    // Check if currently running in standalone PWA mode
    if (isStandalone.value) {
      isInstalled.value = true;
      canInstall.value = false;
    } else if (isIOS.value) {
      // iOS doesn't support beforeinstallprompt, but can be added to home screen
      canInstall.value = true;
    }

    // Register Service Worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((reg) => {
            console.log('[PWA] Service Worker registered with scope:', reg.scope);
          })
          .catch((err) => {
            console.error('[PWA] Service Worker registration failed:', err);
          });
      });
    }

    // Capture standard install prompt (Android, Chrome, Edge, Samsung Internet)
    window.addEventListener('beforeinstallprompt', (e: Event) => {
      e.preventDefault();
      deferredPrompt.value = e;
      canInstall.value = true;
      console.log('[PWA] beforeinstallprompt captured, app is installable');
    });

    // Detect when installation finishes
    window.addEventListener('appinstalled', () => {
      canInstall.value = false;
      isInstalled.value = true;
      deferredPrompt.value = null;
      console.log('[PWA] Application successfully installed');
    });
  }

  async function installApp() {
    if (deferredPrompt.value) {
      deferredPrompt.value.prompt();
      const choiceResult = await deferredPrompt.value.userChoice;
      if (choiceResult.outcome === 'accepted') {
        console.log('[PWA] User accepted the install prompt');
        canInstall.value = false;
      } else {
        console.log('[PWA] User dismissed the install prompt');
      }
      deferredPrompt.value = null;
    } else if (isIOS.value) {
      showIOSGuide.value = true;
    } else {
      // Direct instructions fallback
      showIOSGuide.value = true;
    }
  }

  function closeIOSGuide() {
    showIOSGuide.value = false;
  }

  return {
    canInstall,
    isInstalled,
    isIOS,
    isStandalone,
    showIOSGuide,
    initPWA,
    installApp,
    closeIOSGuide,
  };
});
