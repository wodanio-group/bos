<template>


</template>

<script setup lang="ts">
import type { ContactViewModel } from '~~/shared/types/contact';

const emits = defineEmits<{
  change: [value: ContactViewModel]
}>();

const props = defineProps<{
  contact?: ContactViewModel | null,
}>();
const contactType = computed<'company' | 'person'>(() => (props.contact && 'firstname' in props.contact) ? 'person' : 'company');

</script>
