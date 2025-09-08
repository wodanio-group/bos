<template>

  <Page :title="$t('dashboard.title')">

    <TimeTrackingStartStopSection
      class="col-span-12 lg:col-span-4">
    </TimeTrackingStartStopSection>

  </Page>

</template>

<script setup lang="ts">

definePageMeta({
  middleware: ['auth']
});

</script>
