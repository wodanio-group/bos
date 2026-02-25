<template>

  <page-section-box
    v-if="pesCustomer"
    :title="$t('company.pes.title')"
    :fixedHeight="true"
    class="col-span-1 lg:col-span-12">

    <template #headerLeft>
      <button
        class="px-3 py-1 text-sm font-medium border-b-2 transition-colors"
        :class="activeTab === 'mandates'
          ? 'border-primary-600 text-primary-600'
          : 'border-transparent text-secondary-500 hover:text-secondary-700'"
        @click="activeTab = 'mandates'">
        {{ $t('company.pes.mandates.tabTitle') }}
      </button>
    </template>

    <template #headerRight>
      <atom-button
        v-if="hasPesInteractRight && activeTab === 'mandates'"
        type="button"
        icon="plus"
        :title="$t('company.pes.mandates.create')"
        @click="showCreateDialog = true">
      </atom-button>
    </template>

    <div v-if="activeTab === 'mandates'" class="flex flex-col py-2">
      <div
        v-if="mandates.length === 0"
        class="w-full flex items-center justify-center h-20">
        <p class="text-center text-secondary-700 text-sm">{{ $t('general.noItemsFound') }}</p>
      </div>
      <div
        v-for="mandate in mandates"
        :key="mandate.id"
        class="flex flex-col gap-2 px-4 py-3 border-b border-b-secondary-200 last:border-b-0">
        <div class="flex items-center justify-between gap-2">
          <span
            v-if="!mandate.revokedAt"
            class="text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
            {{ $t('company.pes.mandates.active') }}
          </span>
          <span v-else class="text-xs text-secondary-500">
            {{ $t('company.pes.mandates.revokedAt') }}: {{ formatDate(mandate.revokedAt) }}
          </span>
          <atom-button
            v-if="!mandate.revokedAt && hasPesInteractRight"
            type="button"
            icon="ban"
            :title="$t('company.pes.mandates.revoke')"
            :outline="true"
            @click="mandateToRevoke = mandate">
          </atom-button>
        </div>
        <div class="w-full flex items-center justify-between gap-2">
          <span class="text-xs font-semibold text-secondary-600">{{ $t('company.pes.mandates.payer') }}</span>
          <span class="text-sm text-right">{{ mandate.payer }}</span>
        </div>
        <div class="w-full flex items-center justify-between gap-2">
          <span class="text-xs font-semibold text-secondary-600">{{ $t('general.iban') }}</span>
          <span class="text-sm text-right">{{ formatIban(mandate.iban) }}</span>
        </div>
        <div class="w-full flex items-center justify-between gap-2">
          <span class="text-xs font-semibold text-secondary-600">{{ $t('general.bic') }}</span>
          <span class="text-sm text-right">{{ mandate.bic }}</span>
        </div>
        <div class="w-full flex items-center justify-between gap-2">
          <span class="text-xs font-semibold text-secondary-600">{{ $t('general.bankName') }}</span>
          <span class="text-sm text-right">{{ mandate.bankName }}</span>
        </div>
        <div class="w-full flex items-center justify-between gap-2">
          <span class="text-xs font-semibold text-secondary-600">{{ $t('company.pes.mandates.grantedAt') }}</span>
          <span class="text-sm text-right">{{ formatDate(mandate.grantedAt) }}</span>
        </div>
        <div v-if="mandate.referenceID" class="w-full flex items-center justify-between gap-2">
          <span class="text-xs font-semibold text-secondary-600">{{ $t('company.pes.mandates.referenceID') }}</span>
          <span class="text-sm text-right">{{ mandate.referenceID }}</span>
        </div>
      </div>
    </div>

    <SimpleAlertDialog
      :open="mandateToRevoke !== null"
      :title="$t('company.pes.mandates.revokeDialog.title')"
      :description="$t('company.pes.mandates.revokeDialog.description')"
      :submitButtonTitle="$t('company.pes.mandates.revoke')"
      submitButtonIcon="ban"
      @submit="onRevoke"
      @cancel="mandateToRevoke = null"
      @update:open="mandateToRevoke = $event ? mandateToRevoke : null">
    </SimpleAlertDialog>

    <Dialog
      :open="showCreateDialog"
      @update:open="showCreateDialog = $event">
      <template #headerLeft>
        <p class="text-lg">{{ $t('company.pes.mandates.createDialog.title') }}</p>
      </template>
      <div class="flex flex-col gap-4 py-2">
        <atom-input
          type="text"
          :title="$t('company.pes.mandates.referenceID')"
          v-model="newReferenceID">
        </atom-input>
        <atom-input
          type="text"
          :title="$t('company.pes.mandates.payer')"
          v-model="newPayer">
        </atom-input>
        <atom-input
          type="text"
          :title="$t('general.iban')"
          v-model="newIban">
        </atom-input>
        <atom-input
          type="date"
          :title="$t('company.pes.mandates.grantedAt')"
          v-model="newGrantedAt">
        </atom-input>
        <atom-input
          type="text"
          :title="$t('company.pes.mandates.grantedByIp')"
          v-model="newGrantedByIp">
        </atom-input>
        <atom-textarea
          :title="$t('company.pes.mandates.agreement')"
          v-model="newAgreement">
        </atom-textarea>
      </div>
      <template #buttons>
        <atom-button
          type="button"
          icon="plus"
          :title="$t('company.pes.mandates.createDialog.submit')"
          @click="onCreate">
        </atom-button>
      </template>
    </Dialog>

  </page-section-box>

</template>

<script setup lang="ts">
type PesCustomer = { id: string };
type DirectDebitMandate = {
  id: string;
  referenceID: string;
  payer: string;
  iban: string;
  bic: string;
  bankName: string;
  grantedAt: string;
  revokedAt: string | null;
  customerId: string;
};

const props = defineProps<{ customerId: string | null }>();

const auth = useAuth();
const user = await auth.getUser();
const hasPesReadRight = user?.rights.includes('pes.read') ?? false;
const hasPesInteractRight = user?.rights.includes('pes.interact') ?? false;

const toast = useToast();
const pesCustomer = ref<PesCustomer | null>(null);
const mandates = ref<DirectDebitMandate[]>([]);

const loadMandates = async () => {
  if (!pesCustomer.value) return;
  const result = await $fetch<{ items: DirectDebitMandate[] }>('/api/pes/direct-debit-mandate', {
    query: { customerId: pesCustomer.value.id },
  });
  mandates.value = result.items;
};

if (hasPesReadRight && props.customerId) {
  const { enabled } = await $fetch<{ enabled: boolean }>('/api/pes/enabled');
  if (enabled) {
    const result = await $fetch<{ items: PesCustomer[] }>('/api/pes/customer', {
      query: { externalId: props.customerId },
    });
    pesCustomer.value = result.items.at(0) ?? null;
    if (pesCustomer.value) {
      await loadMandates();
    }
  }
}

const activeTab = ref<'mandates'>('mandates');
const mandateToRevoke = ref<DirectDebitMandate | null>(null);
const showCreateDialog = ref(false);
const newReferenceID = ref('');
const newPayer = ref('');
const newIban = ref('');
const newGrantedAt = ref(new Date().toISOString().split('T')[0]);
const newGrantedByIp = ref('');
const newAgreement = ref('');

import { DateTime } from 'luxon';

const formatIban = (iban: string) =>
  iban.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();

const formatDate = (isoStr: string) =>
  DateTime.fromISO(isoStr).toFormat($t('format.date'));

const onRevoke = async () => {
  if (!mandateToRevoke.value) return;
  try {
    await $fetch(`/api/pes/direct-debit-mandate/${mandateToRevoke.value.id}/revoke`, {
      method: 'POST',
      body: {},
    });
    mandateToRevoke.value = null;
    await loadMandates();
    toast.add({ type: 'success', title: $t('company.pes.mandates.toast.revokeSuccess') });
  } catch {
    toast.add({ type: 'error', title: $t('company.pes.mandates.toast.revokeError') });
  }
};

const onCreate = async () => {
  if (!pesCustomer.value) return;
  try {
    await $fetch('/api/pes/direct-debit-mandate', {
      method: 'POST',
      body: {
        customerId: pesCustomer.value.id,
        type: 'BASIC',
        referenceID: newReferenceID.value || undefined,
        payer: newPayer.value,
        iban: newIban.value,
        grantedAt: newGrantedAt.value ? new Date(String(newGrantedAt.value)).toISOString() : undefined,
        grantedByIp: newGrantedByIp.value || undefined,
        agreement: newAgreement.value || undefined,
      },
    });
    showCreateDialog.value = false;
    newReferenceID.value = '';
    newPayer.value = '';
    newIban.value = '';
    newGrantedAt.value = new Date().toISOString().split('T')[0];
    newGrantedByIp.value = '';
    newAgreement.value = '';
    await loadMandates();
    toast.add({ type: 'success', title: $t('company.pes.mandates.toast.createSuccess') });
  } catch {
    toast.add({ type: 'error', title: $t('company.pes.mandates.toast.createError') });
  }
};
</script>
