<script setup lang="ts">
import { onMounted } from 'vue';
import Toast from 'primevue/toast';
import ConfirmDialog from 'primevue/confirmdialog';
import { useThemeStore } from './stores/theme';

const themeStore = useThemeStore();

onMounted(() => {
  themeStore.initTheme();
});
</script>

<template>
  <Toast position="top-right" />
  <ConfirmDialog :style="{ width: '92vw', maxWidth: '28rem' }" />
  <router-view />
</template>
