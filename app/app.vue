<template>

  <NuxtLayout>
    <NuxtPage></NuxtPage>
  </NuxtLayout>

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

const { toasts, getIconForToast, add } = useToast();

</script>
