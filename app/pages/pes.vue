<template>

  <Page :title="$t('pes.title')">

    <div class="col-span-12 flex border-b border-secondary-200 -mb-2">
      <NuxtLink
        v-for="tab in tabs"
        :key="tab.to"
        :to="tab.to"
        class="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-secondary-500 border-b-2 border-transparent hover:text-primary-950 hover:border-secondary-300 transition-colors"
        :class="{ '!border-primary-600 !text-primary-950': route.path.startsWith(tab.to) }">
        <atom-icon :icon="tab.icon" class="!text-base"/>
        {{ tab.title }}
      </NuxtLink>
    </div>

    <NuxtPage class="col-span-12"/>

  </Page>

</template>

<script setup lang="ts">

definePageMeta({
  middleware: ['auth']
});

const route = useRoute();

const tabs = computed(() => [
  { title: $t('layout.aside.pesAnalytics'),        icon: 'chart-bar',          to: '/pes/analytics' },
  { title: $t('layout.aside.pesCharges'),         icon: 'receipt',            to: '/pes/charge' },
  { title: $t('layout.aside.pesDunnings'),         icon: 'mail-warning',       to: '/pes/dunning' },
  { title: $t('layout.aside.pesDirectDebitBulk'), icon: 'arrow-down-to-line', to: '/pes/bank-direct-debit-bulk' },
  { title: $t('layout.aside.pesTransferBulk'),    icon: 'arrow-up-to-line',   to: '/pes/bank-transfer-bulk' },
  { title: $t('layout.aside.pesCostCenters'),     icon: 'landmark',           to: '/pes/cost-center' },
  { title: $t('layout.aside.pesExport'),          icon: 'file-down',          to: '/pes/export' },
]);

</script>
