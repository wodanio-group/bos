<template>

  <Page :title="$t('quote.title')">

    <DataSectionBox
      class="col-span-12"
      :items="itemsWithCompany"
      addActionKey="openAdd"
      itemClickActionKey="view"
      :fields="[
        { title: $t('quote.fields.status'), fieldName: 'status', transform: (v: any) => $t(`quote.status.${v}`) },
        { title: $t('quote.fields.quoteId'), fieldName: 'quoteId' },
        { title: $t('quote.fields.quoteDate'), fieldName: 'quoteDate', transform: (v: any) => formatDate(v) },
        { title: $t('quote.fields.company'), fieldName: 'companyDisplayName', transform: (v: any) => v || '-' },
        { title: $t('quote.fields.subtotal'), fieldName: 'subtotal', transform: (v: any) => formatCurrency(v) },
      ]"
      :actions="[
        { title: $t('general.view'), icon: 'external-link', key: 'view' },
        ...((hasRightQuoteAllEdit === true) ? [{ title: $t('general.edit'), icon: 'square-pen', key: 'view-edit' }] : []),
        ...((hasRightQuoteAllDelete === true) ? [{ title: $t('general.delete'), icon: 'trash-2', key: 'requestDelete' }] : []),
      ]"
      :paginationState="pagination"
      :paginationIsFirst="paginationIsFirst"
      :paginationIsLast="paginationIsLast"
      :hideAddButto="hasRightQuoteAllCreate !== true"
      @update:paginationState="paginationSet"
      @updateSearch="searchSet"
      @action="actionHandler">
    </DataSectionBox>

    <SimpleAlertDialog
      :open="selectedDeleteItem !== null"
      :title="$t('quote.deleteTitle', { quoteId: selectedDeleteItem?.quoteId || '?' })"
      :description="$t('quote.deleteDescription')"
      :submitButtonTitle="$t('general.delete')"
      submitButtonIcon="trash-2"
      @submit="actionHandler('delete', selectedDeleteItem)"
      @cancel="selectedDeleteItem = null"
      @update:open="actionHandler('requestDelete', $event ? selectedDeleteItem : null)"/>

  </Page>

</template>

<script setup lang="ts">

import type { QuoteViewModel } from '~~/shared/types/quote';
import { formatCurrency } from '~~/shared/utils/default';
import { DateTime } from 'luxon';

definePageMeta({
  middleware: ['auth']
});

const auth = useAuth();
const user = await auth.getUser();
const toast = useToast();

const {
  items,
  loadItems,
  pagination,
  paginationIsFirst,
  paginationIsLast,
  paginationSet,
  searchSet,
  deleteById,
  sortSet,
} = useCrud<QuoteViewModel>({
  apiPath: '/api/quote'
});
sortSet('createdAt', 'desc');
await loadItems();

const hasRightQuoteAllCreate = computed(() => user && user.rights.includes('quote.all.create')),
      hasRightQuoteAllEdit = computed(() => user && user.rights.includes('quote.all.edit')),
      hasRightQuoteAllDelete = computed(() => user && user.rights.includes('quote.all.delete'));

const selectedDeleteItem = useState<QuoteViewModel | null>('quoteSelectedDeleteItem', () => null);

// Company CRUD for loading company names
const companyCrud = useCrud<any>({
  apiPath: '/api/company'
});

// Load company names for all quotes
const companyNames = ref<Record<string, string>>({});

const loadCompanyNames = async () => {
  const uniqueCompanyIds = [...new Set(items.value.map(q => q.companyId))];

  for (const companyId of uniqueCompanyIds) {
    if (!companyNames.value[companyId]) {
      try {
        await companyCrud.loadItem(companyId);
        const company = companyCrud.item.value;
        companyNames.value[companyId] = companyDisplayName(company) ?? companyId;
      } catch (e) {
        console.error(`Failed to load company ${companyId}`, e);
        companyNames.value[companyId] = companyId;
      }
    }
  }
};

// Combine quotes with company names
const itemsWithCompany = computed(() => {
  return items.value.map(quote => ({
    ...quote,
    companyDisplayName: companyNames.value[quote.companyId] || '-'
  }));
});

// Watch items changes and load company names
watch(items, async () => {
  await loadCompanyNames();
}, { immediate: true });

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-';
  return DateTime.fromISO(dateStr).toFormat('dd. LLL yyyy');
};

const actionHandler = async (key: string, item?: QuoteViewModel | null) => { switch (key) {
  case 'openAdd':
    navigateTo('/quote/edit/+');
    break;
  case 'view':
    if (!item) return;
    navigateTo(`/quote/${item.id}`);
    break;
  case 'view-edit':
    if (!item) return;
    navigateTo(`/quote/edit/${item.id}`);
    break;
  case 'delete':
    try {
      if (!item)
        return;
      await deleteById(item.id);
      loadItems();
      toast.add({ type: 'success', title: $t('quote.deleteSuccessToast', { quoteId: item.quoteId }) });
      selectedDeleteItem.value = null;
    } catch (e) {
      toast.add({ type: 'error', title: $t('quote.deleteErrorToast', { quoteId: item?.quoteId || '?' }) });
    }
    break;
  case 'requestDelete':
    selectedDeleteItem.value = item ?? null;
    break;
} };

</script>
