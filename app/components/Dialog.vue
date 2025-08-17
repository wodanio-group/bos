<template>

  <div
    v-if="open === true"
    class="fixed top-0 left-0 w-full h-full z-[998]">
    <div 
      class="absolute top-0 left-0 w-full h-full backdrop-blur-sm z-[998]"
      @click="emit('update:open', false)">
    </div>
    <div
      class="fixed flex flex-col top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[500px] translate-x-[-50%] translate-y-[-50%] p-4 bg-white border border-secondary-200 rounded-xl shadow-xl shadow-secondary-100 z-[999]">
      <button
        type="button"
        class="absolute top-2 right-2 h-7 w-7 rounded-lg flex items-center justify-center bg-secondary-100 transition-colors border border-secondary-200 hover:bg-secondary-200"
        v-if="hideClose !== true"
        @click="emit('update:open', false)">
        <Icon icon="lucide:x" class="text-lg text-secondary-800"/>
      </button>
      <slot></slot>
      <div
        class="flex justify-end items-center gap-2"
        v-if="slots.buttons">
        <slot name="buttons"></slot>
      </div>
    </div>
  </div>

</template>

<script setup lang="ts">

const slots = useSlots();

const props = defineProps<{
  open?: boolean,
  hideClose?: boolean
}>();

const emit = defineEmits<{
  (event: 'update:open', value: boolean): void,
}>();

</script>
