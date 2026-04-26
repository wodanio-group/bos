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

    <div class="flex items-center gap-2 px-4 py-2 border-b border-secondary-100">
      <input
        type="text"
        v-model="search"
        :placeholder="$t('company.pes.search')"
        class="flex-1 px-3 py-1.5 text-sm border border-secondary-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 bg-white">
      <select
        v-if="activeTab === 'recurringChargeItems'"
        v-model="rciStatusFilter"
        class="text-sm border border-secondary-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 bg-white">
        <option value="all">{{ $t('company.pes.recurringChargeItems.statusAll') }}</option>
        <option value="active">{{ $t('company.pes.recurringChargeItems.active') }}</option>
        <option value="ending">{{ $t('company.pes.recurringChargeItems.ending') }}</option>
        <option value="ended">{{ $t('company.pes.recurringChargeItems.ended') }}</option>
      </select>
      <pes-cost-center-select
        v-if="activeTab === 'recurringChargeItems'"
        v-model="rciCostCenterFilter"
        :null-label="$t('company.pes.allCostCenters')"
        :compact="true"/>
      <select
        v-if="activeTab === 'chargeItems'"
        v-model="ciStatusFilter"
        class="text-sm border border-secondary-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 bg-white">
        <option value="all">{{ $t('company.pes.chargeItems.statusAll') }}</option>
        <option value="unassigned">{{ $t('company.pes.chargeItems.unassigned') }}</option>
        <option value="assigned">{{ $t('company.pes.chargeItems.assigned') }}</option>
      </select>
      <pes-cost-center-select
        v-if="activeTab === 'chargeItems'"
        v-model="ciCostCenterFilter"
        :null-label="$t('company.pes.allCostCenters')"
        :compact="true"/>
    </div>

    <contact-pes-section-box-mandates-tab
      v-show="activeTab === 'mandates'"
      ref="mandatesTabRef"
      :pesCustomer="pesCustomer"
      :hasPesInteractRight="hasPesInteractRight"
      :search="search">
    </contact-pes-section-box-mandates-tab>

    <contact-pes-section-box-recurring-charge-items-tab
      v-show="activeTab === 'recurringChargeItems'"
      ref="rciTabRef"
      :pesCustomer="pesCustomer"
      :hasPesInteractRight="hasPesInteractRight"
      :search="search"
      :statusFilter="rciStatusFilter"
      :costCenterFilter="rciCostCenterFilter">
    </contact-pes-section-box-recurring-charge-items-tab>

    <contact-pes-section-box-charge-items-tab
      v-show="activeTab === 'chargeItems'"
      ref="ciTabRef"
      :pesCustomer="pesCustomer"
      :hasPesInteractRight="hasPesInteractRight"
      :hasPesDeleteRight="hasPesDeleteRight"
      :search="search"
      :statusFilter="ciStatusFilter"
      :costCenterFilter="ciCostCenterFilter">
    </contact-pes-section-box-charge-items-tab>

    <contact-pes-section-box-charges-tab
      v-show="activeTab === 'charges'"
      ref="chargesTabRef"
      :pesCustomer="pesCustomer"
      :hasPesInteractRight="hasPesInteractRight"
      :search="search"
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
const search = ref('');
const rciStatusFilter = ref<'all' | 'active' | 'ending' | 'ended'>('all');
const rciCostCenterFilter = ref<string | null>(null);
const ciStatusFilter = ref<'all' | 'unassigned' | 'assigned'>('all');
const ciCostCenterFilter = ref<string | null>(null);

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
