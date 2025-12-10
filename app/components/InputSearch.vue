<template>

  <label
    class="inline-block relative w-full">
    <input
      class="text-sm text-primary-950 py-1.5 pl-9 pr-4 border border-secondary-200 rounded-lg w-full"
      :class="{
        'pr-8': hasInput
      }"
      :placeholder="$t('general.searchPlaceholder')"
      v-model="value"
      type="text"/>
    <atom-icon 
      icon="search" 
      class="text-secondary-600 absolute top-1/2 -translate-y-1/2 left-3"/>
    <button
      v-if="hasInput && hideClearButton !== true"
      type="button"
      class="absolute top-1/2 -translate-y-1/2 right-3 outline-[1]"
      @click.prevent="onClear()">
      <atom-icon 
        icon="x" 
        class="text-secondary-600 !leading-[1]"/>
    </button>
  </label>

</template>

<script setup lang="ts">

const value = defineModel<string>();

const props = defineProps<{
  hideClearButton?: boolean,
}>();

const hasInput = computed<boolean>(() => (value.value?.length ?? 0) > 0);

const onClear = () => value.value = '';

</script>
