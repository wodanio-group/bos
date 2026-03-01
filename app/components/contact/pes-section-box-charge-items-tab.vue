<template>

  <div>

    <div class="flex flex-col py-2">
      <div
        v-if="filteredAndSortedCis.length === 0"
        class="w-full flex items-center justify-center h-20">
        <p class="text-center text-secondary-700 text-sm">{{ $t('general.noItemsFound') }}</p>
      </div>
      <div
        v-for="ci in filteredAndSortedCis"
        :key="ci.id"
        class="flex flex-col gap-2 px-4 py-3 border-b border-b-secondary-200 last:border-b-0">
        <div class="flex items-center justify-between gap-2">
          <span
            v-if="!ci.chargeId"
            class="text-xs font-medium text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
            {{ $t('company.pes.chargeItems.unassigned') }}
          </span>
          <span v-else class="text-xs font-medium text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
            {{ $t('company.pes.chargeItems.assigned') }}
          </span>
          <div v-if="hasPesInteractRight || hasPesDeleteRight" class="flex gap-1">
            <atom-button
              v-if="hasPesInteractRight"
              type="button"
              icon="pencil"
              :title="$t('company.pes.chargeItems.edit')"
              :outline="true"
              @click="openEditCi(ci)">
            </atom-button>
            <atom-button
              v-if="hasPesDeleteRight"
              type="button"
              icon="trash"
              :title="$t('general.delete')"
              :outline="true"
              @click="ciToDelete = ci">
            </atom-button>
          </div>
        </div>
        <div class="w-full flex items-center justify-between gap-2">
          <span class="text-xs font-semibold text-secondary-600">{{ $t('company.pes.chargeItems.title') }}</span>
          <span class="text-sm text-right">{{ ci.title }}</span>
        </div>
        <div v-if="ci.description" class="w-full flex items-center justify-between gap-2">
          <span class="text-xs font-semibold text-secondary-600">{{ $t('company.pes.chargeItems.description') }}</span>
          <span class="text-sm text-right">{{ ci.description }}</span>
        </div>
        <div class="w-full flex items-center justify-between gap-2">
          <span class="text-xs font-semibold text-secondary-600">{{ $t('company.pes.chargeItems.serviceDate') }}</span>
          <span class="text-sm text-right">
            {{ formatDate(ci.serviceDate) }}<span v-if="ci.serviceDateTo"> – {{ formatDate(ci.serviceDateTo) }}</span>
          </span>
        </div>
        <div class="w-full flex items-center justify-between gap-2">
          <span class="text-xs font-semibold text-secondary-600">{{ $t('company.pes.chargeItems.quantity') }}</span>
          <span class="text-sm text-right">{{ ci.quantity }}x <span v-if="ci.unit"> {{ ci.unit }}</span></span>
        </div>
        <div class="w-full flex items-center justify-between gap-2">
          <span class="text-xs font-semibold text-secondary-600">{{ $t('company.pes.chargeItems.price') }}</span>
          <span class="text-sm text-right">{{ formatCurrency(ci.price) }}</span>
        </div>
        <div class="w-full flex items-center justify-between gap-2">
          <span class="text-xs font-semibold text-secondary-600">{{ $t('company.pes.chargeItems.taxRate') }}</span>
          <span class="text-sm text-right">{{ (ci.taxRate * 100).toFixed(0) }} %</span>
        </div>
        <div class="w-full flex items-center justify-between gap-2">
          <span class="text-xs font-semibold text-secondary-600">{{ $t('company.pes.chargeItems.total') }}</span>
          <span class="text-sm text-right font-medium">{{ formatCurrency(ci.total) }}</span>
        </div>
      </div>
    </div>

    <!-- Charge item create dialog -->
    <Dialog
      :open="showCreateCiDialog"
      @update:open="showCreateCiDialog = $event">
      <template #headerLeft>
        <p class="text-lg">{{ $t('company.pes.chargeItems.createDialog.title') }}</p>
      </template>
      <div class="flex flex-col gap-4 py-2">
        <div class="flex flex-col gap-1">
          <atom-input
            type="text"
            :required="true"
            :title="$t('company.pes.chargeItems.title')"
            v-model="newCiTitle">
          </atom-input>
          <p v-if="showCiCreateErrors && ciCreateErrors.title" class="text-xs text-red-500">{{ $t('general.validation.required') }}</p>
        </div>
        <atom-textarea
          :title="$t('company.pes.chargeItems.description')"
          v-model="newCiDescription">
        </atom-textarea>
        <div class="grid grid-cols-2 gap-4">
          <div class="flex flex-col gap-1">
            <atom-input
              type="date"
              :required="true"
              :title="$t('company.pes.chargeItems.serviceDate')"
              v-model="newCiServiceDate">
            </atom-input>
            <p v-if="showCiCreateErrors && ciCreateErrors.serviceDate" class="text-xs text-red-500">{{ $t('general.validation.required') }}</p>
          </div>
          <atom-input
            type="date"
            :title="$t('company.pes.chargeItems.serviceDateTo')"
            v-model="newCiServiceDateTo">
          </atom-input>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div class="flex flex-col gap-1">
            <atom-input
              type="text"
              :required="true"
              :title="$t('company.pes.chargeItems.price')"
              v-model="newCiPrice">
            </atom-input>
            <p v-if="showCiCreateErrors && ciCreateErrors.price" class="text-xs text-red-500">{{ $t('general.validation.invalidNumber') }}</p>
          </div>
          <molecular-select-tax-rate
            :title="$t('company.pes.chargeItems.taxRate')"
            v-model="newCiTaxRate">
          </molecular-select-tax-rate>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div class="flex flex-col gap-1">
            <atom-input
              type="text"
              :required="true"
              :title="$t('company.pes.chargeItems.quantity')"
              v-model="newCiQuantity">
            </atom-input>
            <p v-if="showCiCreateErrors && ciCreateErrors.quantity" class="text-xs text-red-500">{{ $t('general.validation.mustBePositive') }}</p>
          </div>
          <molecular-select-unit
            :title="$t('company.pes.chargeItems.unit')"
            v-model="newCiUnit">
          </molecular-select-unit>
        </div>
        <div class="border-t border-secondary-200 pt-3 flex flex-col gap-1">
          <div class="w-full flex items-center justify-between gap-2">
            <span class="text-xs font-semibold text-secondary-600">{{ $t('company.pes.preview.subtotal') }}</span>
            <span class="text-sm text-right">{{ formatCurrency(ciCreatePreviewSubtotal) }}</span>
          </div>
          <div class="w-full flex items-center justify-between gap-2">
            <span class="text-xs font-semibold text-secondary-600">{{ $t('company.pes.preview.total') }}</span>
            <span class="text-sm text-right font-medium">{{ formatCurrency(ciCreatePreviewTotal) }}</span>
          </div>
        </div>
      </div>
      <template #buttons>
        <atom-button
          type="button"
          icon="plus"
          :title="$t('company.pes.chargeItems.createDialog.submit')"
          @click="onCreateCi">
        </atom-button>
      </template>
    </Dialog>

    <!-- Charge item edit dialog -->
    <Dialog
      :open="ciToEdit !== null"
      @update:open="ciToEdit = $event ? ciToEdit : null">
      <template #headerLeft>
        <p class="text-lg">{{ $t('company.pes.chargeItems.editDialog.title') }}</p>
      </template>
      <div class="flex flex-col gap-4 py-2">
        <div class="flex flex-col gap-1">
          <atom-input
            type="text"
            :required="true"
            :title="$t('company.pes.chargeItems.title')"
            v-model="editCiTitle">
          </atom-input>
          <p v-if="showCiEditErrors && ciEditErrors.title" class="text-xs text-red-500">{{ $t('general.validation.required') }}</p>
        </div>
        <atom-textarea
          :title="$t('company.pes.chargeItems.description')"
          v-model="editCiDescription">
        </atom-textarea>
        <div class="flex flex-col gap-1">
          <atom-input
            type="date"
            :required="true"
            :title="$t('company.pes.chargeItems.serviceDate')"
            v-model="editCiServiceDate">
          </atom-input>
          <p v-if="showCiEditErrors && ciEditErrors.serviceDate" class="text-xs text-red-500">{{ $t('general.validation.required') }}</p>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div class="flex flex-col gap-1">
            <atom-input
              type="text"
              :required="true"
              :title="$t('company.pes.chargeItems.price')"
              v-model="editCiPrice">
            </atom-input>
            <p v-if="showCiEditErrors && ciEditErrors.price" class="text-xs text-red-500">{{ $t('general.validation.invalidNumber') }}</p>
          </div>
          <molecular-select-tax-rate
            :title="$t('company.pes.chargeItems.taxRate')"
            v-model="editCiTaxRate">
          </molecular-select-tax-rate>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div class="flex flex-col gap-1">
            <atom-input
              type="text"
              :required="true"
              :title="$t('company.pes.chargeItems.quantity')"
              v-model="editCiQuantity">
            </atom-input>
            <p v-if="showCiEditErrors && ciEditErrors.quantity" class="text-xs text-red-500">{{ $t('general.validation.mustBePositive') }}</p>
          </div>
          <molecular-select-unit
            :title="$t('company.pes.chargeItems.unit')"
            v-model="editCiUnit">
          </molecular-select-unit>
        </div>
        <div class="border-t border-secondary-200 pt-3 flex flex-col gap-1">
          <div class="w-full flex items-center justify-between gap-2">
            <span class="text-xs font-semibold text-secondary-600">{{ $t('company.pes.preview.subtotal') }}</span>
            <span class="text-sm text-right">{{ formatCurrency(ciEditPreviewSubtotal) }}</span>
          </div>
          <div class="w-full flex items-center justify-between gap-2">
            <span class="text-xs font-semibold text-secondary-600">{{ $t('company.pes.preview.total') }}</span>
            <span class="text-sm text-right font-medium">{{ formatCurrency(ciEditPreviewTotal) }}</span>
          </div>
        </div>
      </div>
      <template #buttons>
        <atom-button
          type="button"
          icon="save"
          :title="$t('company.pes.chargeItems.editDialog.submit')"
          @click="onEditCi">
        </atom-button>
      </template>
    </Dialog>

    <!-- Charge item delete dialog -->
    <SimpleAlertDialog
      :open="ciToDelete !== null"
      :title="$t('company.pes.chargeItems.deleteDialog.title')"
      :description="$t('company.pes.chargeItems.deleteDialog.description')"
      :submitButtonTitle="$t('general.delete')"
      submitButtonIcon="trash"
      @submit="onDeleteCi"
      @cancel="ciToDelete = null"
      @update:open="ciToDelete = $event ? ciToDelete : null">
    </SimpleAlertDialog>

  </div>

</template>

<script setup lang="ts">
import { DateTime } from 'luxon';
import { formatCurrency } from '~~/shared/utils/default';

type ChargeItem = {
  id: string;
  createdAt: string;
  title: string;
  description: string | null;
  serviceDate: string;
  serviceDateTo: string | null;
  quantity: number;
  price: number;
  unit: string | null;
  taxRate: number;
  subtotal: number;
  tax: number;
  total: number;
  customerId: string;
  chargeId: string | null;
};

const props = defineProps<{
  pesCustomer: { id: string };
  hasPesInteractRight: boolean;
  hasPesDeleteRight: boolean;
  search: string;
  statusFilter: 'all' | 'unassigned' | 'assigned';
}>();

const toast = useToast();
const { item: taxRatesOptionItem, loadItem: loadTaxRatesOption } = useOption('SYSTEM_TAX_RATES');
const { item: unitsOptionItem, loadItem: loadUnitsOption } = useOption('SYSTEM_UNITS');

const chargeItems = ref<ChargeItem[]>([]);

const filteredAndSortedCis = computed(() => {
  const q = props.search.trim().toLowerCase();
  return chargeItems.value
    .filter(ci => {
      if (q && !ci.title.toLowerCase().includes(q) && !(ci.description ?? '').toLowerCase().includes(q)) return false;
      if (props.statusFilter === 'unassigned') return !ci.chargeId;
      if (props.statusFilter === 'assigned') return !!ci.chargeId;
      return true;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
});

const showCreateCiDialog = ref(false);
const ciToEdit = ref<ChargeItem | null>(null);
const ciToDelete = ref<ChargeItem | null>(null);

const newCiTitle = ref('');
const newCiDescription = ref('');
const newCiServiceDate = ref(new Date().toISOString().split('T')[0]);
const newCiServiceDateTo = ref('');
const newCiQuantity = ref('1');
const newCiPrice = ref('');
const newCiUnit = ref<string | undefined>(undefined);
const newCiTaxRate = ref<number | undefined>(undefined);

const editCiTitle = ref('');
const editCiDescription = ref('');
const editCiServiceDate = ref('');
const editCiQuantity = ref('');
const editCiPrice = ref('');
const editCiUnit = ref<string | undefined>(undefined);
const editCiTaxRate = ref<number | undefined>(undefined);

const showCiCreateErrors = ref(false);
const showCiEditErrors = ref(false);

watch(showCreateCiDialog, (open) => { if (!open) showCiCreateErrors.value = false; });
watch(ciToEdit, (val) => { if (!val) showCiEditErrors.value = false; });

const defaultTaxRate = computed(() =>
  (taxRatesOptionItem.value?.value as { default?: number } | null | undefined)?.default
);
const defaultUnit = computed(() =>
  (unitsOptionItem.value?.value as { default?: string } | null | undefined)?.default ?? ''
);

const ciCreateErrors = computed(() => ({
  title: !newCiTitle.value.trim(),
  serviceDate: !newCiServiceDate.value,
  price: !Number.isFinite(parseFloat(String(newCiPrice.value))),
  quantity: !Number.isFinite(parseFloat(String(newCiQuantity.value))) || parseFloat(String(newCiQuantity.value)) <= 0,
}));
const ciCreateIsValid = computed(() => !Object.values(ciCreateErrors.value).some(Boolean));

const ciEditErrors = computed(() => ({
  title: !editCiTitle.value.trim(),
  serviceDate: !editCiServiceDate.value,
  price: !Number.isFinite(parseFloat(String(editCiPrice.value))),
  quantity: !Number.isFinite(parseFloat(String(editCiQuantity.value))) || parseFloat(String(editCiQuantity.value)) <= 0,
}));
const ciEditIsValid = computed(() => !Object.values(ciEditErrors.value).some(Boolean));

const ciCreatePreviewSubtotal = computed(() => {
  const qty = parseFloat(String(newCiQuantity.value)) || 0;
  const price = parseFloat(String(newCiPrice.value)) || 0;
  return qty * price;
});
const ciCreatePreviewTotal = computed(() =>
  ciCreatePreviewSubtotal.value * (1 + (newCiTaxRate.value ?? 0))
);
const ciEditPreviewSubtotal = computed(() => {
  const qty = parseFloat(String(editCiQuantity.value)) || 0;
  const price = parseFloat(String(editCiPrice.value)) || 0;
  return qty * price;
});
const ciEditPreviewTotal = computed(() =>
  ciEditPreviewSubtotal.value * (1 + (editCiTaxRate.value ?? 0))
);

const formatDate = (isoStr: string) =>
  DateTime.fromISO(isoStr).toFormat($t('format.date'));

const loadChargeItems = async () => {
  const result = await $fetch<{ items: ChargeItem[] }>('/api/pes/charge-item', {
    query: { customerId: props.pesCustomer.id, take: 999999 },
  });
  chargeItems.value = result.items;
};

onMounted(() => {
  loadChargeItems();
  loadTaxRatesOption();
  loadUnitsOption();
});

const openEditCi = (ci: ChargeItem) => {
  editCiTitle.value = ci.title;
  editCiDescription.value = ci.description ?? '';
  editCiServiceDate.value = ci.serviceDate.split('T')[0] ?? '';
  editCiQuantity.value = String(ci.quantity);
  editCiPrice.value = String(ci.price);
  editCiUnit.value = ci.unit ?? undefined;
  editCiTaxRate.value = ci.taxRate;
  ciToEdit.value = ci;
};

const onCreateCi = async () => {
  showCiCreateErrors.value = true;
  if (!ciCreateIsValid.value) return;
  try {
    await $fetch('/api/pes/charge-item', {
      method: 'POST',
      body: {
        customerId: props.pesCustomer.id,
        title: newCiTitle.value,
        description: newCiDescription.value || undefined,
        serviceDate: newCiServiceDate.value ? new Date(String(newCiServiceDate.value)).toISOString() : undefined,
        serviceDateTo: newCiServiceDateTo.value ? new Date(String(newCiServiceDateTo.value)).toISOString() : undefined,
        quantity: parseFloat(String(newCiQuantity.value)),
        price: parseFloat(String(newCiPrice.value)),
        unit: newCiUnit.value || undefined,
        taxRate: newCiTaxRate.value ?? 0,
      },
    });
    showCreateCiDialog.value = false;
    newCiTitle.value = '';
    newCiDescription.value = '';
    newCiServiceDate.value = new Date().toISOString().split('T')[0];
    newCiServiceDateTo.value = '';
    newCiQuantity.value = '1';
    newCiPrice.value = '';
    newCiUnit.value = defaultUnit.value;
    newCiTaxRate.value = defaultTaxRate.value;
    await loadChargeItems();
    toast.add({ type: 'success', title: $t('company.pes.chargeItems.toast.createSuccess') });
  } catch {
    toast.add({ type: 'error', title: $t('company.pes.chargeItems.toast.createError') });
  }
};

const onEditCi = async () => {
  showCiEditErrors.value = true;
  if (!ciEditIsValid.value || !ciToEdit.value) return;
  try {
    await $fetch(`/api/pes/charge-item/${ciToEdit.value.id}`, {
      method: 'PATCH',
      body: {
        title: editCiTitle.value || undefined,
        description: editCiDescription.value || undefined,
        serviceDate: editCiServiceDate.value ? new Date(String(editCiServiceDate.value)).toISOString() : undefined,
        quantity: parseFloat(String(editCiQuantity.value)),
        price: parseFloat(String(editCiPrice.value)),
        unit: editCiUnit.value || undefined,
        taxRate: editCiTaxRate.value ?? 0,
      },
    });
    ciToEdit.value = null;
    await loadChargeItems();
    toast.add({ type: 'success', title: $t('company.pes.chargeItems.toast.editSuccess') });
  } catch {
    toast.add({ type: 'error', title: $t('company.pes.chargeItems.toast.editError') });
  }
};

const onDeleteCi = async () => {
  if (!ciToDelete.value) return;
  try {
    await $fetch(`/api/pes/charge-item/${ciToDelete.value.id}`, {
      method: 'DELETE',
    });
    ciToDelete.value = null;
    await loadChargeItems();
    toast.add({ type: 'success', title: $t('company.pes.chargeItems.toast.deleteSuccess') });
  } catch {
    toast.add({ type: 'error', title: $t('company.pes.chargeItems.toast.deleteError') });
  }
};

defineExpose({
  reload: loadChargeItems,
  triggerCreate: () => { showCreateCiDialog.value = true; },
});
</script>
