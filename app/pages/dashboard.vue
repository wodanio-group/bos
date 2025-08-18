<template>

  <Page :title="$t('dashboard.title')">

  </Page>

</template>

<script setup lang="ts">

definePageMeta({
  middleware: ['auth']
});

</script>
