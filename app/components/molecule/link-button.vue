<template>
  <NuxtLink
    :to="to"
    class="group inline-flex items-center justify-center gap-1 text-sm text-primary-950 p-2 rounded-lg transition-colors overflow-hidden hover:bg-secondary-100">
    <span>{{ title }}</span>
    <atom-icon icon="arrow-right" class="-mr-6 group-hover:mr-0 opacity-0 group-hover:opacity-80 !text-sm transition-all"></atom-icon>
  </NuxtLink>
</template>

<script setup lang="ts">

defineProps<{
  to: string;
  title: string;
}>();

</script>
