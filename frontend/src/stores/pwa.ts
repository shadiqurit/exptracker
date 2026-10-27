import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { Capacitor } from '@capacitor/core';

export const usePWAStore = defineStore('pwa', () => {
  const canInstall = ref(false);
  const isInstalled = ref(false);
  const deferredPrompt = ref<any>(null);
  const showIOSGuide = ref(false);

  const isNativeApp = computed(() => {
    try {
      return Capacitor.isNativePlatform();
    } catch {
      return false;
    }
  });

  const isStandalone = computed(() => {
    if (typeof window === 'undefined') return false;
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://')
    );
  });

  const isAndroidApp = computed(() => {
    if (typeof window === 'undefined') return false;
    try {
      if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android') {
        return true;
      }
    } catch {}
    if (document.referrer.includes('android-app://')) {
      return true;
    }
    const ua = window.navigator.userAgent.toLowerCase();
    if (/android/.test(ua) && (isStandalone.value || /wv/.test(ua))) {
      return true;
    }
    return false;
  });

  const isIOS = computed(() => {
    if (typeof window === 'undefined') return false;
    const userAgent = window.navigator.userAgent.toLowerCase();
    return /iphone|ipad|ipod/.test(userAgent) && !(window as any).MSStream;
  });

  // True ONLY when running as a web app in a regular web browser (not native app, not android app, not standalone)
  const isWebBrowser = computed(() => {
    if (typeof window === 'undefined') return false;
    if (isNativeApp.value) return false;
    if (isAndroidApp.value) return false;
    if (isStandalone.value) return false;
    return true;
  });

  // App install is only offered when accessed from web apps in browsers and not yet installed
  const canInstallInBrowser = computed(() => {
    return isWebBrowser.value && !isInstalled.value;
  });

  function initPWA() {
    if (typeof window === 'undefined') return;

    // If running in native Android/iOS app or standalone installed mode, disable install
    if (isNativeApp.value || isAndroidApp.value || isStandalone.value) {
      isInstalled.value = true;
      canInstall.value = false;
      return;
    }

    if (isIOS.value) {
      // iOS doesn't support beforeinstallprompt, but can be added to home screen
      canInstall.value = true;
    }

    // Register Service Worker for web browser
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

    // Capture standard install prompt (Chrome, Edge, Samsung Internet)
    window.addEventListener('beforeinstallprompt', (e: Event) => {
      if (!isWebBrowser.value) return;
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
    if (!canInstallInBrowser.value) {
      return;
    }

    if (deferredPrompt.value) {
      deferredPrompt.value.prompt();
      const choiceResult = await deferredPrompt.value.userChoice;
      if (choiceResult.outcome === 'accepted') {
        console.log('[PWA] User accepted the install prompt');
        canInstall.value = false;
        isInstalled.value = true;
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
    isNativeApp,
    isAndroidApp,
    isWebBrowser,
    canInstallInBrowser,
    showIOSGuide,
    initPWA,
    installApp,
    closeIOSGuide,
  };
});
