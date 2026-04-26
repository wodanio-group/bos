<template>

  <div class="relative" ref="wrapperRef">
    <button
      type="button"
      @click="open = !open"
      class="flex items-center gap-1.5 text-sm border border-secondary-200 rounded px-2 py-1.5 bg-white hover:border-secondary-400 focus:outline-none focus:ring-1 focus:ring-primary-500 transition-colors">
      <span>{{ label }}</span>
      <atom-icon icon="chevron-down" class="!text-xs text-secondary-400"/>
    </button>

    <div
      v-if="open"
      class="absolute z-50 top-full mt-1 left-0 bg-white border border-secondary-200 rounded-lg shadow-lg p-3 w-52">
      <div class="flex items-center justify-between mb-2">
        <button
          type="button"
          class="p-1 rounded hover:bg-secondary-100 transition-colors"
          @click="year--">
          <atom-icon icon="chevron-left" class="!text-sm text-secondary-500"/>
        </button>
        <span class="text-sm font-semibold text-secondary-800">{{ year }}</span>
        <button
          type="button"
          class="p-1 rounded hover:bg-secondary-100 transition-colors"
          @click="year++">
          <atom-icon icon="chevron-right" class="!text-sm text-secondary-500"/>
        </button>
      </div>
      <div class="grid grid-cols-3 gap-1">
        <button
          v-for="(name, i) in monthNames"
          :key="i"
          type="button"
          class="px-1 py-1.5 text-xs rounded transition-colors"
          :class="isSelected(i + 1)
            ? 'bg-primary-600 text-white font-semibold'
            : 'text-secondary-700 hover:bg-secondary-100'"
          @click="select(i + 1)">
          {{ name }}
        </button>
      </div>
    </div>
  </div>

</template>

<script setup lang="ts">
import { DateTime } from 'luxon';

const props = defineProps<{ modelValue: string }>();
const emit  = defineEmits<{ (e: 'update:modelValue', v: string): void }>();

const { locale } = useI18n();
const open = ref(false);
const wrapperRef = ref<HTMLElement | null>(null);

const parsed = computed(() => DateTime.fromFormat(props.modelValue, 'yyyy-MM'));
const year   = ref(parsed.value.year);

watch(() => props.modelValue, v => {
  const d = DateTime.fromFormat(v, 'yyyy-MM');
  if (d.isValid) year.value = d.year;
});

const monthNames = computed(() =>
  Array.from({ length: 12 }, (_, i) =>
    DateTime.fromObject({ month: i + 1 }).toFormat('MMM', { locale: locale.value })
  )
);

const label = computed(() =>
  parsed.value.isValid
    ? parsed.value.toFormat('MMM yyyy', { locale: locale.value })
    : props.modelValue
);

const isSelected = (month: number) =>
  parsed.value.year === year.value && parsed.value.month === month;

const select = (month: number) => {
  emit('update:modelValue', DateTime.fromObject({ year: year.value, month }).toFormat('yyyy-MM'));
  open.value = false;
};

const onDocumentClick = (e: MouseEvent) => {
  if (wrapperRef.value && !wrapperRef.value.contains(e.target as Node))
    open.value = false;
};

onMounted(() => document.addEventListener('mousedown', onDocumentClick));
onUnmounted(() => document.removeEventListener('mousedown', onDocumentClick));
</script>
