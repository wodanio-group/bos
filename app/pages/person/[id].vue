<template>

  <Page
    :title="$t('person.item.title', { name: item ? personDisplayName(item) : '?' })"
    :subtitle="$t('person.item.subtitle')">

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

