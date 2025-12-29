<template>

  <div class="flex justify-between items-center gap-4">
    <div>
      <span 
        class="text-xs font-semibold text-secondary-600"
        v-html="$t('general.roleAt', { role: props.item.role ?? '' })"
        v-if="contactType === 'company' && hasRole">
      </span>
      <span 
        class="text-xs font-semibold text-secondary-600"
        v-html="props.item.role"
        v-if="contactType === 'person' && hasRole">
      </span>
      <span 
        class="text-xs font-semibold text-secondary-600"
        v-html="$t('general.'+contactType)"
        v-if="!hasRole">
      </span>
    </div>
    <molecule-link-button
      :to="to"
      :title="name" />
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
const hasRole = computed(() => filterString(props.item.role) !== null);

</script>