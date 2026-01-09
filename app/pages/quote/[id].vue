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
        :title="$t('quote.item.items')"
        class="mb-4">
        <div class="divide-y divide-secondary-100">
          <div
            v-for="quoteItem in item.quoteItems"
            :key="quoteItem.id"
            class="px-4 py-3 hover:bg-secondary-50 transition-colors">
            <div class="flex justify-between items-start mb-1">
              <div class="flex-1">
                <p class="text-sm font-semibold text-primary-950">
                  {{ quoteItem.quotePosition }}. {{ quoteItem.title }}
                </p>
                <p class="text-xs text-secondary-600 mt-1" v-if="quoteItem.description">
                  {{ quoteItem.description }}
                </p>
              </div>
              <div class="text-right ml-4">
                <p class="text-sm font-semibold text-primary-950">
                  {{ formatCurrency(quoteItem.total) }}
                </p>
              </div>
            </div>
            <div class="flex justify-between items-center text-xs text-secondary-600 mt-2">
              <span>
                {{ quoteItem.quantity }} {{ quoteItem.unit || $t('quote.item.pieces') }} × {{ formatCurrency(quoteItem.price) }}
              </span>
              <span>
                {{ $t('quote.item.taxRate') }}: {{ (quoteItem.taxRate * 100).toFixed(0) }}%
              </span>
            </div>
          </div>
        </div>
        <div class="border-t-2 border-t-secondary-300 bg-secondary-50 px-4 py-3">
          <div class="flex justify-between items-center mb-2">
            <span class="text-sm text-secondary-700">{{ $t('quote.item.subtotal') }}</span>
            <span class="text-sm font-medium text-primary-950">{{ formatCurrency(item.subtotal) }}</span>
          </div>
          <div class="flex justify-between items-center mb-2">
            <span class="text-sm text-secondary-700">{{ $t('quote.item.tax') }}</span>
            <span class="text-sm font-medium text-primary-950">{{ formatCurrency(item.tax) }}</span>
          </div>
          <div class="flex justify-between items-center pt-2 border-t border-t-secondary-200">
            <span class="text-base font-semibold text-primary-950">{{ $t('quote.item.total') }}</span>
            <span class="text-base font-bold text-primary-600">{{ formatCurrency(item.total) }}</span>
          </div>
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

</script>
