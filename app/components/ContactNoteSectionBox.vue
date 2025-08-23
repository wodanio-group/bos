<template>

  <PageSectionBox>

  </PageSectionBox>

</template>

<script setup lang="ts">
import type { CompanyViewModel, PersonViewModel } from '~~/shared/types/contact';

const props = defineProps<{
  contact: PersonViewModel | CompanyViewModel;
}>();

</script>
