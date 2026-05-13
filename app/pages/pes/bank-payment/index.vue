<template>

  <PageSectionBox class="col-span-12">
      <template #headerLeft>
        <input
          type="text"
          :placeholder="$t('pes.payment.searchPlaceholder')"
          class="px-3 py-1.5 text-sm border border-secondary-200 rounded-lg"
          v-model="search"/>
        <select
          class="px-3 py-1.5 text-sm border border-secondary-200 rounded-lg"
          v-model="typeFilter">
          <option value="all">{{ $t('pes.payment.filter.allTypes') }}</option>
          <option value="directDebit">{{ $t('pes.payment.type.directDebit') }}</option>
          <option value="transfer">{{ $t('pes.payment.type.transfer') }}</option>
        </select>
        <select
          class="px-3 py-1.5 text-sm border border-secondary-200 rounded-lg"
          v-model="statusFilter">
          <option value="all">{{ $t('pes.payment.filter.allStatuses') }}</option>
          <option value="ok">{{ $t('pes.payment.status.ok') }}</option>
          <option value="failed">{{ $t('pes.payment.status.failed') }}</option>
        </select>
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
            <th class="px-4 py-2 text-left text-xs font-semibold text-secondary-500">{{ $t('pes.payment.fields.type') }}</th>
            <th class="px-4 py-2 text-left text-xs font-semibold text-secondary-500">{{ $t('pes.payment.fields.endToEndId') }}</th>
            <th class="px-4 py-2 text-left text-xs font-semibold text-secondary-500">{{ $t('pes.payment.fields.amount') }}</th>
            <th class="px-4 py-2 text-left text-xs font-semibold text-secondary-500">{{ $t('pes.payment.fields.createdAt') }}</th>
            <th class="px-4 py-2 text-left text-xs font-semibold text-secondary-500">{{ $t('pes.payment.fields.status') }}</th>
            <th class="px-4 py-2"></th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="item in filteredItems"
            :key="`${item.type}-${item.id}`"
            class="border-b border-secondary-100 last:border-b-0 hover:bg-secondary-50">
            <td class="px-4 py-2">
              <span
                v-if="item.type === 'directDebit'"
                class="text-xs font-medium text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                {{ $t('pes.payment.type.directDebit') }}
              </span>
              <span
                v-else
                class="text-xs font-medium text-violet-700 bg-violet-100 px-2 py-0.5 rounded-full">
                {{ $t('pes.payment.type.transfer') }}
              </span>
            </td>
            <td class="px-4 py-2 font-mono text-xs text-secondary-600">{{ item.endToEndId }}</td>
            <td class="px-4 py-2 text-secondary-800">{{ formatCurrency(item.amount) }}</td>
            <td class="px-4 py-2 text-secondary-600">{{ formatDate(item.createdAt) }}</td>
            <td class="px-4 py-2">
              <span
                v-if="item.failedAt"
                class="text-xs font-medium text-red-700 bg-red-100 px-2 py-0.5 rounded-full"
                :title="item.failedMessage ?? undefined">
                {{ $t('pes.payment.status.failed') }}
              </span>
              <span v-else class="text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                {{ $t('pes.payment.status.ok') }}
              </span>
            </td>
            <td class="px-4 py-2">
              <div class="flex items-center justify-end gap-1">
                <atom-button
                  v-if="hasPesInteractRight && !item.failedAt"
                  type="button"
                  icon="circle-x"
                  :title="$t('pes.payment.setFailed')"
                  :outline="true"
                  @click="openSetFailed(item)">
                </atom-button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="flex items-center justify-between px-4 py-3 border-t border-secondary-100">
        <span class="text-xs text-secondary-500">
          {{ directDebitTotalItems }} {{ $t('pes.payment.type.directDebit') }} &middot; {{ transferTotalItems }} {{ $t('pes.payment.type.transfer') }}
        </span>
        <Pagination
          :isFirst="page <= 1"
          :isLast="isLastPage"
          :state="{ take, page }"
          @update:state="s => { page = s.page; loadItems(); }"/>
      </div>
    </PageSectionBox>

    <!-- Set failed dialog -->
    <Dialog
      :open="itemToSetFailed !== null"
      @update:open="itemToSetFailed = $event ? itemToSetFailed : null">
      <template #headerLeft>
        <p class="text-lg">{{ $t('pes.payment.setFailedDialog.title') }}</p>
      </template>
      <div class="flex flex-col gap-4 py-2">
        <atom-input
          type="date"
          :title="$t('pes.payment.setFailedDialog.failedAt')"
          v-model="newFailedAt">
        </atom-input>
        <label class="w-full flex flex-col gap-1">
          <span class="text-xs text-gray-600 font-semibold">{{ $t('pes.payment.setFailedDialog.failedMessage') }}</span>
          <textarea
            v-model="newFailedMessage"
            rows="3"
            class="w-full px-4 py-1.5 text-sm text-primary-950 border border-secondary-200 rounded-lg shadow shadow-gray-100 focus:border-gray-500 focus:outline-none focus:ring-0 resize-none">
          </textarea>
        </label>
      </div>
      <template #buttons>
        <atom-button
          type="button"
          icon="circle-x"
          :title="$t('pes.payment.setFailedDialog.submit')"
          @click="onSetFailed">
        </atom-button>
      </template>
    </Dialog>

</template>

<script setup lang="ts">
import { DateTime } from 'luxon';
import { formatCurrency } from '~~/shared/utils/default';

type PaymentItem = {
  id: string;
  type: 'directDebit' | 'transfer';
  endToEndId: string;
  amount: number;
  createdAt: string;
  failedAt: string | null;
  failedMessage: string | null;
};

const auth = useAuth();
const user = await auth.getUser();
const toast = useToast();

const hasPesInteractRight = computed(() => user?.rights.includes('pes.interact') === true);

const allItems = ref<PaymentItem[]>([]);
const directDebitTotalItems = ref(0);
const transferTotalItems = ref(0);
const page = ref(1);
const take = 50;
const isLastPage = ref(false);
const loading = ref(true);
const search = ref('');
const typeFilter = ref<'all' | 'directDebit' | 'transfer'>('all');
const statusFilter = ref<'all' | 'ok' | 'failed'>('all');
const itemToSetFailed = ref<PaymentItem | null>(null);
const newFailedAt = ref('');
const newFailedMessage = ref('');

const formatDate = (isoStr: string) =>
  DateTime.fromISO(isoStr).toFormat($t('format.date'));

const filteredItems = computed(() => {
  let items = allItems.value;
  const q = search.value.trim().toLowerCase();
  if (q) items = items.filter(i => i.endToEndId.toLowerCase().includes(q));
  if (typeFilter.value !== 'all') items = items.filter(i => i.type === typeFilter.value);
  if (statusFilter.value === 'failed') return items.filter(i => i.failedAt !== null);
  if (statusFilter.value === 'ok') return items.filter(i => i.failedAt === null);
  return items;
});

const loadItems = async () => {
  loading.value = true;
  try {
    const [directDebitResult, transferResult] = await Promise.all([
      $fetch<{ items: Omit<PaymentItem, 'type'>[]; totalItems: number }>('/api/pes/bank-direct-debit', {
        query: { take, page: page.value, order: 'DESC' },
      }),
      $fetch<{ items: Omit<PaymentItem, 'type'>[]; totalItems: number }>('/api/pes/bank-transfer', {
        query: { take, page: page.value, order: 'DESC' },
      }),
    ]);

    directDebitTotalItems.value = directDebitResult.totalItems;
    transferTotalItems.value = transferResult.totalItems;
    isLastPage.value = directDebitResult.items.length < take && transferResult.items.length < take;

    const directDebitItems: PaymentItem[] = directDebitResult.items.map(item => ({ ...item, type: 'directDebit' }));
    const transferItems: PaymentItem[] = transferResult.items.map(item => ({ ...item, type: 'transfer' }));

    allItems.value = [...directDebitItems, ...transferItems].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  } catch (e) {
    console.error('Failed to load bank payments', e);
    toast.add({ type: 'error', title: $t('general.loadError') });
  } finally {
    loading.value = false;
  }
};

const openSetFailed = (item: PaymentItem) => {
  newFailedAt.value = new Date().toISOString().split('T')[0];
  newFailedMessage.value = '';
  itemToSetFailed.value = item;
};

const onSetFailed = async () => {
  if (!itemToSetFailed.value) return;
  const apiPath = itemToSetFailed.value.type === 'directDebit'
    ? `/api/pes/bank-direct-debit/${itemToSetFailed.value.id}`
    : `/api/pes/bank-transfer/${itemToSetFailed.value.id}`;
  try {
    await $fetch(apiPath, {
      method: 'PATCH',
      body: {
        failedAt: new Date(String(newFailedAt.value)).toISOString(),
        failedMessage: newFailedMessage.value.trim() || null,
      },
    });
    itemToSetFailed.value = null;
    await loadItems();
    toast.add({ type: 'success', title: $t('pes.payment.toast.setFailedSuccess') });
  } catch {
    toast.add({ type: 'error', title: $t('pes.payment.toast.setFailedError') });
  }
};

onMounted(() => { loadItems(); });
</script>
