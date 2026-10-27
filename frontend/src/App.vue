<script setup lang="ts">
import { onMounted } from 'vue';
import Toast from 'primevue/toast';
import ConfirmDialog from 'primevue/confirmdialog';
import { useThemeStore } from './stores/theme';
import { usePWAStore } from './stores/pwa';
import InstallPromptModal from './components/InstallPromptModal.vue';

const themeStore = useThemeStore();
const pwaStore = usePWAStore();

onMounted(() => {
  themeStore.initTheme();
  pwaStore.initPWA();
});
</script>

<template>
  <Toast position="top-right" />
  <ConfirmDialog :style="{ width: '92vw', maxWidth: '28rem' }" />
  <InstallPromptModal />
  <router-view />
</template>
