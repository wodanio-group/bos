<template>

  <label class="w-full flex flex-col gap-1 relative">
    <span class="text-xs text-gray-600 font-semibold" v-if="title">
      {{ title }}{{ (required === true) ? ' *' : '' }}
    </span>
    <textarea
      :name="name ?? undefined"
      :required="required === true"
      :readonly="readonly === true"
      class="w-full px-4 py-2.5 min-h-24 text-sm text-primary-950 border border-secondary-200 rounded-lg shadow shadow-gray-100 focus:border-gray-500 focus:outline-none focus:ring-0 read-only:opacity-60 read-only:cursor-not-allowed"
      v-model="value">
    </textarea>
  </label>

</template>

<script setup lang="ts">

const value = defineModel<string | number>();

const props = defineProps<{
  readonly?: boolean | null;
  required?: boolean | null;
  title?: string | null;
  name?: string | null;
}>();

</script>
