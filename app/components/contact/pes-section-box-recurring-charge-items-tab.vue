<template>

  <div>

    <div class="flex flex-col py-2">
      <div
        v-if="filteredAndSortedRcis.length === 0"
        class="w-full flex items-center justify-center h-20">
        <p class="text-center text-secondary-700 text-sm">{{ $t('general.noItemsFound') }}</p>
      </div>
      <div
        v-for="rci in filteredAndSortedRcis"
        :key="rci.id"
        class="flex flex-col gap-2 px-4 py-3 border-b border-b-secondary-200 last:border-b-0">
        <div class="flex items-center justify-between gap-2">
          <span
            v-if="!rci.endAt"
            class="text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
            {{ $t('company.pes.recurringChargeItems.active') }}
          </span>
          <span
            v-else-if="new Date(rci.endAt) > new Date()"
            class="text-xs font-medium text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
            {{ $t('company.pes.recurringChargeItems.ending') }}: {{ formatDate(rci.endAt) }}
          </span>
          <span v-else class="text-xs font-medium text-secondary-500 bg-secondary-100 px-2 py-0.5 rounded-full">
            {{ $t('company.pes.recurringChargeItems.ended') }}: {{ formatDate(rci.endAt) }}
          </span>
          <div v-if="hasPesInteractRight" class="flex gap-1">
            <atom-button
              type="button"
              icon="pencil"
              :title="$t('company.pes.recurringChargeItems.edit')"
              :outline="true"
              @click="openEditRci(rci)">
            </atom-button>
            <atom-button
              type="button"
              icon="calendar-x"
              :title="$t('company.pes.recurringChargeItems.end')"
              :outline="true"
              @click="openEndRci(rci)">
            </atom-button>
          </div>
        </div>
        <div class="w-full flex items-center justify-between gap-2">
          <span class="text-xs font-semibold text-secondary-600">{{ $t('company.pes.recurringChargeItems.title') }}</span>
          <span class="text-sm text-right">{{ rci.title }}</span>
        </div>
        <div v-if="rci.description" class="w-full flex items-center justify-between gap-2">
          <span class="text-xs font-semibold text-secondary-600">{{ $t('company.pes.recurringChargeItems.description') }}</span>
          <span class="text-sm text-right">{{ rci.description }}</span>
        </div>
        <div class="w-full flex items-center justify-between gap-2">
          <span class="text-xs font-semibold text-secondary-600">{{ $t('company.pes.recurringChargeItems.period') }}</span>
          <span class="text-sm text-right">{{ rci.periodQuantity }} {{ $t(`company.pes.recurringChargeItems.periodUnits.${rci.periodUnit}`) }}</span>
        </div>
        <div class="w-full flex items-center justify-between gap-2">
          <span class="text-xs font-semibold text-secondary-600">{{ $t('company.pes.recurringChargeItems.price') }}</span>
          <span class="text-sm text-right">{{ formatCurrency(rci.price) }}<span v-if="rci.unit"></span></span>
        </div>
        <div class="w-full flex items-center justify-between gap-2">
          <span class="text-xs font-semibold text-secondary-600">{{ $t('company.pes.recurringChargeItems.quantity') }}</span>
          <span class="text-sm text-right">{{ rci.quantity }}x <span v-if="rci.unit"> {{ rci.unit }}</span></span>
        </div>
        <div class="w-full flex items-center justify-between gap-2">
          <span class="text-xs font-semibold text-secondary-600">{{ $t('company.pes.recurringChargeItems.taxRate') }}</span>
          <span class="text-sm text-right">{{ (rci.taxRate * 100).toFixed(0) }} %</span>
        </div>
        <div v-if="rci.costCenterId" class="w-full flex items-center justify-between gap-2">
          <span class="text-xs font-semibold text-secondary-600">{{ $t('company.pes.recurringChargeItems.costCenter') }}</span>
          <span class="text-sm text-right">{{ costCenterName(rci.costCenterId) ?? rci.costCenterId }}</span>
        </div>
        <div class="w-full flex items-center justify-between gap-2">
          <span class="text-xs font-semibold text-secondary-600">{{ $t('company.pes.recurringChargeItems.startAt') }}</span>
          <span class="text-sm text-right">{{ formatDate(rci.startAt) }}</span>
        </div>
        <div v-if="rci.nextAt" class="w-full flex items-center justify-between gap-2">
          <span class="text-xs font-semibold text-secondary-600">{{ $t('company.pes.recurringChargeItems.nextAt') }}</span>
          <span class="text-sm text-right">{{ formatDate(rci.nextAt) }}</span>
        </div>
      </div>
    </div>

    <!-- Recurring charge item create dialog -->
    <Dialog
      :open="showCreateRciDialog"
      @update:open="showCreateRciDialog = $event">
      <template #headerLeft>
        <p class="text-lg">{{ $t('company.pes.recurringChargeItems.createDialog.title') }}</p>
      </template>
      <div class="flex flex-col gap-4 py-2">
        <div class="flex flex-col gap-1">
          <atom-input
            type="text"
            :required="true"
            :title="$t('company.pes.recurringChargeItems.title')"
            v-model="newRciTitle">
          </atom-input>
          <p v-if="showRciCreateErrors && rciCreateErrors.title" class="text-xs text-red-500">{{ $t('general.validation.required') }}</p>
        </div>
        <atom-textarea
          :title="$t('company.pes.recurringChargeItems.description')"
          v-model="newRciDescription">
        </atom-textarea>
        <div class="grid grid-cols-2 gap-4">
          <atom-input
            type="date"
            :title="$t('company.pes.recurringChargeItems.startAt')"
            v-model="newRciStartAt">
          </atom-input>
          <atom-input
            type="date"
            :title="$t('company.pes.recurringChargeItems.endAt')"
            v-model="newRciEndAt">
          </atom-input>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div class="flex flex-col gap-1">
            <atom-input
              type="text"
              :required="true"
              :title="$t('company.pes.recurringChargeItems.quantity')"
              v-model="newRciPeriodQuantity">
            </atom-input>
            <p v-if="showRciCreateErrors && rciCreateErrors.periodQuantity" class="text-xs text-red-500">{{ $t('general.validation.mustBePositive') }}</p>
          </div>
          <atom-select
            :title="$t('company.pes.recurringChargeItems.period')"
            :items="periodUnitItems"
            v-model="newRciPeriodUnit">
          </atom-select>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div class="flex flex-col gap-1">
            <atom-input
              type="text"
              :required="true"
              :title="$t('company.pes.recurringChargeItems.price')"
              v-model="newRciPrice">
            </atom-input>
            <p v-if="showRciCreateErrors && rciCreateErrors.price" class="text-xs text-red-500">{{ $t('general.validation.invalidNumber') }}</p>
          </div>
          <molecular-select-tax-rate
            :title="$t('company.pes.recurringChargeItems.taxRate')"
            v-model="newRciTaxRate">
          </molecular-select-tax-rate>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div class="flex flex-col gap-1">
            <atom-input
              type="text"
              :required="true"
              :title="$t('company.pes.recurringChargeItems.quantity')"
              v-model="newRciQuantity">
            </atom-input>
            <p v-if="showRciCreateErrors && rciCreateErrors.quantity" class="text-xs text-red-500">{{ $t('general.validation.mustBePositive') }}</p>
          </div>
          <molecular-select-unit
            :title="$t('company.pes.recurringChargeItems.unit')"
            v-model="newRciUnit">
          </molecular-select-unit>
        </div>
        <pes-cost-center-select
          :title="$t('company.pes.recurringChargeItems.costCenter')"
          :null-label="$t('pes.costCenters.noParent')"
          v-model="newRciCostCenterId"/>
        <div class="border-t border-secondary-200 pt-3 flex flex-col gap-1">
          <div class="w-full flex items-center justify-between gap-2">
            <span class="text-xs font-semibold text-secondary-600">{{ $t('company.pes.preview.subtotal') }}</span>
            <span class="text-sm text-right">{{ formatCurrency(rciCreatePreviewSubtotal) }}</span>
          </div>
          <div class="w-full flex items-center justify-between gap-2">
            <span class="text-xs font-semibold text-secondary-600">{{ $t('company.pes.preview.total') }}</span>
            <span class="text-sm text-right font-medium">{{ formatCurrency(rciCreatePreviewTotal) }}</span>
          </div>
        </div>
      </div>
      <template #buttons>
        <atom-button
          type="button"
          icon="plus"
          :title="$t('company.pes.recurringChargeItems.createDialog.submit')"
          @click="onCreateRci">
        </atom-button>
      </template>
    </Dialog>

    <!-- Recurring charge item edit dialog -->
    <Dialog
      :open="rciToEdit !== null"
      @update:open="rciToEdit = $event ? rciToEdit : null">
      <template #headerLeft>
        <p class="text-lg">{{ $t('company.pes.recurringChargeItems.editDialog.title') }}</p>
      </template>
      <div class="flex flex-col gap-4 py-2">
        <div class="flex flex-col gap-1">
          <atom-input
            type="text"
            :required="true"
            :title="$t('company.pes.recurringChargeItems.title')"
            v-model="editRciTitle">
          </atom-input>
          <p v-if="showRciEditErrors && rciEditErrors.title" class="text-xs text-red-500">{{ $t('general.validation.required') }}</p>
        </div>
        <atom-textarea
          :title="$t('company.pes.recurringChargeItems.description')"
          v-model="editRciDescription">
        </atom-textarea>
        <div class="grid grid-cols-2 gap-4">
          <div class="flex flex-col gap-1">
            <atom-input
              type="text"
              :required="true"
              :title="$t('company.pes.recurringChargeItems.price')"
              v-model="editRciPrice">
            </atom-input>
            <p v-if="showRciEditErrors && rciEditErrors.price" class="text-xs text-red-500">{{ $t('general.validation.invalidNumber') }}</p>
          </div>
          <molecular-select-tax-rate
            :title="$t('company.pes.recurringChargeItems.taxRate')"
            v-model="editRciTaxRate">
          </molecular-select-tax-rate>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div class="flex flex-col gap-1">
            <atom-input
              type="text"
              :required="true"
              :title="$t('company.pes.recurringChargeItems.quantity')"
              v-model="editRciQuantity">
            </atom-input>
            <p v-if="showRciEditErrors && rciEditErrors.quantity" class="text-xs text-red-500">{{ $t('general.validation.mustBePositive') }}</p>
          </div>
          <molecular-select-unit
            :title="$t('company.pes.recurringChargeItems.unit')"
            v-model="editRciUnit">
          </molecular-select-unit>
        </div>
        <pes-cost-center-select
          :title="$t('company.pes.recurringChargeItems.costCenter')"
          :null-label="$t('pes.costCenters.noParent')"
          v-model="editRciCostCenterId"/>
        <div class="border-t border-secondary-200 pt-3 flex flex-col gap-1">
          <div class="w-full flex items-center justify-between gap-2">
            <span class="text-xs font-semibold text-secondary-600">{{ $t('company.pes.preview.subtotal') }}</span>
            <span class="text-sm text-right">{{ formatCurrency(rciEditPreviewSubtotal) }}</span>
          </div>
          <div class="w-full flex items-center justify-between gap-2">
            <span class="text-xs font-semibold text-secondary-600">{{ $t('company.pes.preview.total') }}</span>
            <span class="text-sm text-right font-medium">{{ formatCurrency(rciEditPreviewTotal) }}</span>
          </div>
        </div>
      </div>
      <template #buttons>
        <atom-button
          type="button"
          icon="save"
          :title="$t('company.pes.recurringChargeItems.editDialog.submit')"
          @click="onEditRci">
        </atom-button>
      </template>
    </Dialog>

    <!-- Recurring charge item end dialog -->
    <Dialog
      :open="rciToEnd !== null"
      @update:open="rciToEnd = $event ? rciToEnd : null">
      <template #headerLeft>
        <p class="text-lg">{{ $t('company.pes.recurringChargeItems.endDialog.title') }}</p>
      </template>
      <div class="flex flex-col gap-4 py-2">
        <p class="text-sm text-secondary-600">{{ $t('company.pes.recurringChargeItems.endDialog.description') }}</p>
        <atom-input
          type="date"
          :title="$t('company.pes.recurringChargeItems.endDialog.endAt')"
          v-model="newRciEndAtDate">
        </atom-input>
      </div>
      <template #buttons>
        <atom-button
          type="button"
          icon="save"
          :title="$t('company.pes.recurringChargeItems.endDialog.submit')"
          @click="onEndRci">
        </atom-button>
      </template>
    </Dialog>

  </div>

</template>

<script setup lang="ts">
import { DateTime } from 'luxon';
import { formatCurrency } from '~~/shared/utils/default';

type RecurringChargeItem = {
  id: string;
  title: string;
  description: string | null;
  startAt: string;
  endAt: string | null;
  nextAt: string | null;
  periodQuantity: number;
  periodUnit: 'HOUR' | 'DAY' | 'WEEK' | 'MONTH' | 'YEAR';
  quantity: number;
  price: number;
  unit: string | null;
  taxRate: number;
  costCenterId: string | null;
  customerId: string;
};

const props = defineProps<{
  pesCustomer: { id: string };
  hasPesInteractRight: boolean;
  search: string;
  statusFilter: 'all' | 'active' | 'ending' | 'ended';
  costCenterFilter: string | null;
}>();

const toast = useToast();
const { item: taxRatesOptionItem, loadItem: loadTaxRatesOption } = useOption('SYSTEM_TAX_RATES');
const { item: unitsOptionItem, loadItem: loadUnitsOption } = useOption('SYSTEM_UNITS');

const recurringChargeItems = ref<RecurringChargeItem[]>([]);
const costCenters = ref<{ id: string; name: string }[]>([]);

const costCenterName = (id: string | null) =>
  id ? (costCenters.value.find(c => c.id === id)?.name ?? null) : null;

const filteredAndSortedRcis = computed(() => {
  const q = props.search.trim().toLowerCase();
  const now = new Date();
  const filtered = recurringChargeItems.value.filter(rci => {
    if (q && !rci.title.toLowerCase().includes(q) && !(rci.description ?? '').toLowerCase().includes(q)) return false;
    if (props.statusFilter === 'active') return !rci.endAt;
    if (props.statusFilter === 'ending') return !!rci.endAt && new Date(rci.endAt) > now;
    if (props.statusFilter === 'ended') return !!rci.endAt && new Date(rci.endAt) <= now;
    if (props.costCenterFilter) return rci.costCenterId === props.costCenterFilter;
    return true;
  });
  return [...filtered].sort((a, b) => {
    if (!a.nextAt && !b.nextAt) return 0;
    if (!a.nextAt) return 1;
    if (!b.nextAt) return -1;
    return new Date(a.nextAt).getTime() - new Date(b.nextAt).getTime();
  });
});

const showCreateRciDialog = ref(false);
const rciToEdit = ref<RecurringChargeItem | null>(null);
const rciToEnd = ref<RecurringChargeItem | null>(null);

const newRciTitle = ref('');
const newRciDescription = ref('');
const newRciStartAt = ref(new Date().toISOString().split('T')[0]);
const newRciEndAt = ref('');
const newRciPeriodQuantity = ref('1');
const newRciPeriodUnit = ref('MONTH');
const newRciPrice = ref('');
const newRciQuantity = ref('1');
const newRciUnit = ref<string | undefined>(undefined);
const newRciTaxRate = ref<number | undefined>(undefined);
const newRciCostCenterId = ref<string | null>(null);

const editRciTitle = ref('');
const editRciDescription = ref('');
const editRciQuantity = ref('');
const editRciPrice = ref('');
const editRciUnit = ref<string | undefined>(undefined);
const editRciTaxRate = ref<number | undefined>(undefined);
const editRciCostCenterId = ref<string | null>(null);
const newRciEndAtDate = ref('');

const showRciCreateErrors = ref(false);
const showRciEditErrors = ref(false);

watch(showCreateRciDialog, (open) => { if (!open) showRciCreateErrors.value = false; });
watch(rciToEdit, (val) => { if (!val) showRciEditErrors.value = false; });

const periodUnitItems = computed(() =>
  (['HOUR', 'DAY', 'WEEK', 'MONTH', 'YEAR'] as const).map(u => ({
    title: $t(`company.pes.recurringChargeItems.periodUnits.${u}`),
    value: u,
  }))
);

const defaultTaxRate = computed(() =>
  (taxRatesOptionItem.value?.value as { default?: number } | null | undefined)?.default
);
const defaultUnit = computed(() =>
  (unitsOptionItem.value?.value as { default?: string } | null | undefined)?.default ?? ''
);

const rciCreateErrors = computed(() => ({
  title: !newRciTitle.value.trim(),
  periodQuantity: !Number.isFinite(parseInt(String(newRciPeriodQuantity.value))) || parseInt(String(newRciPeriodQuantity.value)) <= 0,
  price: !Number.isFinite(parseFloat(String(newRciPrice.value))),
  quantity: !Number.isFinite(parseFloat(String(newRciQuantity.value))) || parseFloat(String(newRciQuantity.value)) <= 0,
}));
const rciCreateIsValid = computed(() => !Object.values(rciCreateErrors.value).some(Boolean));

const rciEditErrors = computed(() => ({
  title: !editRciTitle.value.trim(),
  price: !Number.isFinite(parseFloat(String(editRciPrice.value))),
  quantity: !Number.isFinite(parseFloat(String(editRciQuantity.value))) || parseFloat(String(editRciQuantity.value)) <= 0,
}));
const rciEditIsValid = computed(() => !Object.values(rciEditErrors.value).some(Boolean));

const rciCreatePreviewSubtotal = computed(() => {
  const qty = parseFloat(String(newRciQuantity.value)) || 0;
  const price = parseFloat(String(newRciPrice.value)) || 0;
  return qty * price;
});
const rciCreatePreviewTotal = computed(() =>
  rciCreatePreviewSubtotal.value * (1 + (newRciTaxRate.value ?? 0))
);
const rciEditPreviewSubtotal = computed(() => {
  const qty = parseFloat(String(editRciQuantity.value)) || 0;
  const price = parseFloat(String(editRciPrice.value)) || 0;
  return qty * price;
});
const rciEditPreviewTotal = computed(() =>
  rciEditPreviewSubtotal.value * (1 + (editRciTaxRate.value ?? 0))
);

const formatDate = (isoStr: string) =>
  DateTime.fromISO(isoStr).toFormat($t('format.date'));

const loadRecurringChargeItems = async () => {
  const result = await $fetch<{ items: RecurringChargeItem[] }>('/api/pes/recurring-charge-item', {
    query: { customerId: props.pesCustomer.id, take: 999999 },
  });
  recurringChargeItems.value = result.items;
};

const loadCostCenters = async () => {
  try {
    const result = await $fetch<{ items: { id: string; name: string }[] }>('/api/pes/cost-center', {
      query: { take: 999999 },
    });
    costCenters.value = result.items;
  } catch { /* non-critical */ }
};

onMounted(() => {
  loadRecurringChargeItems();
  loadTaxRatesOption();
  loadUnitsOption();
  loadCostCenters();
});

const openEditRci = (rci: RecurringChargeItem) => {
  editRciTitle.value = rci.title;
  editRciDescription.value = rci.description ?? '';
  editRciQuantity.value = String(rci.quantity);
  editRciPrice.value = String(rci.price);
  editRciUnit.value = rci.unit ?? undefined;
  editRciTaxRate.value = rci.taxRate;
  editRciCostCenterId.value = rci.costCenterId;
  rciToEdit.value = rci;
};

const openEndRci = (rci: RecurringChargeItem) => {
  newRciEndAtDate.value = rci.endAt ? (rci.endAt.split('T')[0] ?? '') : '';
  rciToEnd.value = rci;
};

const onCreateRci = async () => {
  showRciCreateErrors.value = true;
  if (!rciCreateIsValid.value) return;
  try {
    await $fetch('/api/pes/recurring-charge-item', {
      method: 'POST',
      body: {
        customerId: props.pesCustomer.id,
        title: newRciTitle.value,
        description: newRciDescription.value || undefined,
        startAt: newRciStartAt.value ? new Date(String(newRciStartAt.value)).toISOString() : undefined,
        endAt: newRciEndAt.value ? new Date(String(newRciEndAt.value)).toISOString() : undefined,
        periodQuantity: parseInt(String(newRciPeriodQuantity.value), 10),
        periodUnit: newRciPeriodUnit.value,
        price: parseFloat(String(newRciPrice.value)),
        quantity: parseFloat(String(newRciQuantity.value)),
        unit: newRciUnit.value || undefined,
        taxRate: newRciTaxRate.value ?? 0,
        costCenterId: newRciCostCenterId.value || undefined,
      },
    });
    showCreateRciDialog.value = false;
    newRciTitle.value = '';
    newRciDescription.value = '';
    newRciStartAt.value = new Date().toISOString().split('T')[0];
    newRciEndAt.value = '';
    newRciPeriodQuantity.value = '1';
    newRciPeriodUnit.value = 'MONTH';
    newRciPrice.value = '';
    newRciQuantity.value = '1';
    newRciUnit.value = defaultUnit.value;
    newRciTaxRate.value = defaultTaxRate.value;
    newRciCostCenterId.value = null;
    await loadRecurringChargeItems();
    toast.add({ type: 'success', title: $t('company.pes.recurringChargeItems.toast.createSuccess') });
  } catch {
    toast.add({ type: 'error', title: $t('company.pes.recurringChargeItems.toast.createError') });
  }
};

const onEditRci = async () => {
  showRciEditErrors.value = true;
  if (!rciEditIsValid.value || !rciToEdit.value) return;
  try {
    await $fetch(`/api/pes/recurring-charge-item/${rciToEdit.value.id}`, {
      method: 'PATCH',
      body: {
        title: editRciTitle.value || undefined,
        description: editRciDescription.value || undefined,
        quantity: parseFloat(String(editRciQuantity.value)),
        price: parseFloat(String(editRciPrice.value)),
        unit: editRciUnit.value || undefined,
        taxRate: editRciTaxRate.value ?? 0,
        costCenterId: editRciCostCenterId.value || undefined,
      },
    });
    rciToEdit.value = null;
    await loadRecurringChargeItems();
    toast.add({ type: 'success', title: $t('company.pes.recurringChargeItems.toast.editSuccess') });
  } catch {
    toast.add({ type: 'error', title: $t('company.pes.recurringChargeItems.toast.editError') });
  }
};

const onEndRci = async () => {
  if (!rciToEnd.value) return;
  try {
    await $fetch(`/api/pes/recurring-charge-item/${rciToEnd.value.id}/end`, {
      method: 'POST',
      body: {
        endAt: newRciEndAtDate.value ? new Date(String(newRciEndAtDate.value)).toISOString() : null,
      },
    });
    rciToEnd.value = null;
    newRciEndAtDate.value = '';
    await loadRecurringChargeItems();
    toast.add({ type: 'success', title: $t('company.pes.recurringChargeItems.toast.endSuccess') });
  } catch {
    toast.add({ type: 'error', title: $t('company.pes.recurringChargeItems.toast.endError') });
  }
};

defineExpose({
  reload: loadRecurringChargeItems,
  triggerCreate: () => { showCreateRciDialog.value = true; },
});
</script>
