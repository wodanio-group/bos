<template>

  <label :class="compact ? 'flex' : 'w-full flex flex-col gap-1 relative'">
    <span v-if="title && !compact" class="text-xs text-gray-600 font-semibold">{{ title }}</span>
    <select
      :class="compact
        ? 'text-sm border border-secondary-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 bg-white'
        : 'w-full px-4 py-1.5 text-sm text-primary-950 border border-secondary-200 rounded-lg shadow shadow-gray-100 focus:border-gray-500 focus:outline-none focus:ring-0'"
      :value="modelValue ?? ''"
      @change="onSelect($event)">
      <option v-if="nullLabel !== undefined" value="">{{ nullLabel }}</option>
      <option
        v-for="option in visibleOptions"
        :key="option.id"
        :value="option.id">
        {{ option.label }}
      </option>
    </select>
  </label>

</template>

<script setup lang="ts">

type CostCenter = { id: string; name: string; alias: string; parentId: string | null };
type FlatOption = { id: string; label: string };

const props = defineProps<{
  modelValue?: string | null;
  title?: string;
  nullLabel?: string;
  excludeIds?: string[];
  compact?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | null): void;
}>();

const onSelect = (event: Event) => {
  const val = (event.target as HTMLSelectElement).value;
  emit('update:modelValue', val || null);
};

const items = ref<CostCenter[]>([]);

onMounted(async () => {
  try {
    const result = await $fetch<{ items: CostCenter[] }>('/api/pes/cost-center', {
      query: { take: 999999, order: 'ASC' },
    });
    items.value = result.items;
  } catch {
    // empty list shown on error
  }
});

const flatOptions = computed<FlatOption[]>(() => {
  const byParent = new Map<string | null, CostCenter[]>();
  for (const item of items.value) {
    const key = item.parentId ?? null;
    if (!byParent.has(key)) byParent.set(key, []);
    byParent.get(key)!.push(item);
  }
  const result: FlatOption[] = [];
  function visit(parentId: string | null, depth: number) {
    for (const node of byParent.get(parentId) ?? []) {
      const prefix = depth > 0 ? '-'.repeat(depth) + ' ' : '';
      result.push({ id: node.id, label: prefix + node.name });
      visit(node.id, depth + 1);
    }
  }
  visit(null, 0);
  return result;
});

const visibleOptions = computed(() => {
  if (!props.excludeIds?.length) return flatOptions.value;
  const excluded = new Set(props.excludeIds);
  return flatOptions.value.filter(o => !excluded.has(o.id));
});

</script>
