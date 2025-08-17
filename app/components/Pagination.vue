<template>

  <div
    class="relative flex justify-start items-center gap-1">
    <button
      type="button"
      :disabled="isFirst === true"
      class="w-8 h-8 relative flex justify-center items-center border border-secondary-200 text-sm text-secondary-600 rounded-lg cursor-pointer transition-colors hover:bg-secondary-50 disabled:opacity-40 disabled:cursor-not-allowed"
      @click="onFirstLast('prev')">
      <Icon icon="lucide:chevron-left" class="text-base"/>
    </button>
    <button
      type="button"
      class="w-8 h-8 relative flex justify-center items-center border border-secondary-200 text-sm text-secondary-600 rounded-lg cursor-pointer transition-colors hover:bg-secondary-50"
      :class="{
        'bg-secondary-50': num.active === true
      }"
      @click="onNumber(num.num)"
      v-for="num in nums">
      <span>{{ num.num }}</span>
    </button>
    <button
      type="button"
      :disabled="isLast === true"
      class="w-8 h-8 relative flex justify-center items-center border border-secondary-200 text-sm text-secondary-600 rounded-lg cursor-pointer transition-colors hover:bg-secondary-50 disabled:opacity-40 disabled:cursor-not-allowed"
      @click="onFirstLast('prev')">
      <Icon icon="lucide:chevron-right" class="text-base"/>
    </button>
  </div>

</template>

<script setup lang="ts">

const props = defineProps<{
  isFirst?: boolean,
  isLast?: boolean,
  state: { take: number, page: number },
}>();

const emit = defineEmits<{
  (event: 'update:isFirst', value: boolean): void,
  (event: 'update:isLast', value: boolean): void,
  (event: 'update:state', value: { take: number, page: number }): void,
}>();

const nums = computed<{ num: number, active?: boolean }[]>(() => {

  return [
    ...((props.isFirst !== true && props.isLast === true && props.state.page > 2) ? [{ num: props.state.page - 2 }] : []),  
    ...((props.isFirst !== true) ? [{ num: props.state.page - 1 }] : []),
    { num: props.state.page, active: true },
    ...((props.isLast !== true) ? [{ num: props.state.page + 1 }] : []),
  ];
});

const onNumber = (page: number) => emit('update:state', {
  ...props.state, page
});

const onFirstLast = (dir: 'prev' | 'next') => { switch (dir) {
  case 'prev':
    return onNumber(props.state.page - 1);
  case 'next':
    return onNumber(props.state.page + 1);
} };

</script>
