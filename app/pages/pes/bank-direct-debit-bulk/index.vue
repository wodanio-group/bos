<template>

  <PageSectionBox class="col-span-12">
      <template #headerLeft>
        <select
          class="px-3 py-1.5 text-sm border border-secondary-200 rounded-lg"
          v-model="uploadFilter">
          <option value="all">{{ $t('pes.directDebitBulk.filter.all') }}</option>
          <option value="pending">{{ $t('pes.directDebitBulk.filter.pending') }}</option>
          <option value="uploaded">{{ $t('pes.directDebitBulk.filter.uploaded') }}</option>
        </select>
      </template>
      <template #headerRight>
        <atom-button
          v-if="hasPesInteractRight"
          type="button"
          icon="plus"
          :title="$t('pes.directDebitBulk.createButton')"
          @click="showCreateDialog = true">
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
            <th class="px-4 py-2 text-left text-xs font-semibold text-secondary-500">{{ $t('pes.directDebitBulk.fields.id') }}</th>
            <th class="px-4 py-2 text-left text-xs font-semibold text-secondary-500">{{ $t('pes.directDebitBulk.fields.createdAt') }}</th>
            <th class="px-4 py-2 text-left text-xs font-semibold text-secondary-500">{{ $t('pes.directDebitBulk.fields.status') }}</th>
            <th class="px-4 py-2 text-left text-xs font-semibold text-secondary-500">{{ $t('pes.directDebitBulk.fields.uploadedAt') }}</th>
            <th class="px-4 py-2"></th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="bulk in filteredItems"
            :key="bulk.id"
            class="border-b border-secondary-100 last:border-b-0 hover:bg-secondary-50">
            <td class="px-4 py-2 font-mono text-xs text-secondary-600">{{ bulk.id.slice(0, 8) }}...</td>
            <td class="px-4 py-2 text-secondary-600">{{ formatDate(bulk.createdAt) }}</td>
            <td class="px-4 py-2">
              <span
                v-if="bulk.uploadedAt"
                class="text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                {{ $t('pes.directDebitBulk.status.uploaded') }}
              </span>
              <span v-else class="text-xs font-medium text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                {{ $t('pes.directDebitBulk.status.pending') }}
              </span>
            </td>
            <td class="px-4 py-2 text-secondary-600">
              {{ bulk.uploadedAt ? formatDate(bulk.uploadedAt) : '-' }}
            </td>
            <td class="px-4 py-2">
              <div class="flex items-center justify-end gap-1">
                <atom-button
                  type="button"
                  icon="download"
                  :title="$t('pes.directDebitBulk.downloadXml')"
                  :outline="true"
                  @click="onDownloadXml(bulk)">
                </atom-button>
                <atom-button
                  v-if="hasPesInteractRight"
                  type="button"
                  icon="calendar-clock"
                  :title="$t('pes.directDebitBulk.updateXmlDate')"
                  :outline="true"
                  @click="onUpdateXmlDate(bulk)">
                </atom-button>
                <atom-button
                  v-if="hasPesInteractRight && !bulk.uploadedAt"
                  type="button"
                  icon="upload"
                  :title="$t('pes.directDebitBulk.markUploaded')"
                  :outline="true"
                  @click="openMarkUploaded(bulk)">
                </atom-button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="flex items-center justify-between px-4 py-3 border-t border-secondary-100">
        <span class="text-xs text-secondary-500">{{ totalItems }} {{ $t('pes.directDebitBulk.title') }}</span>
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
            :disabled="allItems.length < take"
            @click="nextPage">
          </atom-button>
        </div>
      </div>
    </PageSectionBox>

    <!-- Create dialog -->
    <SimpleAlertDialog
      :open="showCreateDialog"
      :title="$t('pes.directDebitBulk.createDialog.title')"
      :description="$t('pes.directDebitBulk.createDialog.description')"
      :submitButtonTitle="$t('pes.directDebitBulk.createDialog.submit')"
      submitButtonIcon="plus"
      @submit="onCreateBulk"
      @cancel="showCreateDialog = false"
      @update:open="showCreateDialog = $event">
    </SimpleAlertDialog>

    <!-- Mark as uploaded dialog -->
    <SimpleAlertDialog
      :open="bulkToMarkUploaded !== null"
      :title="$t('pes.directDebitBulk.markUploaded')"
      :submitButtonTitle="$t('pes.directDebitBulk.markUploaded')"
      submitButtonIcon="upload"
      @submit="onMarkUploaded"
      @cancel="bulkToMarkUploaded = null"
      @update:open="bulkToMarkUploaded = $event ? bulkToMarkUploaded : null">
    </SimpleAlertDialog>

</template>

<script setup lang="ts">
import { DateTime } from 'luxon';

type BankDirectDebitBulk = {
  id: string;
  createdAt: string;
  updatedAt: string;
  uploadedAt: string | null;
};

const auth = useAuth();
const user = await auth.getUser();
const toast = useToast();
const { downloadFile } = useFileDownload();

const hasPesInteractRight = computed(() => user?.rights.includes('pes.interact') === true);

const allItems = ref<BankDirectDebitBulk[]>([]);
const totalItems = ref(0);
const page = ref(1);
const take = 50;
const loading = ref(true);
const uploadFilter = ref<'all' | 'pending' | 'uploaded'>('all');
const showCreateDialog = ref(false);
const bulkToMarkUploaded = ref<BankDirectDebitBulk | null>(null);

const formatDate = (isoStr: string) =>
  DateTime.fromISO(isoStr).toFormat($t('format.date'));

const filteredItems = computed(() => {
  if (uploadFilter.value === 'all') return allItems.value;
  if (uploadFilter.value === 'uploaded') return allItems.value.filter(b => b.uploadedAt !== null);
  return allItems.value.filter(b => b.uploadedAt === null);
});

const loadItems = async () => {
  loading.value = true;
  try {
    const result = await $fetch<{ items: BankDirectDebitBulk[]; totalItems: number }>('/api/pes/bank-direct-debit-bulk', {
      query: {
        take,
        page: page.value,
        order: 'DESC',
      },
    });
    allItems.value = result.items;
    totalItems.value = result.totalItems;
  } catch (e) {
    console.error('Failed to load bank direct debit bulks', e);
    toast.add({ type: 'error', title: $t('general.loadError') });
  } finally {
    loading.value = false;
  }
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

const onCreateBulk = async () => {
  try {
    await $fetch('/api/pes/bank-direct-debit-bulk', { method: 'POST' });
    showCreateDialog.value = false;
    await loadItems();
    toast.add({ type: 'success', title: $t('pes.directDebitBulk.toast.createSuccess') });
  } catch {
    toast.add({ type: 'error', title: $t('pes.directDebitBulk.toast.createError') });
  }
};

const onDownloadXml = async (bulk: BankDirectDebitBulk) => {
  await downloadFile(
    `/api/pes/bank-direct-debit-bulk/${bulk.id}/xml`,
    `lastschrift-bulk-${bulk.id.slice(0, 8)}.xml`,
  );
};

const onUpdateXmlDate = async (bulk: BankDirectDebitBulk) => {
  try {
    await $fetch(`/api/pes/bank-direct-debit-bulk/${bulk.id}/xml`, { method: 'PATCH' });
    await loadItems();
    toast.add({ type: 'success', title: $t('pes.directDebitBulk.toast.updateXmlDateSuccess') });
  } catch {
    toast.add({ type: 'error', title: $t('pes.directDebitBulk.toast.updateXmlDateError') });
  }
};

const openMarkUploaded = (bulk: BankDirectDebitBulk) => {
  bulkToMarkUploaded.value = bulk;
};

const onMarkUploaded = async () => {
  if (!bulkToMarkUploaded.value) return;
  try {
    await $fetch(`/api/pes/bank-direct-debit-bulk/${bulkToMarkUploaded.value.id}`, {
      method: 'PATCH',
      body: { uploadedAt: new Date().toISOString() },
    });
    bulkToMarkUploaded.value = null;
    await loadItems();
    toast.add({ type: 'success', title: $t('pes.directDebitBulk.toast.markUploadedSuccess') });
  } catch {
    toast.add({ type: 'error', title: $t('pes.directDebitBulk.toast.markUploadedError') });
  }
};

onMounted(() => { loadItems(); });
</script>
