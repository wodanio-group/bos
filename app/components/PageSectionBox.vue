<template>

  <section
    class="relative flex flex-col border border-secondary-200 rounded-2xl shadow-lg shadow-secondary-100/50 overflow-hidden">
    <div 
      class="flex items-center justify-between border-b border-b-secondary-200 px-4 py-2 min-h-10" 
      v-if="hiddeHeader !== true">
      <div class="flex justify-start items-center gap-2">
        <p class="text-sm font-semibold text-secondary-700" v-if="title">{{ title }}</p>
        <slot name="headerLeft"></slot>
      </div>
      <div class="flex justify-end items-center gap-2">
        <slot name="headerRight"></slot>
      </div>
    </div>
    <div class="block relative">
      <slot></slot>
    </div>
  </section>

</template>

<script setup lang="ts">

const props = defineProps<{
  title?: string,
  hiddeHeader?: boolean
}>();

</script>
