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
      <button
        class="px-3 py-1 text-sm font-medium border-b-2 transition-colors"
        :class="activeTab === 'recurringChargeItems'
          ? 'border-primary-600 text-primary-600'
          : 'border-transparent text-secondary-500 hover:text-secondary-700'"
        @click="activeTab = 'recurringChargeItems'">
        {{ $t('company.pes.recurringChargeItems.tabTitle') }}
      </button>
      <button
        class="px-3 py-1 text-sm font-medium border-b-2 transition-colors"
        :class="activeTab === 'chargeItems'
          ? 'border-primary-600 text-primary-600'
          : 'border-transparent text-secondary-500 hover:text-secondary-700'"
        @click="activeTab = 'chargeItems'">
        {{ $t('company.pes.chargeItems.tabTitle') }}
      </button>
      <button
        class="px-3 py-1 text-sm font-medium border-b-2 transition-colors"
        :class="activeTab === 'charges'
          ? 'border-primary-600 text-primary-600'
          : 'border-transparent text-secondary-500 hover:text-secondary-700'"
        @click="activeTab = 'charges'">
        {{ $t('company.pes.charges.tabTitle') }}
      </button>
    </template>

    <template #headerRight>
      <atom-button
        v-if="hasPesInteractRight && activeTab === 'mandates'"
        type="button"
        icon="plus"
        :title="$t('company.pes.mandates.create')"
        @click="mandatesTabRef?.triggerCreate()">
      </atom-button>
      <atom-button
        v-if="hasPesInteractRight && activeTab === 'recurringChargeItems'"
        type="button"
        icon="plus"
        :title="$t('company.pes.recurringChargeItems.create')"
        @click="rciTabRef?.triggerCreate()">
      </atom-button>
      <atom-button
        v-if="hasPesInteractRight && activeTab === 'chargeItems'"
        type="button"
        icon="plus"
        :title="$t('company.pes.chargeItems.create')"
        @click="ciTabRef?.triggerCreate()">
      </atom-button>
      <atom-button
        v-if="hasPesInteractRight && activeTab === 'charges'"
        type="button"
        icon="plus"
        :title="$t('company.pes.charges.create')"
        @click="chargesTabRef?.triggerCreate()">
      </atom-button>
    </template>

    <contact-pes-section-box-mandates-tab
      v-show="activeTab === 'mandates'"
      ref="mandatesTabRef"
      :pesCustomer="pesCustomer"
      :hasPesInteractRight="hasPesInteractRight">
    </contact-pes-section-box-mandates-tab>

    <contact-pes-section-box-recurring-charge-items-tab
      v-show="activeTab === 'recurringChargeItems'"
      ref="rciTabRef"
      :pesCustomer="pesCustomer"
      :hasPesInteractRight="hasPesInteractRight">
    </contact-pes-section-box-recurring-charge-items-tab>

    <contact-pes-section-box-charge-items-tab
      v-show="activeTab === 'chargeItems'"
      ref="ciTabRef"
      :pesCustomer="pesCustomer"
      :hasPesInteractRight="hasPesInteractRight"
      :hasPesDeleteRight="hasPesDeleteRight">
    </contact-pes-section-box-charge-items-tab>

    <contact-pes-section-box-charges-tab
      v-show="activeTab === 'charges'"
      ref="chargesTabRef"
      :pesCustomer="pesCustomer"
      :hasPesInteractRight="hasPesInteractRight"
      @charge-created="ciTabRef?.reload()">
    </contact-pes-section-box-charges-tab>

  </page-section-box>

</template>

<script setup lang="ts">
type PesCustomer = { id: string };

const props = defineProps<{ customerId: string | null }>();

const auth = useAuth();
const user = await auth.getUser();
const hasPesInteractRight = user?.rights.includes('pes.interact') ?? false;
const hasPesDeleteRight = user?.rights.includes('pes.delete') ?? false;

const pesCustomer = ref<PesCustomer | null>(null);
const activeTab = ref<'mandates' | 'recurringChargeItems' | 'chargeItems' | 'charges'>('mandates');

const mandatesTabRef = ref<{ reload: () => void; triggerCreate: () => void } | null>(null);
const rciTabRef = ref<{ reload: () => void; triggerCreate: () => void } | null>(null);
const ciTabRef = ref<{ reload: () => void; triggerCreate: () => void } | null>(null);
const chargesTabRef = ref<{ reload: () => void; triggerCreate: () => void } | null>(null);

const hasPesReadRight = user?.rights.includes('pes.read') ?? false;

if (hasPesReadRight && props.customerId) {
  try {
    const { enabled } = await $fetch<{ enabled: boolean }>('/api/pes/enabled');
    if (enabled) {
      const result = await $fetch<{ items: PesCustomer[] }>('/api/pes/customer', {
        query: { externalId: props.customerId },
      });
      pesCustomer.value = result.items.at(0) ?? null;
    }
  } catch (e) {
    console.error('PES customer lookup failed:', e);
  }
}
</script>
