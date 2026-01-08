<template>

  <atom-select
    :title="title"
    :required="required"
    :items="taxRateItems"
    v-model="selectedValue">
  </atom-select>

</template>

<script setup lang="ts">

const selectedValue = defineModel<number>();

const props = defineProps<{
  title?: string | null;
  required?: boolean | null;
}>();

interface SystemTaxRatesOption {
  rates: number[];
  default: number;
}

const taxRateItems = ref<{ title: string, value: number }[]>([]);

const { item, loadItem } = useOption('SYSTEM_TAX_RATES');

// Load tax rates from options
const loadTaxRates = async () => {
  await loadItem();

  const optionValue = item.value?.value as SystemTaxRatesOption;

  if (optionValue?.rates) {
    // Sort numerically
    const sortedRates = [...optionValue.rates].sort((a, b) => a - b);

    taxRateItems.value = sortedRates.map(rate => ({
      title: `${rate}%`,
      value: rate
    }));

    // Set default if not already set
    if (selectedValue.value === undefined && optionValue.default !== undefined) {
      selectedValue.value = optionValue.default;
    }
  }
};

onMounted(() => {
  loadTaxRates();
});

</script>
