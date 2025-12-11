<template>

  <div class="flex gap-4">
    <div class="w-full grid grid-cols-1 lg:grid-cols-6 gap-4">

      <atom-select
        :title="$t('general.category')"
        :items="ContactAddressCategories.map(o => ({ title: $t(`contactAddressCategories.${o}`), value: o }))"
        class="col-span-1 lg:col-span-6"
        v-model="values.category">
      </atom-select>

      <atom-input
        type="text"
        :title="$t('general.address')"
        class="col-span-1 lg:col-span-3"
        v-model="values.address">
      </atom-input>

      <atom-input
        type="text"
        :title="$t('general.address2')"
        class="col-span-1 lg:col-span-3"
        v-model="values.address2">
      </atom-input>

      <atom-input
        type="text"
        :title="$t('general.zipCode')"
        class="col-span-1 lg:col-span-2"
        v-model="values.zipCode">
      </atom-input>

      <atom-input
        type="text"
        :title="$t('general.city')"
        class="col-span-1 lg:col-span-4"
        v-model="values.city">
      </atom-input>

      <atom-select
        :title="$t('general.country')"
        :items="CountryCodes.map(o => ({ title: $t(`countries.${o}`), value: o }))"
        class="col-span-1 lg:col-span-6"
        v-model="values.country">
      </atom-select>

    </div>
    <div class="flex-1">
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
import { ContactAddressCategories, CountryCodes } from '~~/shared/utils/contact';

const emits = defineEmits<{
  change: [value: Partial<ContactAddressViewModel>],
  remove: [],
}>();

const props = defineProps<{
  contactAddress?: Partial<ContactAddressViewModel>
}>();

const values = ref({
  category: props.contactAddress?.category ?? 'WORK',
  address: props.contactAddress?.address ?? '',
  address2: props.contactAddress?.address2 ?? '',
  zipCode: props.contactAddress?.zipCode ?? '',
  city: props.contactAddress?.city ?? '',
  country: props.contactAddress?.country ?? 'DE'
});

watch(values, () => {
  emits('change', {
    ...values.value,
    address: filterString(values.value.address),
    address2: filterString(values.value.address2),
    zipCode: filterString(values.value.zipCode),
    city: filterString(values.value.city),
  });
}, { deep: true, immediate: true });

</script>
