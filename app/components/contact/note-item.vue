<template>

  <div>

    <div
      class="flex flex-col gap-4"
      v-if="computedMode === 'view' && note">
      <p
        class="text-sm text-primary-950"
        v-html="note.content.replace(/\n/g, '<br>')">
      </p>
      <div class="flex items-center justify-start gap-3 text-sm text-gray-500">
        <div class="flex items-center gap-1">
          <span class="font-semibold" v-html="$t(`contactNoteTypes.${note.type}`)"></span>
          <span v-html="$t('contactNoteSectionBox.input.from')"></span>
          <span v-html="formatedTimestamp"></span>
        </div>
        <span>|</span>
        <button
          type="button"
          class="hover:underline outline-none"
          @click="overwriteMode = 'input'">
          <span v-html="$t('contactNoteSectionBox.input.edit')"></span>
        </button>
        <span>|</span>
        <button
          type="button"
          class="hover:underline outline-none"
          @click="showDelete = true">
          <span v-html="$t('contactNoteSectionBox.input.delete')"></span>
        </button>
      </div>
    </div>

    <form
      class="grid grid-cols-12 gap-4"
      v-if="computedMode === 'create' || computedMode === 'input'"
      @submit.prevent="onSubmit">
      <atom-textarea
        v-model="formValues.content"
        :title="$t('contactNoteSectionBox.input.content')"
        class="col-span-9"
        @keydown.meta.enter.prevent="onSubmit">
      </atom-textarea>
      <div class="flex flex-col gap-4 items-start col-span-3">
        <atom-select
          v-model="formValues.type"
          :title="$t('contactNoteSectionBox.input.type')"
          :items="contactNoteTypes">
        </atom-select>
        <atom-input
          type="datetime-local"
          v-model="formValues.timestamp"
          :title="$t('contactNoteSectionBox.input.timestamp')"
          v-if="computedMode === 'input'">
        </atom-input>
        <atom-button
          type="submit"
          :title="$t(`contactNoteSectionBox.input.submit.${computedMode}`)">
        </atom-button>
      </div>
    </form>

    <Dialog
      :open="showDelete === true"
      @update:open="showDelete = $event">

    </Dialog>

    <SimpleAlertDialog
      :open="showDelete === true"
      :title="$t('contactNoteSectionBox.delete.title')"
      :description="$t('contactNoteSectionBox.delete.description')"
      :submitButtonTitle="$t('general.delete')"
      submitButtonIcon="lucide:trash-2"
      @submit="onDelete()"
      @cancel="showDelete = false"
      @update:open="showDelete = $event"/>

  </div>

</template>

<script setup lang="ts">
import { DateTime } from 'luxon';
import type { ContactNoteViewModel } from '~~/shared/types/contact';

const emits = defineEmits<{
  update: [value: Partial<ContactNoteViewModel>]
  delete: []
}>();

const props = defineProps<{
  mode?: 'create' | 'input' | 'view',
  resetOnSubmit?: boolean,
  note?: ContactNoteViewModel,
}>();
const overwriteMode = ref<'create' | 'input' | 'view' | null>(null);
const computedMode = computed(() => overwriteMode.value ?? props.mode ?? (props.note ? 'view' : 'input'));
const contactNoteTypes = computed(() => ContactNoteTypes.map(k => ({ title: $t('contactNoteTypes.'+k), value: k })));

const formatedTimestamp = computed(() => (props.note && props.note.timestamp) ? DateTime.fromISO(props.note.timestamp).toFormat($t('format.datetime')) : null);

const getDefaultFormValues = () => ({
  type: props.note?.type ?? 'NOTE',
  timestamp: (props.note?.timestamp ? DateTime.fromISO(props.note.timestamp) : DateTime.now()).toFormat('yyyy-LL-dd\'T\'HH:mm'),
  content: props.note?.content ?? ''
});
const formValues = ref(getDefaultFormValues());

const onSubmit = () => {
  if (formValues.value.content.length <= 0)
    return;
  emits('update', {
    ...formValues.value,
    timestamp: (formValues.value.timestamp ? DateTime.fromISO(formValues.value.timestamp) : DateTime.now()).setZone('UTC').toISO()
  });
  if (props.resetOnSubmit === true) {
    formValues.value = getDefaultFormValues();
  } else {
    overwriteMode.value = 'view';
  }
};

const showDelete = ref(false);
const onDelete = () => {
  showDelete.value = false;
  emits('delete');
};

</script>
