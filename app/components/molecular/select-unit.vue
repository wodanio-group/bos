<template>

  <atom-select
    :title="title"
    :required="required"
    :items="unitItems"
    v-model="selectedValue">
  </atom-select>

</template>

<script setup lang="ts">

const selectedValue = defineModel<string>();

const props = defineProps<{
  title?: string | null;
  required?: boolean | null;
}>();

interface SystemUnitsOption {
  units: string[];
  default: string;
}

const unitItems = ref<{ title: string, value: string }[]>([]);

const { item, loadItem } = useOption('SYSTEM_UNITS');

// Load units from options
const loadUnits = async () => {
  await loadItem();

  const optionValue = item.value?.value as SystemUnitsOption;

  if (optionValue?.units) {
    // Sort alphabetically
    const sortedUnits = [...optionValue.units].sort((a, b) => a.localeCompare(b));

    unitItems.value = sortedUnits.map(unit => ({
      title: unit,
      value: unit
    }));

    // Set default if not already set
    if (!selectedValue.value && optionValue.default) {
      selectedValue.value = optionValue.default;
    }
  }
};

onMounted(() => {
  loadUnits();
});

</script>
