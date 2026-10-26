<script setup lang="ts">
defineProps<{
  title: string;
  value: string | number;
  subtitle?: string;
  icon: string;
  iconBgColor?: string;
  iconColor?: string;
  badge?: string;
  badgeColor?: string;
}>();
</script>

<template>
  <div class="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-700/60 shadow-sm hover:shadow-md transition-shadow">
    <div class="flex items-start justify-between">
      <div class="space-y-1">
        <p class="text-xs font-medium text-slate-500 dark:text-slate-400 tracking-wide uppercase">{{ title }}</p>
        <h3 class="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{{ value }}</h3>
      </div>
      <div
        :class="[
          'w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-sm',
          iconBgColor || 'bg-slate-100 dark:bg-slate-700'
        ]"
      >
        <i :class="[icon, 'text-lg', iconColor || 'text-slate-600 dark:text-slate-300']"></i>
      </div>
    </div>

    <div v-if="subtitle || badge" class="mt-3 flex items-center gap-2 text-xs">
      <span
        v-if="badge"
        :class="[
          'font-semibold px-2 py-0.5 rounded-full text-[11px]',
          badgeColor || 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
        ]"
      >
        {{ badge }}
      </span>
      <span v-if="subtitle" class="text-slate-400 truncate">{{ subtitle }}</span>
    </div>
  </div>
</template>
