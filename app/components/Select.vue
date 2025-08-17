<template>

  <label class="w-full flex flex-col gap-1 relative">
    <span class="text-xs text-gray-600 font-semibold" v-if="title">
      {{ title }}{{ (required === true) ? ' *' : '' }}
    </span>
    <select
      :name="name ?? undefined"
      :required="required === true"
      class="w-full px-4 py-1.5 text-sm text-primary-950 border border-secondary-200 rounded-lg shadow shadow-gray-100 focus:border-gray-500 focus:outline-none focus:ring-0"
      v-model="value">
      <option
        :value="item.value"
        v-for="item in (items ?? [])">
        {{ item.title ?? item.value }}
      </option>
    </select>
  </label>

</template>

<script setup lang="ts">

const value = defineModel<string | number | null>();

const props = defineProps<{
  readonly?: boolean | null;
  required?: boolean | null;
  title?: string | null;
  name?: string | null;
  items?: { title?: string, value: (string | number | null) }[],
}>();

</script>
