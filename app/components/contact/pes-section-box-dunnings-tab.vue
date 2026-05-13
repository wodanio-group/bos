<template>

  <div class="flex flex-col py-2">
    <div v-if="loading" class="w-full flex items-center justify-center h-20">
      <atom-icon icon="loader-circle" class="animate-spin text-secondary-400 !text-xl"/>
    </div>
    <div v-else-if="filteredItems.length === 0" class="w-full flex items-center justify-center h-20">
      <p class="text-center text-secondary-700 text-sm">{{ $t('general.noItemsFound') }}</p>
    </div>
    <div
      v-for="dunning in filteredItems"
      :key="dunning.id"
      class="flex items-center justify-between gap-3 px-4 py-3 border-b border-b-secondary-200 last:border-b-0">
      <div class="flex items-center gap-2 min-w-0">
        <span class="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 shrink-0">
          {{ $t('company.pes.dunnings.level', { level: dunning.dunningLevel }) }}
        </span>
        <span class="text-sm font-medium truncate">{{ dunning.dunningNumber }}</span>
      </div>
      <div class="flex items-center gap-3 shrink-0">
        <span class="text-xs text-secondary-500">
          {{ dunning.documentGeneratedAt ? formatDate(dunning.documentGeneratedAt) : '-' }}
        </span>
        <a
          v-if="dunning.url"
          :href="dunning.url"
          target="_blank"
          class="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium border border-secondary-300 rounded text-secondary-600 hover:text-secondary-900 hover:border-secondary-400 transition-colors">
          {{ $t('pes.dunnings.pdf') }}
        </a>
      </div>
    </div>
  </div>

</template>

<script setup lang="ts">
import { DateTime } from 'luxon';

type Dunning = {
  id: string;
  dunningNumber: string;
  dunningLevel: number;
  url: string | null;
  documentGeneratedAt: string | null;
  mailSentAt: string | null;
};

const props = defineProps<{
  pesCustomer: { id: string };
  search: string;
}>();

const items = ref<Dunning[]>([]);
const loading = ref(true);

const filteredItems = computed(() => {
  const q = props.search.trim().toLowerCase();
  return items.value.filter(d => !q || d.dunningNumber.toLowerCase().includes(q));
});

const formatDate = (isoStr: string) =>
  DateTime.fromISO(isoStr).toFormat($t('format.date'));

const load = async () => {
  loading.value = true;
  try {
    const result = await $fetch<{ items: Dunning[] }>('/api/pes/dunning', {
      query: { customerId: props.pesCustomer.id, take: 999, order: 'DESC' },
    });
    items.value = result.items;
  } catch (e) {
    console.error('Failed to load dunnings', e);
  } finally {
    loading.value = false;
  }
};

onMounted(() => { load(); });

defineExpose({ reload: load });
</script>
