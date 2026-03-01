<template>

  <PageSectionBox class="col-span-12">
      <template #headerLeft>
        <input
          type="text"
          :placeholder="$t('pes.dunnings.searchPlaceholder')"
          class="px-3 py-1.5 text-sm border border-secondary-200 rounded-lg"
          v-model="dunningNumberSearch"
          @input="onSearch"/>
      </template>

      <div v-if="loading" class="w-full flex items-center justify-center h-20">
        <atom-icon icon="loader-circle" class="animate-spin text-secondary-400 !text-xl"/>
      </div>
      <div v-else-if="items.length === 0" class="w-full flex items-center justify-center h-20">
        <p class="text-center text-secondary-700 text-sm">{{ $t('general.noItemsFound') }}</p>
      </div>

      <table v-else class="w-full text-sm">
        <thead>
          <tr class="border-b border-secondary-200">
            <th class="px-4 py-2 text-left text-xs font-semibold text-secondary-500">{{ $t('pes.dunnings.fields.dunningNumber') }}</th>
            <th class="px-4 py-2 text-left text-xs font-semibold text-secondary-500">{{ $t('pes.dunnings.fields.level') }}</th>
            <th class="px-4 py-2 text-left text-xs font-semibold text-secondary-500">{{ $t('pes.dunnings.fields.generatedAt') }}</th>
            <th class="px-4 py-2 text-left text-xs font-semibold text-secondary-500">{{ $t('pes.dunnings.fields.mailSentAt') }}</th>
            <th class="px-4 py-2"></th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="dunning in items"
            :key="dunning.id"
            class="border-b border-secondary-100 last:border-b-0 hover:bg-secondary-50">
            <td class="px-4 py-2 font-medium">{{ dunning.dunningNumber }}</td>
            <td class="px-4 py-2">
              <span class="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                {{ dunning.dunningLevel }}
              </span>
            </td>
            <td class="px-4 py-2 text-secondary-600">
              {{ dunning.documentGeneratedAt ? formatDate(dunning.documentGeneratedAt) : '-' }}
            </td>
            <td class="px-4 py-2 text-secondary-600">
              {{ dunning.mailSentAt ? formatDate(dunning.mailSentAt) : '-' }}
            </td>
            <td class="px-4 py-2">
              <div class="flex items-center justify-end gap-1">
                <a
                  v-if="dunning.url"
                  :href="dunning.url"
                  target="_blank"
                  class="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium border border-secondary-300 rounded text-secondary-600 hover:text-secondary-900 hover:border-secondary-400 transition-colors">
                  {{ $t('pes.dunnings.pdf') }}
                </a>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="flex items-center justify-between px-4 py-3 border-t border-secondary-100">
        <span class="text-xs text-secondary-500">{{ totalItems }} {{ $t('pes.dunnings.title') }}</span>
        <div class="flex items-center gap-2">
          <atom-button
            type="button"
            icon="chevron-left"
            :outline="true"
            :disabled="page <= 1"
            @click="prevPage">
          </atom-button>
          <span class="text-sm text-secondary-600">{{ page }}</span>
          <atom-button
            type="button"
            icon="chevron-right"
            :outline="true"
            :disabled="items.length < take"
            @click="nextPage">
          </atom-button>
        </div>
      </div>
    </PageSectionBox>

</template>

<script setup lang="ts">
import { DateTime } from 'luxon';

type Dunning = {
  id: string;
  dunningNumber: string;
  dunningLevel: number;
  pdfPath: string | null;
  url: string | null;
  documentGeneratedAt: string | null;
  mailSentAt: string | null;
  chargeId: string;
};

const toast = useToast();

const items = ref<Dunning[]>([]);
const totalItems = ref(0);
const page = ref(1);
const take = 20;
const loading = ref(true);
const dunningNumberSearch = ref('');

let searchDebounce: ReturnType<typeof setTimeout> | null = null;

const formatDate = (isoStr: string) =>
  DateTime.fromISO(isoStr).toFormat($t('format.date'));

const loadItems = async () => {
  loading.value = true;
  try {
    const result = await $fetch<{ items: Dunning[]; totalItems: number }>('/api/pes/dunning', {
      query: {
        take,
        page: page.value,
        order: 'DESC',
        ...(dunningNumberSearch.value ? { dunningNumber: dunningNumberSearch.value } : {}),
      },
    });
    items.value = result.items;
    totalItems.value = result.totalItems;
  } catch (e) {
    console.error('Failed to load dunnings', e);
    toast.add({ type: 'error', title: $t('general.loadError') });
  } finally {
    loading.value = false;
  }
};

const onSearch = () => {
  if (searchDebounce) clearTimeout(searchDebounce);
  searchDebounce = setTimeout(() => {
    page.value = 1;
    loadItems();
  }, 400);
};

const prevPage = () => {
  if (page.value > 1) {
    page.value--;
    loadItems();
  }
};

const nextPage = () => {
  page.value++;
  loadItems();
};

onMounted(() => { loadItems(); });
</script>
