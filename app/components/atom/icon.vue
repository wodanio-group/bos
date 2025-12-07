<template>

  <i class="!leading-[1]" :class="classes"></i>

</template>

<script setup lang="ts">

const props = defineProps<{
  icon: string,
}>();

const classes = computed(() => `icon-${props.icon}`);

</script>
