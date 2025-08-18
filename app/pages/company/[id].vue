<template>

  <Page
    :title="$t('company.item.title', { name: item ? companyDisplayName(item) : '?' })">

  </Page>

</template>

<script setup lang="ts">

import type { CompanyViewModel } from '~~/shared/types/contact';

definePageMeta({
  middleware: ['auth']
});

const { item, loadItem } = useCrud<CompanyViewModel>({
  apiPath: '/api/company'
});
await loadItem();

</script>

