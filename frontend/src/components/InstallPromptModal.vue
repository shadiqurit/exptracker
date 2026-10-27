<script setup lang="ts">
import { usePWAStore } from '../stores/pwa';
import Dialog from 'primevue/dialog';

const pwaStore = usePWAStore();
</script>

<template>
  <Dialog
    v-model:visible="pwaStore.showIOSGuide"
    modal
    header="Install ExpTracker Mobile App"
    :style="{ width: '92vw', maxWidth: '28rem' }"
  >
    <div class="space-y-4 pt-1">
      <div class="flex items-center gap-3 p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/60 dark:border-emerald-800/50">
        <div class="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 shrink-0">
          <i class="pi pi-dollar text-xl font-bold"></i>
        </div>
        <div>
          <h4 class="text-sm font-bold text-slate-900 dark:text-white">Add to Home Screen</h4>
          <p class="text-xs text-slate-500 dark:text-slate-400">Install as a native application for instant access & offline capabilities.</p>
        </div>
      </div>

      <!-- iOS Instructions -->
      <div v-if="pwaStore.isIOS" class="space-y-3 text-xs text-slate-600 dark:text-slate-300">
        <p class="font-semibold text-slate-800 dark:text-slate-200">Follow these steps in Safari:</p>
        <ol class="space-y-2.5 list-decimal list-inside pl-1">
          <li class="leading-relaxed">
            Tap the <span class="font-bold text-emerald-600 dark:text-emerald-400">Share button</span>
            <i class="pi pi-share-alt mx-1 text-slate-700 dark:text-slate-200"></i> in Safari's bottom toolbar.
          </li>
          <li class="leading-relaxed">
            Scroll down in the share sheet and tap
            <span class="font-bold text-emerald-600 dark:text-emerald-400">"Add to Home Screen"</span>
            <i class="pi pi-plus-circle mx-1 text-slate-700 dark:text-slate-200"></i>.
          </li>
          <li class="leading-relaxed">
            Tap <span class="font-bold text-slate-900 dark:text-white">"Add"</span> in the top-right corner to finish.
          </li>
        </ol>
      </div>

      <!-- Android / Desktop Fallback Instructions -->
      <div v-else class="space-y-3 text-xs text-slate-600 dark:text-slate-300">
        <p class="font-semibold text-slate-800 dark:text-slate-200">To install on Android or Desktop:</p>
        <ol class="space-y-2.5 list-decimal list-inside pl-1">
          <li class="leading-relaxed">
            Tap your browser menu (<i class="pi pi-ellipsis-v mx-1 text-slate-700 dark:text-slate-200"></i> three dots).
          </li>
          <li class="leading-relaxed">
            Select <span class="font-bold text-emerald-600 dark:text-emerald-400">"Install app"</span> or <span class="font-bold text-emerald-600 dark:text-emerald-400">"Add to Home screen"</span>.
          </li>
          <li class="leading-relaxed">
            Confirm the prompt to install ExpTracker.
          </li>
        </ol>
      </div>

      <div class="flex justify-end pt-3">
        <button
          @click="pwaStore.closeIOSGuide"
          class="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-colors text-center"
        >
          Got it
        </button>
      </div>
    </div>
  </Dialog>
</template>
