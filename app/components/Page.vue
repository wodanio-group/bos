<template>

  <div
    class="relative w-full px-4 lg:px-6 pt-6 pb-12 grid grid-cols-12 gap-4">

    <section
      class="col-span-12 relative flex justify-between items-center">
      <div class="flex justify-start items-center">
        <p class="text-2xl text-gray-500">{{ title }}</p>
      </div>
      <div class="flex justify-end items-center gap-2">
        <slot name="header"></slot>
      </div>
    </section>

    <slot></slot>

  </div>

</template>

<script setup lang="ts">

const props = defineProps<{
  title: string
}>();

</script>
