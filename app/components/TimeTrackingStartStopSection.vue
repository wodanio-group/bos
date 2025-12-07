<template>

  <PageSectionBox
    :title="$t('timeTracking.title')"
    :overflowHidden="true">
    <template #headerRight>
      <p
        class="text-sm font-semibold"
        v-if="isRunning">{{ trackedTimeFormated }}</p>
    </template>
    <div class="flex justify-center items-center p-6">
      <div 
        class="absolute w-28 h-28 bg-primary-900 rounded-full animate-ping opacity-20"
        v-if="isRunning"></div>
      <button
        type="button"
        class="relative flex justify-center items-center gap-1 flex-col w-28 h-28 border-2 border-primary-950 bg-primary-900 rounded-full shadow-2xl"
        @click="toggleTracking()">
        <atom-icon 
          icon="play" 
          class="text-secondary-100 !text-2xl"
          v-if="!isRunning"/>
        <span 
          class="text-secondary-100 text-sm text-center"
          v-if="!isRunning">{{ $t('timeTracking.start') }}</span>
        <atom-icon 
          icon="pause" 
          class="text-secondary-100 !text-2xl"
          v-if="isRunning"/>
        <span 
          class="text-secondary-100 text-sm text-center"
          v-if="isRunning">{{ $t('timeTracking.stop') }}</span>
      </button>
    </div>
  </PageSectionBox>

</template>

<script setup lang="ts">
import { setInterval } from '#imports';
import { DateTime, Duration } from 'luxon';
import type { TimeTrackingActivityViewModel } from '~~/shared/types/time-tracking';

const { getUser } = useAuth();
const user = await getUser();

const runningTimeTracking = await useAsyncData<TimeTrackingActivityViewModel | null>('timeTrackingIsRunningMe', async () => (await $fetch('/api/time-tracking/activity', { query: {
    userId: user?.id ?? '',
    isRunning: true,
  } })).at(0) ?? null);
await runningTimeTracking.refresh();

const isRunning = computed<boolean>(() => runningTimeTracking.data.value !== null);
const trackedTime = computed<number>(() => {
  if (!runningTimeTracking.data.value)
    return 0;
  return DateTime.now().setZone('UTC').toMillis() - DateTime.fromISO(runningTimeTracking.data.value.from).setZone('UTC').toMillis();
});
const trackedTimeFormated = computed(() => Duration.fromMillis(trackedTime.value).toFormat($t('format.duration')));

const toggleTracking = async () => {
  if (isRunning.value === true) {
    await $fetch('/api/time-tracking/activity/me/stop', { method: 'POST' });
  } else {
    await $fetch('/api/time-tracking/activity/me/start', { method: 'POST' });
  }
  await runningTimeTracking.refresh();
};

let interval: any;

onMounted(async () => {
  interval = setInterval(() => runningTimeTracking.refresh(), 1000 * 45);
});
onUnmounted(async () => {
  if (interval)
    clearInterval(interval);
});

</script>
