<template>

<Icon :icon="icon"></Icon>

</template>

<script setup lang="ts">

import { Icon } from '@iconify/vue';

const props = defineProps<{
  icon: string
}>();

</script>
