<template>

  <div class="flex gap-4">
    <div class="w-full grid grid-cols-1 lg:grid-cols-6 gap-4">

      <atom-select
        :title="$t('general.category')"
        :items="ContactCommunicationWayCategories.map(o => ({ title: $t(`contactCommunicationWayCategories.${o}`), value: o }))"
        class="col-span-1 lg:col-span-2"
        v-model="values.category">
      </atom-select>

      <atom-input
        type="text"
        :title="$t('general.value')"
        class="col-span-1 lg:col-span-4"
        v-model="values.value">
      </atom-input>

    </div>
    <div class="flex-1 flex items-strech">
      <atom-button
        type="button"
        icon="trash"
        :outline="true"
        @click="emits('remove')">
      </atom-button>
    </div>
  </div>

</template>

<script setup lang="ts">
import type { ContactCommunicationWayViewModel } from '~~/shared/types/contact';
import { ContactCommunicationWayCategories } from '~~/shared/utils/contact';

const emits = defineEmits<{
  change: [value: Partial<ContactCommunicationWayViewModel>],
  remove: [],
}>();

const props = defineProps<{
  communicationWay?: Partial<ContactCommunicationWayViewModel>
}>();

const values = ref({
  category: props.communicationWay?.category ?? 'WORK',
  value: props.communicationWay?.value ?? '',
});

watch(values, () => {
  emits('change', {
    ...props.communicationWay,
    ...values.value,
  });
}, { deep: true, immediate: true });

</script>
