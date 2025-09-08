<template>

  <Page
    v-if="item"
    :title="$t('person.item.title', { name: item ? personDisplayName(item) : '?' })"
    :subtitle="$t('person.item.subtitle')">

    <ContactNoteSectionBox
      :contact="item"
      class="col-span-8">

    </ContactNoteSectionBox>

    <ContactInfoSectionBox
      :contact="item"
      class="col-span-4">
    </ContactInfoSectionBox>

  </Page>

</template>

<script setup lang="ts">

import type { PersonViewModel } from '~~/shared/types/contact';

definePageMeta({
  middleware: ['auth']
});

const { item, loadItem } = useCrud<PersonViewModel>({
  apiPath: '/api/person'
});
await loadItem();

</script>

