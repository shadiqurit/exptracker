<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { apiClient } from '../api/client';
import { Category, TransactionType } from '../types';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import Dialog from 'primevue/dialog';

const toast = useToast();
const confirm = useConfirm();

const categories = ref<Category[]>([]);
const activeTab = ref<TransactionType>('EXPENSE');
const isLoading = ref(true);

const showDialog = ref(false);
const form = ref({
  name: '',
  type: 'EXPENSE' as TransactionType,
  icon: 'pi pi-tag',
  color: '#3B82F6',
});

const iconOptions = [
  'pi pi-shopping-bag', 'pi pi-wallet', 'pi pi-money-bill', 'pi pi-building',
  'pi pi-car', 'pi pi-bolt', 'pi pi-heart', 'pi pi-book', 'pi pi-gift',
  'pi pi-chart-line', 'pi pi-briefcase', 'pi pi-mobile', 'pi pi-wifi',
  'pi pi-play', 'pi pi-users', 'pi pi-tag', 'pi pi-credit-card'
];

async function loadCategories() {
  isLoading.value = true;
  try {
    const res = await apiClient.get('/categories');
    categories.value = res.data.data;
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Could not load categories', life: 3000 });
  } finally {
    isLoading.value = false;
  }
}

onMounted(() => {
  loadCategories();
});

function openCreateModal() {
  form.value = {
    name: '',
    type: activeTab.value,
    icon: 'pi pi-tag',
    color: activeTab.value === 'INCOME' ? '#10B981' : '#EF4444',
  };
  showDialog.value = true;
}

async function handleSaveCategory() {
  try {
    await apiClient.post('/categories', form.value);
    toast.add({ severity: 'success', summary: 'Created', detail: 'Category added successfully', life: 3000 });
    showDialog.value = false;
    loadCategories();
  } catch (error: any) {
    toast.add({ severity: 'error', summary: 'Error', detail: error.response?.data?.message || 'Failed to save category', life: 4000 });
  }
}

function confirmDelete(c: Category) {
  confirm.require({
    message: `Delete custom category "${c.name}"?`,
    header: 'Confirm Category Deletion',
    icon: 'pi pi-trash',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await apiClient.delete(`/categories/${c.id}`);
        toast.add({ severity: 'info', summary: 'Deleted', detail: 'Category deleted', life: 3000 });
        loadCategories();
      } catch (e: any) {
        toast.add({ severity: 'error', summary: 'Error', detail: e.response?.data?.message, life: 3000 });
      }
    },
  });
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60 dark:border-slate-800">
      <div>
        <h1 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Financial Categories</h1>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">System defaults & custom categories for transaction classification</p>
      </div>

      <button
        @click="openCreateModal"
        class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20 transition-all self-start sm:self-auto"
      >
        <i class="pi pi-plus text-xs"></i>
        <span>Add Custom Category</span>
      </button>
    </div>

    <!-- Type Switch Tabs -->
    <div class="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800">
      <button
        @click="activeTab = 'EXPENSE'"
        :class="[
          'px-5 py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2',
          activeTab === 'EXPENSE'
            ? 'border-rose-500 text-rose-600 dark:text-rose-400'
            : 'border-transparent text-slate-400 hover:text-slate-600'
        ]"
      >
        <i class="pi pi-arrow-up-right"></i>
        <span>Expense Categories</span>
      </button>

      <button
        @click="activeTab = 'INCOME'"
        :class="[
          'px-5 py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2',
          activeTab === 'INCOME'
            ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
            : 'border-transparent text-slate-400 hover:text-slate-600'
        ]"
      >
        <i class="pi pi-arrow-down-left"></i>
        <span>Income Categories</span>
      </button>
    </div>

    <!-- Categories Grid -->
    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      <div
        v-for="cat in categories.filter(c => c.type === activeTab)"
        :key="cat.id"
        class="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 shadow-sm flex flex-col items-center text-center space-y-2 relative group hover:shadow-md transition-shadow"
      >
        <div
          class="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-lg shadow-sm"
          :style="{ backgroundColor: cat.color || '#64748B' }"
        >
          <i :class="cat.icon || 'pi pi-tag'"></i>
        </div>

        <div>
          <p class="text-xs font-bold text-slate-800 dark:text-white truncate max-w-[130px]">{{ cat.name }}</p>
          <span class="text-[10px] text-slate-400">{{ cat.isSystem ? 'System Default' : 'Custom' }}</span>
        </div>

        <button
          v-if="!cat.isSystem"
          @click="confirmDelete(cat)"
          class="absolute top-2 right-2 w-6 h-6 rounded-lg text-slate-300 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          title="Delete category"
        >
          <i class="pi pi-trash text-[10px]"></i>
        </button>
      </div>
    </div>

    <!-- Create Category Dialog -->
    <Dialog v-model:visible="showDialog" modal header="Add Custom Category" :style="{ width: '92vw', maxWidth: '28rem' }">
      <form @submit.prevent="handleSaveCategory" class="space-y-4 pt-2">
        <div>
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Category Name</label>
          <input
            v-model="form.name"
            required
            placeholder="e.g. Pet Care, Gym Membership"
            class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Category Type</label>
            <select
              v-model="form.type"
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none"
            >
              <option value="EXPENSE">Expense</option>
              <option value="INCOME">Income</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Color Theme</label>
            <div class="flex items-center gap-2">
              <input
                v-model="form.color"
                type="color"
                class="w-10 h-10 rounded-xl cursor-pointer border border-slate-200 dark:border-slate-700 bg-transparent p-1"
              />
              <span class="text-xs font-mono">{{ form.color }}</span>
            </div>
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Select Icon</label>
          <div class="grid grid-cols-4 sm:grid-cols-6 gap-2">
            <button
              v-for="icon in iconOptions"
              :key="icon"
              type="button"
              @click="form.icon = icon"
              :class="[
                'h-10 rounded-xl border flex items-center justify-center transition-all',
                form.icon === icon
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950 text-emerald-600'
                  : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500'
              ]"
            >
              <i :class="icon"></i>
            </button>
          </div>
        </div>

        <div class="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-4">
          <button
            type="button"
            @click="showDialog = false"
            class="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-center"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
          >
            Save Category
          </button>
        </div>
      </form>
    </Dialog>
  </div>
</template>
