<template>

  <PageSectionBox class="col-span-12">
      <template #headerLeft>
        <div class="flex items-center gap-2">
          <input
            type="text"
            :placeholder="$t('pes.charges.searchPlaceholder')"
            class="px-3 py-1.5 text-sm border border-secondary-200 rounded-lg"
            v-model="chargeNumberSearch"
            @input="onSearch"/>
          <select
            class="px-3 py-1.5 text-sm border border-secondary-200 rounded-lg"
            v-model="paymentStatusFilter"
            @change="onFilterChange">
            <option value="">{{ $t('pes.charges.filter.all') }}</option>
            <option value="paid">{{ $t('pes.charges.filter.paid') }}</option>
            <option value="unpaid">{{ $t('pes.charges.filter.unpaid') }}</option>
          </select>
        </div>
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
            <th class="px-4 py-2 text-left text-xs font-semibold text-secondary-500">{{ $t('pes.charges.fields.chargeNumber') }}</th>
            <th class="px-4 py-2 text-left text-xs font-semibold text-secondary-500">{{ $t('pes.charges.fields.type') }}</th>
            <th class="px-4 py-2 text-left text-xs font-semibold text-secondary-500">{{ $t('pes.charges.fields.serviceDate') }}</th>
            <th class="px-4 py-2 text-left text-xs font-semibold text-secondary-500">{{ $t('pes.charges.fields.documentDate') }}</th>
            <th class="px-4 py-2 text-left text-xs font-semibold text-secondary-500">{{ $t('pes.charges.fields.total') }}</th>
            <th class="px-4 py-2 text-left text-xs font-semibold text-secondary-500">{{ $t('pes.charges.fields.status') }}</th>
            <th class="px-4 py-2"></th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="charge in items"
            :key="charge.id"
            class="border-b border-secondary-100 last:border-b-0 hover:bg-secondary-50">
            <td class="px-4 py-2 font-medium">{{ charge.chargeNumber }}</td>
            <td class="px-4 py-2">
              <span class="text-xs font-medium px-2 py-0.5 rounded-full bg-secondary-100 text-secondary-700">
                {{ $t(`pes.charges.types.${charge.type}`) }}
              </span>
            </td>
            <td class="px-4 py-2 text-secondary-600">
              {{ charge.serviceDate ? formatDate(charge.serviceDate) : '-' }}
              <span v-if="charge.serviceDateTo"> – {{ formatDate(charge.serviceDateTo) }}</span>
            </td>
            <td class="px-4 py-2 text-secondary-600">{{ charge.documentGeneratedAt ? formatDate(charge.documentGeneratedAt) : '-' }}</td>
            <td class="px-4 py-2 font-medium">{{ formatCurrency(charge.total) }}</td>
            <td class="px-4 py-2">
              <span
                v-if="isChargePaid(charge)"
                class="text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                {{ $t('pes.charges.status.paid') }}
              </span>
              <span v-else class="text-xs font-medium text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                {{ $t('pes.charges.status.unpaid') }}
              </span>
            </td>
            <td class="px-4 py-2">
              <div class="flex items-center justify-end gap-1">
                <atom-button
                  v-if="hasPesInteractRight && !isChargePaid(charge)"
                  type="button"
                  icon="circle-check"
                  :title="$t('pes.charges.setPaid.button')"
                  :outline="true"
                  @click="openSetPaid(charge)">
                </atom-button>
                <atom-button
                  v-if="charge.url"
                  type="link"
                  :href="charge.url"
                  target="_blank"
                  :title="$t('pes.charges.pdf')"
                  icon="file-text"
                  :outline="true">
                </atom-button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="flex items-center justify-between px-4 py-3 border-t border-secondary-100">
        <span class="text-xs text-secondary-500">{{ totalItems }} {{ $t('pes.charges.title') }}</span>
        <Pagination
          :isFirst="page <= 1"
          :isLast="items.length < take"
          :state="{ take, page }"
          @update:state="s => { page = s.page; loadItems(); }"/>
      </div>
    </PageSectionBox>

    <!-- Mark as paid dialog -->
    <Dialog
      :open="chargeToSetPaid !== null"
      @update:open="chargeToSetPaid = $event ? chargeToSetPaid : null">
      <template #headerLeft>
        <p class="text-lg">{{ $t('pes.charges.setPaid.dialogTitle') }}</p>
      </template>
      <div class="flex flex-col gap-4 py-2">
        <p class="text-sm text-secondary-600">{{ $t('pes.charges.setPaid.dialogDescription') }}</p>
        <atom-input
          type="date"
          :title="$t('pes.charges.setPaid.paidAt')"
          v-model="paidAtDate">
        </atom-input>
      </div>
      <template #buttons>
        <atom-button
          type="button"
          icon="circle-check"
          :title="$t('pes.charges.setPaid.submit')"
          @click="onSetManuallyPaid">
        </atom-button>
      </template>
    </Dialog>

</template>

<script setup lang="ts">
import { DateTime } from 'luxon';
import { formatCurrency } from '~~/shared/utils/default';

type Charge = {
  id: string;
  chargeNumber: string;
  type: 'INVOICE' | 'CREDIT_NOTE';
  serviceDate: string | null;
  serviceDateTo: string | null;
  subtotal: number;
  tax: number;
  total: number;
  url: string | null;
  manuallyPaidAt: string | null;
  documentGeneratedAt: string | null;
  customerId: string;
};

type BankDirectDebit = {
  id: string;
  chargeId: string;
  bankDirectDebitBulkId: string | null;
  failedAt: string | null;
};

type BankTransfer = {
  id: string;
  chargeId: string;
  bankTransferBulkId: string | null;
  failedAt: string | null;
};

type BankDirectDebitBulk = {
  id: string;
  uploadedAt: string | null;
};

type BankTransferBulk = {
  id: string;
  uploadedAt: string | null;
};

const auth = useAuth();
const user = await auth.getUser();
const toast = useToast();

const hasPesInteractRight = computed(() => user?.rights.includes('pes.interact') === true);

const items = ref<Charge[]>([]);
const totalItems = ref(0);
const page = ref(1);
const take = 20;
const loading = ref(true);
const chargeNumberSearch = ref('');
const paymentStatusFilter = ref<'paid' | 'unpaid' | ''>('');
const bankDirectDebits = ref<BankDirectDebit[]>([]);
const bankTransfers = ref<BankTransfer[]>([]);
const bankDirectDebitBulks = ref<BankDirectDebitBulk[]>([]);
const bankTransferBulks = ref<BankTransferBulk[]>([]);

let searchDebounce: ReturnType<typeof setTimeout> | null = null;

const formatDate = (isoStr: string) =>
  DateTime.fromISO(isoStr).toFormat($t('format.date'));

const loadItems = async () => {
  loading.value = true;
  try {
    const chargesResult = await $fetch<{ items: Charge[]; totalItems: number }>('/api/pes/charge', {
      query: {
        take,
        page: page.value,
        order: 'DESC',
        ...(chargeNumberSearch.value ? { chargeNumber: chargeNumberSearch.value } : {}),
        ...(paymentStatusFilter.value ? { paymentStatus: paymentStatusFilter.value } : {}),
      },
    });
    items.value = chargesResult.items;
    totalItems.value = chargesResult.totalItems;
  } catch (e) {
    console.error('Failed to load charges', e);
    toast.add({ type: 'error', title: $t('general.loadError') });
  } finally {
    loading.value = false;
  }

  const [debitsResult, transfersResult, debitBulksResult, transferBulksResult] = await Promise.allSettled([
    $fetch<{ items: BankDirectDebit[] }>('/api/pes/bank-direct-debit', { query: { take: 999999 } }),
    $fetch<{ items: BankTransfer[] }>('/api/pes/bank-transfer', { query: { take: 999999 } }),
    $fetch<{ items: BankDirectDebitBulk[] }>('/api/pes/bank-direct-debit-bulk', { query: { take: 999999 } }),
    $fetch<{ items: BankTransferBulk[] }>('/api/pes/bank-transfer-bulk', { query: { take: 999999 } }),
  ]);
  if (debitsResult.status === 'fulfilled') bankDirectDebits.value = debitsResult.value.items;
  if (transfersResult.status === 'fulfilled') bankTransfers.value = transfersResult.value.items;
  if (debitBulksResult.status === 'fulfilled') bankDirectDebitBulks.value = debitBulksResult.value.items;
  if (transferBulksResult.status === 'fulfilled') bankTransferBulks.value = transferBulksResult.value.items;
};

const isChargePaid = (charge: Charge) => {
  if (charge.manuallyPaidAt) return true;
  if (bankDirectDebits.value.some(d =>
    d.chargeId === charge.id &&
    d.failedAt === null &&
    d.bankDirectDebitBulkId !== null &&
    bankDirectDebitBulks.value.some(b => b.id === d.bankDirectDebitBulkId && b.uploadedAt !== null)
  )) return true;
  if (bankTransfers.value.some(t =>
    t.chargeId === charge.id &&
    t.failedAt === null &&
    t.bankTransferBulkId !== null &&
    bankTransferBulks.value.some(b => b.id === t.bankTransferBulkId && b.uploadedAt !== null)
  )) return true;
  return false;
};

const onSearch = () => {
  if (searchDebounce) clearTimeout(searchDebounce);
  searchDebounce = setTimeout(() => {
    page.value = 1;
    loadItems();
  }, 400);
};

const onFilterChange = () => {
  page.value = 1;
  loadItems();
};

// Set paid dialog
const chargeToSetPaid = ref<Charge | null>(null);
const paidAtDate = ref(new Date().toISOString().split('T')[0]);

const openSetPaid = (charge: Charge) => {
  paidAtDate.value = new Date().toISOString().split('T')[0];
  chargeToSetPaid.value = charge;
};

const onSetManuallyPaid = async () => {
  if (!chargeToSetPaid.value) return;
  try {
    await $fetch(`/api/pes/charge/${chargeToSetPaid.value.id}`, {
      method: 'PATCH',
      body: {
        manuallyPaidAt: paidAtDate.value
          ? new Date(String(paidAtDate.value)).toISOString()
          : new Date().toISOString(),
      },
    });
    chargeToSetPaid.value = null;
    await loadItems();
    toast.add({ type: 'success', title: $t('pes.charges.toast.setPaidSuccess') });
  } catch {
    toast.add({ type: 'error', title: $t('pes.charges.toast.setPaidError') });
  }
};

onMounted(() => { loadItems(); });
</script>
