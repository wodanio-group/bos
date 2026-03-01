<template>

  <div>

    <div class="flex flex-col py-2">
      <div
        v-if="charges.length === 0"
        class="w-full flex items-center justify-center h-20">
        <p class="text-center text-secondary-700 text-sm">{{ $t('general.noItemsFound') }}</p>
      </div>
      <div
        v-for="charge in charges"
        :key="charge.id"
        class="flex flex-col gap-2 px-4 py-3 border-b border-b-secondary-200 last:border-b-0">
        <div class="flex items-center justify-between gap-2">
          <div class="flex items-center gap-2">
            <span
              v-if="isChargePaid(charge)"
              class="text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
              {{ $t('company.pes.charges.paid') }}
            </span>
            <span v-else class="text-xs font-medium text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
              {{ $t('company.pes.charges.unpaid') }}
            </span>
            <span class="text-xs font-medium text-secondary-600 bg-secondary-100 px-2 py-0.5 rounded-full">
              {{ charge.type === 'INVOICE' ? $t('company.pes.charges.typeInvoice') : $t('company.pes.charges.typeCreditNote') }}
            </span>
          </div>
          <div class="flex gap-1">
            <a
              v-if="charge.url"
              :href="charge.url"
              target="_blank"
              class="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium border border-secondary-300 rounded text-secondary-600 hover:text-secondary-900 hover:border-secondary-400 transition-colors">
              {{ $t('company.pes.charges.pdf') }}
            </a>
            <atom-button
              v-if="hasPesInteractRight && !isChargePaid(charge)"
              type="button"
              icon="circle-check"
              :title="$t('company.pes.charges.setPaidDialog.title')"
              :outline="true"
              @click="openSetPaid(charge)">
            </atom-button>
          </div>
        </div>
        <div class="w-full flex items-center justify-between gap-2">
          <span class="text-xs font-semibold text-secondary-600">{{ $t('company.pes.charges.chargeNumber') }}</span>
          <span class="text-sm text-right font-medium">{{ charge.chargeNumber }}</span>
        </div>
        <div v-if="charge.serviceDate" class="w-full flex items-center justify-between gap-2">
          <span class="text-xs font-semibold text-secondary-600">{{ $t('company.pes.charges.serviceDate') }}</span>
          <span class="text-sm text-right">
            {{ formatDate(charge.serviceDate) }}<span v-if="charge.serviceDateTo"> – {{ formatDate(charge.serviceDateTo) }}</span>
          </span>
        </div>
        <div class="w-full flex items-center justify-between gap-2">
          <span class="text-xs font-semibold text-secondary-600">{{ $t('company.pes.charges.subtotal') }}</span>
          <span class="text-sm text-right">{{ formatCurrency(charge.subtotal) }}</span>
        </div>
        <div class="w-full flex items-center justify-between gap-2">
          <span class="text-xs font-semibold text-secondary-600">{{ $t('company.pes.charges.tax') }}</span>
          <span class="text-sm text-right">{{ formatCurrency(charge.tax) }}</span>
        </div>
        <div class="w-full flex items-center justify-between gap-2">
          <span class="text-xs font-semibold text-secondary-600">{{ $t('company.pes.charges.total') }}</span>
          <span class="text-sm text-right font-medium">{{ formatCurrency(charge.total) }}</span>
        </div>
        <div v-if="charge.manuallyPaidAt" class="w-full flex items-center justify-between gap-2">
          <span class="text-xs font-semibold text-secondary-600">{{ $t('company.pes.charges.manuallyPaidAt') }}</span>
          <span class="text-sm text-right">{{ formatDate(charge.manuallyPaidAt) }}</span>
        </div>
      </div>
    </div>

    <!-- Charge create dialog -->
    <SimpleAlertDialog
      :open="showCreateChargeDialog"
      :title="$t('company.pes.charges.createDialog.title')"
      :description="$t('company.pes.charges.createDialog.description')"
      :submitButtonTitle="$t('company.pes.charges.createDialog.submit')"
      submitButtonIcon="plus"
      @submit="onCreateCharge"
      @cancel="showCreateChargeDialog = false"
      @update:open="showCreateChargeDialog = $event">
    </SimpleAlertDialog>

    <!-- Charge set manually paid dialog -->
    <Dialog
      :open="chargeToSetPaid !== null"
      @update:open="chargeToSetPaid = $event ? chargeToSetPaid : null">
      <template #headerLeft>
        <p class="text-lg">{{ $t('company.pes.charges.setPaidDialog.title') }}</p>
      </template>
      <div class="flex flex-col gap-4 py-2">
        <p class="text-sm text-secondary-600">{{ $t('company.pes.charges.setPaidDialog.description') }}</p>
        <atom-input
          type="date"
          :title="$t('company.pes.charges.setPaidDialog.paidAt')"
          v-model="newChargeManuallyPaidAt">
        </atom-input>
      </div>
      <template #buttons>
        <atom-button
          type="button"
          icon="circle-check"
          :title="$t('company.pes.charges.setPaidDialog.submit')"
          @click="onSetManuallyPaid">
        </atom-button>
      </template>
    </Dialog>

  </div>

</template>

<script setup lang="ts">
import { DateTime } from 'luxon';
import { formatCurrency } from '~~/shared/utils/default';

type BankDirectDebit = {
  id: string;
  chargeId: string;
  failedAt: string | null;
};

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

const props = defineProps<{
  pesCustomer: { id: string };
  hasPesInteractRight: boolean;
}>();

const emit = defineEmits<{
  chargeCreated: [];
}>();

const toast = useToast();
const charges = ref<Charge[]>([]);
const bankDirectDebits = ref<BankDirectDebit[]>([]);
const showCreateChargeDialog = ref(false);
const chargeToSetPaid = ref<Charge | null>(null);
const newChargeManuallyPaidAt = ref(new Date().toISOString().split('T')[0]);

const formatDate = (isoStr: string) =>
  DateTime.fromISO(isoStr).toFormat($t('format.date'));

const loadCharges = async () => {
  const [chargesResult, debitsResult] = await Promise.all([
    $fetch<{ items: Charge[] }>('/api/pes/charge', {
      query: { customerId: props.pesCustomer.id, take: 999999 },
    }),
    $fetch<{ items: BankDirectDebit[] }>('/api/pes/bank-direct-debit', {
      query: { customerId: props.pesCustomer.id, take: 999999 },
    }),
  ]);
  charges.value = chargesResult.items;
  bankDirectDebits.value = debitsResult.items;
};

const isChargePaid = (charge: Charge) => {
  if (charge.manuallyPaidAt) return true;
  return bankDirectDebits.value
    .filter(d => d.chargeId === charge.id)
    .some(d => d.failedAt === null);
};

let pollInterval: ReturnType<typeof setInterval> | null = null;

onMounted(() => {
  loadCharges();
  pollInterval = setInterval(loadCharges, 10_000);
});

onUnmounted(() => {
  if (pollInterval !== null) clearInterval(pollInterval);
});

const openSetPaid = (charge: Charge) => {
  newChargeManuallyPaidAt.value = new Date().toISOString().split('T')[0];
  chargeToSetPaid.value = charge;
};

const onCreateCharge = async () => {
  try {
    await $fetch('/api/pes/charge', {
      method: 'POST',
      body: {
        customerId: props.pesCustomer.id,
        assignUnassignedItems: true,
      },
    });
    showCreateChargeDialog.value = false;
    await loadCharges();
    emit('chargeCreated');
    toast.add({ type: 'success', title: $t('company.pes.charges.toast.createSuccess') });
  } catch {
    toast.add({ type: 'error', title: $t('company.pes.charges.toast.createError') });
  }
};

const onSetManuallyPaid = async () => {
  if (!chargeToSetPaid.value) return;
  try {
    await $fetch(`/api/pes/charge/${chargeToSetPaid.value.id}`, {
      method: 'PATCH',
      body: {
        manuallyPaidAt: newChargeManuallyPaidAt.value
          ? new Date(String(newChargeManuallyPaidAt.value)).toISOString()
          : new Date().toISOString(),
      },
    });
    chargeToSetPaid.value = null;
    await loadCharges();
    toast.add({ type: 'success', title: $t('company.pes.charges.toast.setPaidSuccess') });
  } catch {
    toast.add({ type: 'error', title: $t('company.pes.charges.toast.setPaidError') });
  }
};

defineExpose({
  reload: loadCharges,
  triggerCreate: () => { showCreateChargeDialog.value = true; },
});
</script>
