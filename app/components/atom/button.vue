<template>

  <button
    :disabled="disabled === true"
    :type="type"
    v-if="type !== 'link'"
    @click="onClick"
    class="relative flex justify-center items-center gap-1 bg-primary-950 text-secondary-100 text-sm px-4 py-1.5 rounded-lg border border-primary-950 transition-colors hover:bg-primary-950/80 disabled:cursor-not-allowed disabled:opacity-60">
    <Icon
      class="" 
      :icon="icon" 
      v-if="icon"/>
    <span 
      class="" 
      v-if="title">
      {{ title }}
    </span>
    <slot></slot>
  </button>

  <NuxtLink
    v-if="type === 'link'"
    :disabled="disabled === true"
    :to="to"
    :href="href"
    @click="onClick"
    class="relative flex justify-center items-center gap-1 bg-primary-950 text-secondary-100 text-sm px-4 py-1.5 rounded-lg border border-primary-950 transition-colors hover:bg-primary-950/80 disabled:cursor-not-allowed disabled:opacity-60">
    <Icon
      class="" 
      :icon="icon" 
      v-if="icon"/>
    <span 
      class="" 
      v-if="title">
      {{ title }}
    </span>
    <slot></slot>
  </NuxtLink>

</template>

<script setup lang="ts">

const props = defineProps<{
  type: 'button' | 'submit' | 'reset' | 'link',
  to?: string,
  href?: string,
  eventName?: string,
  icon?: string,
  title?: string,
  disabled?: boolean
}>();

const emits = defineEmits(['click']);

const onClick = (e: Event) => {
  emits('click');
};

</script>
