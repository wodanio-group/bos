<template>

  <div class="block relative w-full overflow-x-auto">
    <div v-if="loading" class="w-full flex items-center justify-center h-20">
      <atom-icon icon="loader-circle" class="animate-spin text-secondary-400 !text-xl"/>
    </div>
    <div v-else-if="filteredItems.length === 0" class="w-full flex items-center justify-center h-20">
      <p class="text-center text-secondary-700 text-sm">{{ $t('general.noItemsFound') }}</p>
    </div>
    <table v-else class="w-full table-fixed">
      <thead>
        <tr class="border-b border-b-secondary-200 bg-secondary-50 text-sm text-secondary-700">
          <th class="text-left px-4 py-2">{{ $t('quote.fields.status') }}</th>
          <th class="text-left px-4 py-2">{{ $t('quote.fields.quoteId') }}</th>
          <th class="text-left px-4 py-2">{{ $t('quote.fields.quoteDate') }}</th>
          <th class="text-right px-4 py-2">{{ $t('quote.fields.subtotal') }}</th>
          <th class="px-4 py-2 w-12"></th>
        </tr>
      </thead>
      <tbody>
        <quote-list-item
          v-for="quote in filteredItems"
          :key="quote.id"
          :quote="quote"
          :pesCustomer="pesCustomer"
          :hasPesInteractRight="hasPesInteractRight"
          @download-pdf="onDownloadPdf">
        </quote-list-item>
      </tbody>
    </table>
  </div>

</template>

<script setup lang="ts">
import type { QuoteViewModel } from '~~/shared/types/quote';

const props = defineProps<{
  companyId: string;
  search: string;
  pesCustomer?: { id: string } | null;
  hasPesInteractRight?: boolean;
}>();

const { downloadFile } = useFileDownload();
const items = ref<QuoteViewModel[]>([]);
const loading = ref(true);

const filteredItems = computed(() => {
  const q = props.search.trim().toLowerCase();
  return items.value.filter(i => !q || i.quoteId.toLowerCase().includes(q));
});

const load = async () => {
  loading.value = true;
  try {
    const result = await $fetch<QuoteViewModel[]>('/api/quote', {
      query: { companyId: props.companyId, take: 999, sortBy: 'createdAt', sortOrder: 'desc' },
    });
    items.value = result;
  } catch (e) {
    console.error('Failed to load quotes', e);
  } finally {
    loading.value = false;
  }
};

const onDownloadPdf = async (quote: QuoteViewModel) => {
  await downloadFile(`/api/quote/${quote.id}/pdf`, `${quote.quoteId}.pdf`);
};

onMounted(() => { load(); });

defineExpose({
  reload: load,
  triggerCreate: () => navigateTo(`/quote/edit/+?companyId=${props.companyId}`),
});
</script>
