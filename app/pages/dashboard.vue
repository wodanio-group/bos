<template>

  <Page :title="$t('dashboard.title')">

    <TimeTrackingStartStopSection
      class="col-span-12 lg:col-span-4"
      v-if="hasRightTimetrackingOwn === true">
    </TimeTrackingStartStopSection>

  </Page>

</template>

<script setup lang="ts">

definePageMeta({
  middleware: ['auth']
});

const auth = useAuth();
const user = await auth.getUser();

const hasRightTimetrackingOwn = computed(() => user && user.rights.includes('timetracking.own.view') && user.rights.includes('timetracking.own.create'));

</script>
