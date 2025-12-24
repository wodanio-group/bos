<template>

  <NuxtLayout>
    <NuxtPage></NuxtPage>
  </NuxtLayout>

  <div 
    class="fixed top-0 left-0 w-full bg-secondary-50 z-50"
    v-if="loadingBarWidth !== null">
    <div
      class="bg-primary-950/10 flex items-center justify-end transition-all"
      :style="'width: '+loadingBarWidth+';'">
      <div class="w-1 h-1 bg-secondary-800 transition-all"></div>
    </div>
  </div>

  <div
    v-if="toasts.length > 0"
    class="fixed bottom-0 right-0 pr-2 pb-4 flex flex-col justify-end items-end gap-2 z-[5000]">
    <div
      class="relative flex items-center justify-center gap-1.5 text-sm px-3 py-1.5 shadow-lg rounded-lg"
      :class="{
        'bg-primary-600': (toast.type === 'info'),
        'text-primary-50': (toast.type === 'info'),
        'bg-green-600': (toast.type === 'success'),
        'text-green-50': (toast.type === 'success'),
        'bg-red-600': (toast.type === 'error'),
        'text-red-50': (toast.type === 'error'),
        'bg-yellow-600': (toast.type === 'warning'),
        'text-yellow-50': (toast.type === 'warning'),
      }"
      v-for="toast in toasts">
      <atom-icon :icon="getIconForToast(toast)"/>
      <span>{{ toast.title }}</span>
    </div>
  </div>

</template>

<script setup lang="ts">

const { progress } = useLoadingIndicator();
const { toasts, getIconForToast, add } = useToast();

const loadingBarWidth = computed<string | null>(() => {
  if (progress.value <= 0 || progress.value >= 100)
    return null;
  return `${progress.value}%`;
});

</script>
