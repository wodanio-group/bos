<template>

  <Page
    v-if="item"
    :title="$t('company.item.title', { name: companyDisplayName(item) })"
    :subtitle="$t('company.item.subtitle')">

    <ContactNoteSectionBox
      :contact="item"
      class="col-span-8">

    </ContactNoteSectionBox>

    <CompanyInfoSectionBox
      :company="item"
      class="col-span-4">
    </CompanyInfoSectionBox>

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

