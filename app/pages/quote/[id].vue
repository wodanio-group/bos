<template>

  <Page
    v-if="item"
    :title="$t('quote.item.title', { quoteId: item.quoteId })">
    <template #header>
      <atom-button
        type="button"
        icon="square-pen"
        :title="$t('general.edit')"
        :outline="true"
        @click="navigateTo(`/quote/edit/${item.id}`)"
        v-if="hasRightQuoteAllEdit">
      </atom-button>
      <atom-button
        type="button"
        icon="trash-2"
        :title="$t('general.delete')"
        :outline="true"
        @click="showDeletePopover = true"
        v-if="hasRightQuoteAllDelete">
      </atom-button>
    </template>

    <div class="col-span-8">
      <PageSectionBox
        :title="$t('quote.item.pdfPreview')"
        class="mb-4">
        <template #headerRight>
          <atom-button
            type="button"
            icon="download"
            :title="$t('quote.item.downloadPdf')"
            :outline="true"
            @click="downloadPdf">
          </atom-button>
        </template>
        <div class="relative w-full h-[600px]">
          <iframe
            :src="`/api/quote/${item.id}/pdf#toolbar=0&navpanes=0&scrollbar=0`"
            class="w-full h-full border-0"
            title="Quote PDF Preview">
          </iframe>
        </div>
      </PageSectionBox>
    </div>

    <div class="col-span-4">
      <PageSectionBox :title="$t('quote.item.details')">
        <div class="flex flex-col gap-4 py-4">
          <div class="w-full flex items-center justify-between gap-2 px-4">
            <span class="text-xs font-semibold text-secondary-600">{{ $t('quote.fields.status') }}</span>
            <span class="text-sm text-right">{{ $t(`quote.status.${item.status}`) }}</span>
          </div>
          <div class="w-full flex items-center justify-between gap-2 px-4">
            <span class="text-xs font-semibold text-secondary-600">{{ $t('quote.fields.quoteId') }}</span>
            <span class="text-sm text-right">{{ item.quoteId }}</span>
          </div>
          <div class="w-full flex items-center justify-between gap-2 px-4">
            <span class="text-xs font-semibold text-secondary-600">{{ $t('quote.fields.quoteDate') }}</span>
            <span class="text-sm text-right">{{ formatDate(item.quoteDate) }}</span>
          </div>
          <div v-if="item.quoteValidUntil" class="w-full flex items-center justify-between gap-2 px-4">
            <span class="text-xs font-semibold text-secondary-600">{{ $t('quote.fields.validUntil') }}</span>
            <span class="text-sm text-right">{{ formatDate(item.quoteValidUntil) }}</span>
          </div>
          <div v-if="companyName && item.companyId" class="w-full flex items-center justify-between gap-2 px-4 -my-2">
            <span class="text-xs font-semibold text-secondary-600">{{ $t('quote.fields.company') }}</span>
            <molecule-link-button
              :to="`/company/${item.companyId}`"
              :title="companyName" />
          </div>
          <div v-if="ownerName && item.ownerId" class="w-full flex items-center justify-between gap-2 px-4">
            <span class="text-xs font-semibold text-secondary-600">{{ $t('quote.fields.owner') }}</span>
            <span class="text-sm text-right">{{ ownerName }}</span>
          </div>
          <div class="w-full h-0 border-t border-t-secondary-200"></div>
          <div class="w-full flex items-center justify-between gap-2 px-4">
            <span class="text-xs font-semibold text-secondary-600">{{ $t('quote.item.subtotal') }}</span>
            <span class="text-sm text-right">{{ formatCurrency(item.subtotal) }}</span>
          </div>
          <div class="w-full flex items-center justify-between gap-2 px-4">
            <span class="text-xs font-semibold text-secondary-600">{{ $t('quote.item.tax') }}</span>
            <span class="text-sm text-right">{{ formatCurrency(item.tax) }}</span>
          </div>
          <div class="w-full flex items-center justify-between gap-2 px-4">
            <span class="text-xs font-semibold text-secondary-600">{{ $t('quote.item.total') }}</span>
            <span class="text-sm text-right">{{ formatCurrency(item.total) }}</span>
          </div>
          <div class="w-full h-0 border-t border-t-secondary-200"></div>
          <div class="w-full flex items-center justify-between gap-2 px-4">
            <span class="text-xs font-semibold text-secondary-600">{{ $t('general.createdAt') }}</span>
            <span class="text-sm text-right">{{ formatDateTime(item.createdAt) }}</span>
          </div>
          <div class="w-full flex items-center justify-between gap-2 px-4">
            <span class="text-xs font-semibold text-secondary-600">{{ $t('general.updatedAt') }}</span>
            <span class="text-sm text-right">{{ formatDateTime(item.updatedAt) }}</span>
          </div>
        </div>
      </PageSectionBox>
    </div>

    <SimpleAlertDialog
      :open="showDeletePopover === true"
      :title="$t('quote.item.delete.title', { quoteId: item.quoteId })"
      :description="$t('quote.item.delete.description')"
      :submitButtonTitle="$t('general.delete')"
      submitButtonIcon="trash-2"
      @submit="onDelete"
      @cancel="showDeletePopover = false"
      @update:open="showDeletePopover = $event"/>

  </Page>

</template>

<script setup lang="ts">

import type { QuoteViewModel } from '~~/shared/types/quote';
import { formatCurrency } from '~~/shared/utils/default';
import { userDisplayName } from '~~/shared/utils/user';
import { companyDisplayName } from '~~/shared/utils/contact';
import { DateTime } from 'luxon';

definePageMeta({
  middleware: ['auth']
});

const auth = useAuth();
const user = await auth.getUser();
const toast = useToast();
const { downloadFile } = useFileDownload();
const { item, loadItem, deleteById } = useCrud<QuoteViewModel>({
  apiPath: '/api/quote'
});
await loadItem();

const hasRightQuoteAllEdit = computed(() => user && user.rights.includes('quote.all.edit')),
      hasRightQuoteAllDelete = computed(() => user && user.rights.includes('quote.all.delete'));

// Load owner name if ownerId is set
const ownerName = ref<string>('');
const loadOwnerName = async () => {
  if (item.value?.ownerId) {
    try {
      const owner = await $fetch(`/api/user/${item.value.ownerId}`);
      ownerName.value = userDisplayName(owner as any);
    } catch (e) {
      console.error('Failed to load owner', e);
    }
  }
};

// Load company name if companyId is set
const companyName = ref<string>('');
const loadCompanyName = async () => {
  if (item.value?.companyId) {
    try {
      const company = await $fetch(`/api/company/${item.value.companyId}`);
      companyName.value = companyDisplayName(company as any);
    } catch (e) {
      console.error('Failed to load company', e);
    }
  }
};

// Watch for item changes and load owner and company names
watch(item, async (newItem) => {
  if (newItem?.ownerId) {
    await loadOwnerName();
  }
  if (newItem?.companyId) {
    await loadCompanyName();
  }
}, { immediate: true });

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-';
  return DateTime.fromISO(dateStr).toFormat('dd. LLL yyyy');
};

const formatDateTime = (dateStr: string) => {
  if (!dateStr) return '-';
  return DateTime.fromISO(dateStr).toFormat('dd. LLL yyyy, HH:mm');
};

const showDeletePopover = ref(false);
const onDelete = async () => {
  try {
    if (!item.value)
      return;
    await deleteById(item.value.id);
    toast.add({ type: 'success', title: $t('quote.item.delete.success', { quoteId: item.value.quoteId }) });
    navigateTo(`/quote`);
  } catch (e) {
    toast.add({ type: 'error', title: $t('quote.item.delete.error') });
  }
};

const downloadPdf = async () => {
  if (!item.value) return;
  await downloadFile(`/api/quote/${item.value.id}/pdf`, `${item.value.quoteId}.pdf`);
};

</script>
