<template>

  <PageSectionBox class="col-span-12">
      <template #headerLeft>
        <select
          class="px-3 py-1.5 text-sm border border-secondary-200 rounded-lg"
          v-model="typeFilter">
          <option value="all">{{ $t('pes.bulk.filter.allTypes') }}</option>
          <option value="directDebit">{{ $t('pes.bulk.type.directDebit') }}</option>
          <option value="transfer">{{ $t('pes.bulk.type.transfer') }}</option>
        </select>
        <select
          class="px-3 py-1.5 text-sm border border-secondary-200 rounded-lg"
          v-model="uploadFilter">
          <option value="all">{{ $t('pes.bulk.filter.all') }}</option>
          <option value="pending">{{ $t('pes.bulk.filter.pending') }}</option>
          <option value="uploaded">{{ $t('pes.bulk.filter.uploaded') }}</option>
        </select>
      </template>
      <template #headerRight>
        <atom-button
          v-if="hasPesInteractRight"
          type="button"
          icon="plus"
          :title="$t('pes.bulk.createDirectDebitButton')"
          @click="showCreateDirectDebitDialog = true">
        </atom-button>
        <atom-button
          v-if="hasPesInteractRight"
          type="button"
          icon="plus"
          :title="$t('pes.bulk.createTransferButton')"
          @click="showCreateTransferDialog = true">
        </atom-button>
      </template>

      <div v-if="loading" class="w-full flex items-center justify-center h-20">
        <atom-icon icon="loader-circle" class="animate-spin text-secondary-400 !text-xl"/>
      </div>
      <div v-else-if="filteredItems.length === 0" class="w-full flex items-center justify-center h-20">
        <p class="text-center text-secondary-700 text-sm">{{ $t('general.noItemsFound') }}</p>
      </div>

      <table v-else class="w-full text-sm">
        <thead>
          <tr class="border-b border-secondary-200">
            <th class="px-4 py-2 text-left text-xs font-semibold text-secondary-500">{{ $t('pes.bulk.fields.type') }}</th>
            <th class="px-4 py-2 text-left text-xs font-semibold text-secondary-500">{{ $t('pes.bulk.fields.createdAt') }}</th>
            <th class="px-4 py-2 text-left text-xs font-semibold text-secondary-500">{{ $t('pes.bulk.fields.status') }}</th>
            <th class="px-4 py-2 text-left text-xs font-semibold text-secondary-500">{{ $t('pes.bulk.fields.uploadedAt') }}</th>
            <th class="px-4 py-2"></th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="bulk in filteredItems"
            :key="`${bulk.type}-${bulk.id}`"
            class="border-b border-secondary-100 last:border-b-0 hover:bg-secondary-50">
            <td class="px-4 py-2">
              <span
                v-if="bulk.type === 'directDebit'"
                class="text-xs font-medium text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                {{ $t('pes.bulk.type.directDebit') }}
              </span>
              <span
                v-else
                class="text-xs font-medium text-violet-700 bg-violet-100 px-2 py-0.5 rounded-full">
                {{ $t('pes.bulk.type.transfer') }}
              </span>
            </td>
            <td class="px-4 py-2 text-secondary-600">{{ formatDate(bulk.createdAt) }}</td>
            <td class="px-4 py-2">
              <span
                v-if="bulk.uploadedAt"
                class="text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                {{ $t('pes.bulk.status.uploaded') }}
              </span>
              <span v-else class="text-xs font-medium text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                {{ $t('pes.bulk.status.pending') }}
              </span>
            </td>
            <td class="px-4 py-2 text-secondary-600">
              {{ bulk.uploadedAt ? formatDate(bulk.uploadedAt) : '-' }}
            </td>
            <td class="px-4 py-2">
              <div class="flex items-center justify-end gap-1">
                <atom-button
                  type="button"
                  :icon="csvLoadingId === bulk.id ? 'loader-circle' : 'file-spreadsheet'"
                  :title="$t('pes.bulk.exportCsv')"
                  :outline="true"
                  :disabled="csvLoadingId === bulk.id"
                  :class="{ 'animate-spin': csvLoadingId === bulk.id }"
                  @click="onExportCsv(bulk)">
                </atom-button>
                <atom-button
                  type="button"
                  icon="download"
                  :title="$t('pes.bulk.downloadXml')"
                  :outline="true"
                  @click="onDownloadXml(bulk)">
                </atom-button>
                <atom-button
                  v-if="hasPesInteractRight"
                  type="button"
                  icon="calendar-clock"
                  :title="$t('pes.bulk.updateXmlDate')"
                  :outline="true"
                  @click="onUpdateXmlDate(bulk)">
                </atom-button>
                <atom-button
                  v-if="hasPesInteractRight && !bulk.uploadedAt"
                  type="button"
                  icon="upload"
                  :title="$t('pes.bulk.markUploaded')"
                  :outline="true"
                  @click="openMarkUploaded(bulk)">
                </atom-button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="flex items-center justify-between px-4 py-3 border-t border-secondary-100">
        <span class="text-xs text-secondary-500">
          {{ directDebitTotalItems }} {{ $t('pes.bulk.type.directDebit') }} &middot; {{ transferTotalItems }} {{ $t('pes.bulk.type.transfer') }}
        </span>
        <Pagination
          :isFirst="page <= 1"
          :isLast="isLastPage"
          :state="{ take, page }"
          @update:state="s => { page = s.page; loadItems(); }"/>
      </div>
    </PageSectionBox>

    <!-- Create direct debit dialog -->
    <SimpleAlertDialog
      :open="showCreateDirectDebitDialog"
      :title="$t('pes.bulk.createDirectDebitDialog.title')"
      :description="$t('pes.bulk.createDirectDebitDialog.description')"
      :submitButtonTitle="$t('pes.bulk.createDirectDebitDialog.submit')"
      submitButtonIcon="plus"
      @submit="onCreateDirectDebitBulk"
      @cancel="showCreateDirectDebitDialog = false"
      @update:open="showCreateDirectDebitDialog = $event">
    </SimpleAlertDialog>

    <!-- Create transfer dialog -->
    <SimpleAlertDialog
      :open="showCreateTransferDialog"
      :title="$t('pes.bulk.createTransferDialog.title')"
      :description="$t('pes.bulk.createTransferDialog.description')"
      :submitButtonTitle="$t('pes.bulk.createTransferDialog.submit')"
      submitButtonIcon="plus"
      @submit="onCreateTransferBulk"
      @cancel="showCreateTransferDialog = false"
      @update:open="showCreateTransferDialog = $event">
    </SimpleAlertDialog>

    <!-- Mark as uploaded dialog -->
    <SimpleAlertDialog
      :open="bulkToMarkUploaded !== null"
      :title="$t('pes.bulk.markUploaded')"
      :submitButtonTitle="$t('pes.bulk.markUploaded')"
      submitButtonIcon="upload"
      @submit="onMarkUploaded"
      @cancel="bulkToMarkUploaded = null"
      @update:open="bulkToMarkUploaded = $event ? bulkToMarkUploaded : null">
    </SimpleAlertDialog>

</template>

<script setup lang="ts">
import { DateTime } from 'luxon';
import { formatCurrency } from '~~/shared/utils/default';

type BulkItem = {
  id: string;
  type: 'directDebit' | 'transfer';
  createdAt: string;
  updatedAt: string;
  uploadedAt: string | null;
};

const auth = useAuth();
const user = await auth.getUser();
const toast = useToast();
const { downloadFile } = useFileDownload();

const hasPesInteractRight = computed(() => user?.rights.includes('pes.interact') === true);

const allItems = ref<BulkItem[]>([]);
const directDebitTotalItems = ref(0);
const transferTotalItems = ref(0);
const page = ref(1);
const take = 50;
const isLastPage = ref(false);
const loading = ref(true);
const uploadFilter = ref<'all' | 'pending' | 'uploaded'>('all');
const typeFilter = ref<'all' | 'directDebit' | 'transfer'>('all');
const showCreateDirectDebitDialog = ref(false);
const showCreateTransferDialog = ref(false);
const bulkToMarkUploaded = ref<BulkItem | null>(null);
const csvLoadingId = ref<string | null>(null);

const formatDate = (isoStr: string) =>
  DateTime.fromISO(isoStr).toFormat($t('format.date'));

const filteredItems = computed(() => {
  let items = allItems.value;
  if (typeFilter.value !== 'all') items = items.filter(b => b.type === typeFilter.value);
  if (uploadFilter.value === 'uploaded') return items.filter(b => b.uploadedAt !== null);
  if (uploadFilter.value === 'pending') return items.filter(b => b.uploadedAt === null);
  return items;
});

const loadItems = async () => {
  loading.value = true;
  try {
    const [directDebitResult, transferResult] = await Promise.all([
      $fetch<{ items: Omit<BulkItem, 'type'>[]; totalItems: number }>('/api/pes/bank-direct-debit-bulk', {
        query: { take, page: page.value, order: 'DESC' },
      }),
      $fetch<{ items: Omit<BulkItem, 'type'>[]; totalItems: number }>('/api/pes/bank-transfer-bulk', {
        query: { take, page: page.value, order: 'DESC' },
      }),
    ]);

    directDebitTotalItems.value = directDebitResult.totalItems;
    transferTotalItems.value = transferResult.totalItems;
    isLastPage.value = directDebitResult.items.length < take && transferResult.items.length < take;

    const directDebitItems: BulkItem[] = directDebitResult.items.map(item => ({ ...item, type: 'directDebit' }));
    const transferItems: BulkItem[] = transferResult.items.map(item => ({ ...item, type: 'transfer' }));

    allItems.value = [...directDebitItems, ...transferItems].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  } catch (e) {
    console.error('Failed to load bulk items', e);
    toast.add({ type: 'error', title: $t('general.loadError') });
  } finally {
    loading.value = false;
  }
};

const onCreateDirectDebitBulk = async () => {
  try {
    await $fetch('/api/pes/bank-direct-debit-bulk', { method: 'POST' });
    showCreateDirectDebitDialog.value = false;
    await loadItems();
    toast.add({ type: 'success', title: $t('pes.bulk.toast.createDirectDebitSuccess') });
  } catch {
    toast.add({ type: 'error', title: $t('pes.bulk.toast.createError') });
  }
};

const onCreateTransferBulk = async () => {
  try {
    await $fetch('/api/pes/bank-transfer-bulk', { method: 'POST' });
    showCreateTransferDialog.value = false;
    await loadItems();
    toast.add({ type: 'success', title: $t('pes.bulk.toast.createTransferSuccess') });
  } catch {
    toast.add({ type: 'error', title: $t('pes.bulk.toast.createError') });
  }
};

const onDownloadXml = async (bulk: BulkItem) => {
  const apiPath = bulk.type === 'directDebit'
    ? `/api/pes/bank-direct-debit-bulk/${bulk.id}/xml`
    : `/api/pes/bank-transfer-bulk/${bulk.id}/xml`;
  const filename = bulk.type === 'directDebit'
    ? `lastschrift-bulk-${bulk.id.slice(0, 8)}.xml`
    : `ueberweisung-bulk-${bulk.id.slice(0, 8)}.xml`;
  await downloadFile(apiPath, filename);
};

const onUpdateXmlDate = async (bulk: BulkItem) => {
  const apiPath = bulk.type === 'directDebit'
    ? `/api/pes/bank-direct-debit-bulk/${bulk.id}/xml`
    : `/api/pes/bank-transfer-bulk/${bulk.id}/xml`;
  try {
    await $fetch(apiPath, { method: 'PATCH' });
    await loadItems();
    toast.add({ type: 'success', title: $t('pes.bulk.toast.updateXmlDateSuccess') });
  } catch {
    toast.add({ type: 'error', title: $t('pes.bulk.toast.updateXmlDateError') });
  }
};

const openMarkUploaded = (bulk: BulkItem) => {
  bulkToMarkUploaded.value = bulk;
};

const onMarkUploaded = async () => {
  if (!bulkToMarkUploaded.value) return;
  const apiPath = bulkToMarkUploaded.value.type === 'directDebit'
    ? `/api/pes/bank-direct-debit-bulk/${bulkToMarkUploaded.value.id}`
    : `/api/pes/bank-transfer-bulk/${bulkToMarkUploaded.value.id}`;
  try {
    await $fetch(apiPath, {
      method: 'PATCH',
      body: { uploadedAt: new Date().toISOString() },
    });
    bulkToMarkUploaded.value = null;
    await loadItems();
    toast.add({ type: 'success', title: $t('pes.bulk.toast.markUploadedSuccess') });
  } catch {
    toast.add({ type: 'error', title: $t('pes.bulk.toast.markUploadedError') });
  }
};

const escapeCsvField = (value: string | number | null | undefined): string => {
  const str = value == null ? '' : String(value);
  if (str.includes('"') || str.includes(',') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

const onExportCsv = async (bulk: BulkItem) => {
  csvLoadingId.value = bulk.id;
  try {
    const paymentApiPath = bulk.type === 'directDebit'
      ? '/api/pes/bank-direct-debit'
      : '/api/pes/bank-transfer';
    const bulkIdParam = bulk.type === 'directDebit'
      ? { bankDirectDebitBulkId: bulk.id }
      : { bankTransferBulkId: bulk.id };

    type PaymentEntry = { id: string; chargeId: string; endToEndId: string; amount: number };
    type Charge = { id: string; chargeNumber: string; total: number; customerId: string; documentGeneratedAt: string | null };
    type Customer = { id: string; externalId: string | null; debitorId: number };

    const paymentResult = await $fetch<{ items: PaymentEntry[] }>(paymentApiPath, {
      query: { ...bulkIdParam, take: 9999, order: 'ASC' },
    });
    const entries = paymentResult.items;

    const uniqueChargeIds = [...new Set(entries.map(e => e.chargeId))];
    const charges = await Promise.all(
      uniqueChargeIds.map(id => $fetch<Charge>(`/api/pes/charge/${id}`)),
    );
    const chargeMap = new Map(charges.map(c => [c.id, c]));

    const uniqueCustomerIds = [...new Set(charges.map(c => c.customerId))];
    const customers = await Promise.all(
      uniqueCustomerIds.map(id => $fetch<Customer>(`/api/pes/customer/${id}`)),
    );
    const customerMap = new Map(customers.map(c => [c.id, c]));

    const bulkDate = DateTime.fromISO(bulk.createdAt).toISODate();
    const headers = [
      $t('pes.bulk.csv.chargeNumber'),
      $t('pes.bulk.csv.invoiceDate'),
      $t('pes.bulk.csv.customerNumber'),
      $t('pes.bulk.csv.debitorNumber'),
      $t('pes.bulk.csv.grossAmount'),
      $t('pes.bulk.csv.endToEndId'),
      $t('pes.bulk.csv.bulkDate'),
    ];
    const rows = entries.map(entry => {
      const charge = chargeMap.get(entry.chargeId);
      const customer = charge ? customerMap.get(charge.customerId) : undefined;
      const invoiceDate = charge?.documentGeneratedAt
        ? DateTime.fromISO(charge.documentGeneratedAt).toISODate()
        : '';
      return [
        charge?.chargeNumber ?? '',
        invoiceDate,
        customer?.externalId ?? '',
        customer?.debitorId ?? '',
        charge?.total ?? entry.amount,
        entry.endToEndId,
        bulkDate,
      ].map(escapeCsvField).join(',');
    });

    const csvContent = '﻿' + [headers.map(escapeCsvField).join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const prefix = bulk.type === 'directDebit' ? 'direct-debit' : 'transfer';
    link.href = url;
    link.download = `${prefix}-bulk-${bulk.id.slice(0, 8)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  } catch {
    toast.add({ type: 'error', title: $t('pes.bulk.toast.exportCsvError') });
  } finally {
    csvLoadingId.value = null;
  }
};

onMounted(() => { loadItems(); });
</script>
