<template>

  <div class="flex justify-between items-center gap-4">
    <div>
      <span 
        class="text-xs font-semibold text-secondary-600"
        v-html="$t('general.roleAt', { role: props.item.role ?? '' })"
        v-if="contactType === 'company'">
      </span>
      <span 
        class="text-xs font-semibold text-secondary-600"
        v-html="props.item.role"
        v-if="contactType === 'person'">
      </span>
    </div>
    <NuxtLink
      class="group flex items-center justify-center gap-1 text-sm text-primary-950 p-2 rounded-lg transition-colors overflow-hidden hover:bg-secondary-100"
      :to="to">
      <span v-html="name"></span>
      <atom-icon icon="arrow-right" class="-mr-6 group-hover:mr-0 opacity-80 !text-sm transition-all"></atom-icon>
    </NuxtLink>
  </div>

</template>

<script setup lang="ts">

const props = defineProps<{
  contactType: 'company' | 'person',
  item: { id: string, role: string | null },
}>();

const { item, loadItem } = useCrud({
  apiPath: `/api/${props.contactType}`,
  key: props.item.id,
});
await loadItem(props.item.id);

const to = computed(() => `/${props.contactType}/${props.item.id}`);
const name = computed(() => (item.value && props.contactType === 'company')
  ? companyDisplayName(item.value as any)
  : (item.value && props.contactType === 'person')
    ? personDisplayName(item.value as any)
    : '?');

</script>