<template>

  <div class="flex items-stretch justify-between gap-4">
    <div class="grid grid-cols-1 lg:grid-cols-6 gap-4 w-full">

      <div class="flex flex-col justify-center col-span-1 lg:col-span-2">
        <span class="text-xs text-primary-950/60 font-semibold" v-html="customerId" v-if="customerId"></span>
        <span class="text-primary-950" v-html="name"></span>
      </div>

      <atom-input
        type="text"
        :title="$t('general.role')"
        class="col-span-1 lg:col-span-4"
        v-model="role">
      </atom-input>

    </div>
    <atom-button
      class="flex-1"
      type="button"
      icon="trash-2"
      :outline="true"
      @click="emits('delete')">
    </atom-button>
  </div>

</template>

<script setup lang="ts">

const props = defineProps<{
  contactType: 'company' | 'person',
  item: { id: string, role: string | null },
}>();

const emits = defineEmits<{
  change: [{ id: string, role: string | null }],
  delete: [void],
}>();

const { item, loadItem } = useCrud({
  apiPath: `/api/${props.contactType}`,
  key: props.item.id,
});
await loadItem(props.item.id);

const customerId = computed(() => (item.value && 'customerId' in item.value) ? item.value.customerId : null);
const name = computed(() => (item.value && props.contactType === 'company')
  ? companyDisplayName(item.value as any)
  : (item.value && props.contactType === 'person')
    ? personDisplayName(item.value as any)
    : '?');

const role = ref(props.item.role ?? '');

watch(role, (value: string) => {
  emits('change', {
    ...props.item,
    role: filterString(value),
  });
}, { immediate: true });

</script>
