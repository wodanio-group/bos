<template>

  <slot></slot>

</template>

<script setup lang="ts">

const globalLayout = useGlobalLayout();

useHead({
  title: globalLayout.siteTitle,
});

</script>
