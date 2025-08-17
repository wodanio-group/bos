<template>

  <label class="w-full flex flex-col gap-1 relative">
    <span class="text-xs text-gray-600 font-semibold" v-if="title">
      {{ title }}{{ (required === true) ? ' *' : '' }}
    </span>
    <input
      :type="type ?? 'text'"
      :name="name ?? undefined"
      :required="required === true"
      :readonly="readonly === true"
      class="w-full px-4 py-1.5 text-sm text-primary-950 border border-secondary-200 rounded-lg shadow shadow-gray-100 focus:border-gray-500 focus:outline-none focus:ring-0 read-only:opacity-60 read-only:cursor-not-allowed"
      v-model="value"/>
  </label>

</template>

<script setup lang="ts">

import type { InputTypeHTMLAttribute } from 'vue';

const value = defineModel<string | number>();

const props = defineProps<{
  type?: InputTypeHTMLAttribute | null;
  readonly?: boolean | null;
  required?: boolean | null;
  title?: string | null;
  name?: string | null;
}>();

</script>
