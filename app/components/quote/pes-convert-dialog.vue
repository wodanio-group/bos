<template>

  <!-- Step 1: Übersicht Angebotspositionen -->
  <Dialog
    v-if="step === 'overview'"
    :open="true"
    @update:open="$emit('update:open', false)">
    <template #headerLeft>
      <p class="text-lg">{{ $t('quote.pesConvert.overviewTitle') }}</p>
    </template>

    <div class="flex flex-col divide-y divide-secondary-100">
      <div
        v-for="item in quote.quoteItems"
        :key="item.id"
        class="py-3 flex flex-col gap-2 transition-opacity"
        :class="conversionsForItem(item.id).length > 0 ? 'opacity-40' : ''"

        <!-- Position info -->
        <div class="flex flex-col gap-1">
          <span class="text-sm font-medium">{{ item.quotePosition }}. {{ item.title }}</span>
          <div class="flex items-baseline gap-3">
            <span class="text-sm">
              {{ item.quantity }} {{ item.unit || $t('quote.item.pieces') }} &times; {{ formatCurrency(item.price) }}
            </span>
            <span class="text-sm font-semibold">= {{ formatCurrency(item.subtotal) }}</span>
            <span class="text-xs text-secondary-400">({{ (item.taxRate * 100).toFixed(0) }}% MwSt.)</span>
          </div>
          <div v-if="item.description" class="mt-0.5">
            <div
              class="text-xs text-secondary-600 prose prose-xs max-w-none"
              :class="expandedItems.has(item.id) ? '' : 'line-clamp-3'"
              v-html="item.description">
            </div>
            <button
              v-if="isLongDescription(item.description)"
              type="button"
              class="text-xs text-primary-600 hover:underline mt-0.5"
              @click="toggleExpand(item.id)">
              {{ expandedItems.has(item.id) ? $t('quote.pesConvert.showLess') : $t('quote.pesConvert.showMore') }}
            </button>
          </div>
        </div>

        <!-- Existing conversions -->
        <div v-if="conversionsForItem(item.id).length > 0" class="flex flex-wrap gap-1">
          <span
            v-for="conv in conversionsForItem(item.id)"
            :key="conv.id"
            :class="conv.type === 'recurringChargeItem' ? 'bg-violet-100 text-violet-700' : 'bg-blue-100 text-blue-700'"
            class="text-xs font-medium px-2 py-0.5 rounded-full">
            {{ conv.type === 'recurringChargeItem' ? $t('quote.pesConvert.typeRecurring') : $t('quote.pesConvert.typeCharge') }}
          </span>
        </div>

        <!-- Action buttons -->
        <div v-if="conversionsForItem(item.id).length === 0" class="flex gap-2">
          <button
            type="button"
            class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-secondary-200 rounded-lg hover:bg-secondary-50 transition-colors"
            @click="openCreate(item, 'recurringChargeItem')">
            <atom-icon icon="repeat" class="!text-sm"/>
            {{ $t('quote.pesConvert.createRecurring') }}
          </button>
          <button
            type="button"
            class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-secondary-200 rounded-lg hover:bg-secondary-50 transition-colors"
            @click="openCreate(item, 'chargeItem')">
            <atom-icon icon="receipt" class="!text-sm"/>
            {{ $t('quote.pesConvert.createCharge') }}
          </button>
        </div>

      </div>
    </div>
  </Dialog>

  <!-- Step 2a: Dauerposition anlegen -->
  <Dialog
    v-else-if="step === 'createRci' && selectedItem"
    :open="true"
    @update:open="step = 'overview'">
    <template #headerLeft>
      <p class="text-lg">{{ $t('company.pes.recurringChargeItems.createDialog.title') }}</p>
    </template>
    <div class="flex flex-col gap-4 py-2">
      <p class="text-xs text-secondary-500">{{ $t('quote.pesConvert.fromItem') }}: <span class="font-medium text-primary-900">{{ selectedItem.title }}</span></p>
      <div class="flex flex-col gap-1">
        <atom-input type="text" :required="true" :title="$t('company.pes.recurringChargeItems.title')" v-model="rciForm.title"/>
        <p v-if="showErrors && !rciForm.title.trim()" class="text-xs text-red-500">{{ $t('general.validation.required') }}</p>
      </div>
      <atom-textarea :title="$t('company.pes.recurringChargeItems.description')" v-model="rciForm.description"/>
      <div class="grid grid-cols-2 gap-4">
        <atom-input type="date" :title="$t('company.pes.recurringChargeItems.startAt')" v-model="rciForm.startAt"/>
        <atom-input type="date" :title="$t('company.pes.recurringChargeItems.endAt')" v-model="rciForm.endAt"/>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div class="flex flex-col gap-1">
          <atom-input type="text" :required="true" :title="$t('company.pes.recurringChargeItems.quantity')" v-model="rciForm.periodQuantity"/>
          <p v-if="showErrors && rciFormErrors.periodQuantity" class="text-xs text-red-500">{{ $t('general.validation.mustBePositive') }}</p>
        </div>
        <atom-select :title="$t('company.pes.recurringChargeItems.period')" :items="periodUnitItems" v-model="rciForm.periodUnit"/>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div class="flex flex-col gap-1">
          <atom-input type="text" :required="true" :title="$t('company.pes.recurringChargeItems.price')" v-model="rciForm.price"/>
          <p v-if="showErrors && rciFormErrors.price" class="text-xs text-red-500">{{ $t('general.validation.invalidNumber') }}</p>
        </div>
        <molecular-select-tax-rate :title="$t('company.pes.recurringChargeItems.taxRate')" v-model="rciForm.taxRate"/>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div class="flex flex-col gap-1">
          <atom-input type="text" :required="true" :title="$t('company.pes.recurringChargeItems.quantity')" v-model="rciForm.quantity"/>
          <p v-if="showErrors && rciFormErrors.quantity" class="text-xs text-red-500">{{ $t('general.validation.mustBePositive') }}</p>
        </div>
        <molecular-select-unit :title="$t('company.pes.recurringChargeItems.unit')" v-model="rciForm.unit"/>
      </div>
      <pes-cost-center-select :title="$t('company.pes.recurringChargeItems.costCenter')" :null-label="$t('pes.costCenters.noParent')" v-model="rciForm.costCenterId"/>
      <div class="border-t border-secondary-200 pt-3 flex flex-col gap-1">
        <div class="w-full flex items-center justify-between gap-2">
          <span class="text-xs font-semibold text-secondary-600">{{ $t('company.pes.preview.subtotal') }}</span>
          <span class="text-sm">{{ formatCurrency((parseFloat(rciForm.quantity) || 0) * (parseFloat(rciForm.price) || 0)) }}</span>
        </div>
        <div class="w-full flex items-center justify-between gap-2">
          <span class="text-xs font-semibold text-secondary-600">{{ $t('company.pes.preview.total') }}</span>
          <span class="text-sm font-medium">{{ formatCurrency((parseFloat(rciForm.quantity) || 0) * (parseFloat(rciForm.price) || 0) * (1 + (rciForm.taxRate ?? 0))) }}</span>
        </div>
      </div>
    </div>
    <template #buttons>
      <atom-button type="button" icon="arrow-left" :title="$t('general.back')" :outline="true" @click="step = 'overview'"/>
      <atom-button type="button" icon="plus" :title="$t('company.pes.recurringChargeItems.createDialog.submit')" @click="onCreateRci" :disabled="saving"/>
    </template>
  </Dialog>

  <!-- Step 2b: Buchungsposition anlegen -->
  <Dialog
    v-else-if="step === 'createCi' && selectedItem"
    :open="true"
    @update:open="step = 'overview'">
    <template #headerLeft>
      <p class="text-lg">{{ $t('company.pes.chargeItems.createDialog.title') }}</p>
    </template>
    <div class="flex flex-col gap-4 py-2">
      <p class="text-xs text-secondary-500">{{ $t('quote.pesConvert.fromItem') }}: <span class="font-medium text-primary-900">{{ selectedItem.title }}</span></p>
      <div class="flex flex-col gap-1">
        <atom-input type="text" :required="true" :title="$t('company.pes.chargeItems.title')" v-model="ciForm.title"/>
        <p v-if="showErrors && !ciForm.title.trim()" class="text-xs text-red-500">{{ $t('general.validation.required') }}</p>
      </div>
      <atom-textarea :title="$t('company.pes.chargeItems.description')" v-model="ciForm.description"/>
      <div class="grid grid-cols-2 gap-4">
        <div class="flex flex-col gap-1">
          <atom-input type="date" :required="true" :title="$t('company.pes.chargeItems.serviceDate')" v-model="ciForm.serviceDate"/>
          <p v-if="showErrors && !ciForm.serviceDate" class="text-xs text-red-500">{{ $t('general.validation.required') }}</p>
        </div>
        <atom-input type="date" :title="$t('company.pes.chargeItems.serviceDateTo')" v-model="ciForm.serviceDateTo"/>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div class="flex flex-col gap-1">
          <atom-input type="text" :required="true" :title="$t('company.pes.chargeItems.price')" v-model="ciForm.price"/>
          <p v-if="showErrors && ciFormErrors.price" class="text-xs text-red-500">{{ $t('general.validation.invalidNumber') }}</p>
        </div>
        <molecular-select-tax-rate :title="$t('company.pes.chargeItems.taxRate')" v-model="ciForm.taxRate"/>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div class="flex flex-col gap-1">
          <atom-input type="text" :required="true" :title="$t('company.pes.chargeItems.quantity')" v-model="ciForm.quantity"/>
          <p v-if="showErrors && ciFormErrors.quantity" class="text-xs text-red-500">{{ $t('general.validation.mustBePositive') }}</p>
        </div>
        <molecular-select-unit :title="$t('company.pes.chargeItems.unit')" v-model="ciForm.unit"/>
      </div>
      <pes-cost-center-select :title="$t('company.pes.chargeItems.costCenter')" :null-label="$t('pes.costCenters.noParent')" v-model="ciForm.costCenterId"/>
      <div class="border-t border-secondary-200 pt-3 flex flex-col gap-1">
        <div class="w-full flex items-center justify-between gap-2">
          <span class="text-xs font-semibold text-secondary-600">{{ $t('company.pes.preview.subtotal') }}</span>
          <span class="text-sm">{{ formatCurrency((parseFloat(ciForm.quantity) || 0) * (parseFloat(ciForm.price) || 0)) }}</span>
        </div>
        <div class="w-full flex items-center justify-between gap-2">
          <span class="text-xs font-semibold text-secondary-600">{{ $t('company.pes.preview.total') }}</span>
          <span class="text-sm font-medium">{{ formatCurrency((parseFloat(ciForm.quantity) || 0) * (parseFloat(ciForm.price) || 0) * (1 + (ciForm.taxRate ?? 0))) }}</span>
        </div>
      </div>
    </div>
    <template #buttons>
      <atom-button type="button" icon="arrow-left" :title="$t('general.back')" :outline="true" @click="step = 'overview'"/>
      <atom-button type="button" icon="plus" :title="$t('company.pes.chargeItems.createDialog.submit')" @click="onCreateCi" :disabled="saving"/>
    </template>
  </Dialog>

</template>

<script setup lang="ts">
import { formatCurrency } from '~~/shared/utils/default';
import type { QuoteViewModel, QuoteItemViewModel } from '~~/shared/types/quote';

const props = defineProps<{
  quote: QuoteViewModel;
  pesCustomer: { id: string };
}>();

const emit = defineEmits<{ 'update:open': [value: boolean] }>();

const toast = useToast();

type Conversion = { id: string; quoteItemId: string; type: string; pesId: string };
type Step = 'overview' | 'createRci' | 'createCi';

const step = ref<Step>('overview');
const selectedItem = ref<QuoteItemViewModel | null>(null);
const conversions = ref<Conversion[]>([]);
const showErrors = ref(false);
const saving = ref(false);

const conversionsForItem = (itemId: string) =>
  conversions.value.filter(c => c.quoteItemId === itemId);

const hasConversion = (itemId: string, type: string) =>
  conversions.value.some(c => c.quoteItemId === itemId && c.type === type);

const isFullyConverted = (itemId: string) =>
  hasConversion(itemId, 'recurringChargeItem') && hasConversion(itemId, 'chargeItem');

const expandedItems = ref(new Set<string>());
const toggleExpand = (id: string) => {
  if (expandedItems.value.has(id)) expandedItems.value.delete(id);
  else expandedItems.value.add(id);
  expandedItems.value = new Set(expandedItems.value);
};
const isLongDescription = (html: string) => html.replace(/<[^>]*>/g, '').length > 120 || html.split('\n').length > 3;

const periodUnitItems = computed(() =>
  (['HOUR', 'DAY', 'WEEK', 'MONTH', 'YEAR'] as const).map(u => ({
    title: $t(`company.pes.recurringChargeItems.periodUnits.${u}`),
    value: u,
  }))
);

// RCI form
const rciForm = ref({
  title: '',
  description: '',
  startAt: new Date().toISOString().split('T')[0],
  endAt: '',
  periodQuantity: '1',
  periodUnit: 'MONTH',
  price: '',
  quantity: '1',
  unit: undefined as string | undefined,
  taxRate: undefined as number | undefined,
  costCenterId: null as string | null,
});

const rciFormErrors = computed(() => ({
  periodQuantity: !Number.isFinite(parseInt(rciForm.value.periodQuantity)) || parseInt(rciForm.value.periodQuantity) <= 0,
  price: !Number.isFinite(parseFloat(rciForm.value.price)),
  quantity: !Number.isFinite(parseFloat(rciForm.value.quantity)) || parseFloat(rciForm.value.quantity) <= 0,
}));

// CI form
const ciForm = ref({
  title: '',
  description: '',
  serviceDate: new Date().toISOString().split('T')[0],
  serviceDateTo: '',
  price: '',
  quantity: '1',
  unit: undefined as string | undefined,
  taxRate: undefined as number | undefined,
  costCenterId: null as string | null,
});

const ciFormErrors = computed(() => ({
  price: !Number.isFinite(parseFloat(ciForm.value.price)),
  quantity: !Number.isFinite(parseFloat(ciForm.value.quantity)) || parseFloat(ciForm.value.quantity) <= 0,
}));

const loadConversions = async () => {
  try {
    const result = await $fetch<Conversion[]>(`/api/quote/${props.quote.id}/pes-conversions`);
    conversions.value = result;
  } catch (e) {
    console.error('Failed to load conversions', e);
  }
};

const openCreate = (item: QuoteItemViewModel, type: 'recurringChargeItem' | 'chargeItem') => {
  selectedItem.value = item;
  showErrors.value = false;
  if (type === 'recurringChargeItem') {
    rciForm.value = {
      title: item.title,
      description: item.description ?? '',
      startAt: new Date().toISOString().split('T')[0],
      endAt: '',
      periodQuantity: '1',
      periodUnit: 'MONTH',
      price: String(item.price),
      quantity: String(item.quantity),
      unit: item.unit ?? undefined,
      taxRate: item.taxRate,
      costCenterId: null,
    };
    step.value = 'createRci';
  } else {
    ciForm.value = {
      title: item.title,
      description: item.description ?? '',
      serviceDate: new Date().toISOString().split('T')[0],
      serviceDateTo: '',
      price: String(item.price),
      quantity: String(item.quantity),
      unit: item.unit ?? undefined,
      taxRate: item.taxRate,
      costCenterId: null,
    };
    step.value = 'createCi';
  }
};

const onCreateRci = async () => {
  showErrors.value = true;
  if (!rciForm.value.title.trim() || Object.values(rciFormErrors.value).some(Boolean)) return;
  saving.value = true;
  try {
    const result = await $fetch<{ id: string }>('/api/pes/recurring-charge-item', {
      method: 'POST',
      body: {
        customerId: props.pesCustomer.id,
        title: rciForm.value.title,
        description: rciForm.value.description || undefined,
        startAt: new Date(rciForm.value.startAt).toISOString(),
        endAt: rciForm.value.endAt ? new Date(rciForm.value.endAt).toISOString() : undefined,
        periodQuantity: parseInt(rciForm.value.periodQuantity, 10),
        periodUnit: rciForm.value.periodUnit,
        price: parseFloat(rciForm.value.price),
        quantity: parseFloat(rciForm.value.quantity),
        unit: rciForm.value.unit || undefined,
        taxRate: rciForm.value.taxRate ?? 0,
        costCenterId: rciForm.value.costCenterId || undefined,
      },
    });
    await $fetch(`/api/quote/${props.quote.id}/pes-conversions`, {
      method: 'POST',
      body: { quoteItemId: selectedItem.value!.id, type: 'recurringChargeItem', pesId: result.id },
    });
    await loadConversions();
    toast.add({ type: 'success', title: $t('company.pes.recurringChargeItems.toast.createSuccess') });
    step.value = 'overview';
  } catch {
    toast.add({ type: 'error', title: $t('company.pes.recurringChargeItems.toast.createError') });
  } finally {
    saving.value = false;
  }
};

const onCreateCi = async () => {
  showErrors.value = true;
  if (!ciForm.value.title.trim() || !ciForm.value.serviceDate || Object.values(ciFormErrors.value).some(Boolean)) return;
  saving.value = true;
  try {
    const result = await $fetch<{ id: string }>('/api/pes/charge-item', {
      method: 'POST',
      body: {
        customerId: props.pesCustomer.id,
        title: ciForm.value.title,
        description: ciForm.value.description || undefined,
        serviceDate: new Date(ciForm.value.serviceDate).toISOString(),
        serviceDateTo: ciForm.value.serviceDateTo ? new Date(ciForm.value.serviceDateTo).toISOString() : undefined,
        quantity: parseFloat(ciForm.value.quantity),
        price: parseFloat(ciForm.value.price),
        unit: ciForm.value.unit || undefined,
        taxRate: ciForm.value.taxRate ?? 0,
        costCenterId: ciForm.value.costCenterId || undefined,
      },
    });
    await $fetch(`/api/quote/${props.quote.id}/pes-conversions`, {
      method: 'POST',
      body: { quoteItemId: selectedItem.value!.id, type: 'chargeItem', pesId: result.id },
    });
    await loadConversions();
    toast.add({ type: 'success', title: $t('company.pes.chargeItems.toast.createSuccess') });
    step.value = 'overview';
  } catch {
    toast.add({ type: 'error', title: $t('company.pes.chargeItems.toast.createError') });
  } finally {
    saving.value = false;
  }
};

onMounted(() => { loadConversions(); });
</script>
