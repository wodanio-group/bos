<template>

  <Dialog
    :open="open === true"
    :hideClose="true"
    @update:open="emit('update:open', $event)">
    <p
      v-if="title"
      class="text-lg text-secondary-600">
      {{ title }}
    </p>
    <p
      v-if="description"
      class="text-sm text-primary-950 mt-2">
      {{ description }}
    </p>
    <div
      class="flex justify-end items-center gap-1 mt-4">
      <atom-button
        type="button"
        :title="cancelButtonTitle ?? $t('general.cancel')"
        @click="emit('cancel')">
      </atom-button>
      <atom-button
        type="button"
        :title="submitButtonTitle ?? $t('general.submit')"
        :icon="submitButtonIcon"
        @click="emit('submit')">
      </atom-button>
    </div>
  </Dialog>

</template>

<script setup lang="ts">

const props = defineProps<{
  title?: string,
  description?: string,
  submitButtonTitle?: string,
  submitButtonIcon?: string,
  cancelButtonTitle?: string,
  open?: boolean
}>();

const emit = defineEmits<{
  (event: 'submit'): void,
  (event: 'cancel'): void,
  (event: 'update:open', value: boolean): void,
}>();

</script>
