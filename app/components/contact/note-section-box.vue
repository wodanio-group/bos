<template>

  <PageSectionBox
    :title="$t('contactNoteSectionBox.title')">
    <div class="w-full flex flex-col p-4">

      <contact-note-item 
        class="pb-4"
        mode="create"
        :reset-on-submit="true"
        @update="onUpdate($event)">
      </contact-note-item>

      <contact-note-item 
        class="border-t border-t-gray-200 py-4 last:pb-0"
        :note="note"
        :key="index"
        v-for="(note, index) in computedNotes"
        @update="onUpdate($event, index)"
        @delete="onDelete(index)">
      </contact-note-item>

    </div>
  </PageSectionBox>

</template>

<script setup lang="ts">
import type { CompanyViewModel, ContactNoteViewModel, PersonViewModel } from '~~/shared/types/contact';

const emits = defineEmits<{
  update: [value: Partial<ContactNoteViewModel>[]]
}>();

const props = defineProps<{
  notes: ContactNoteViewModel[];
}>();
const computedNotes = computed(() => props.notes
  .sort((a, b) => (b.timestamp ?? '').localeCompare(a.timestamp ?? '')));

const onUpdate = (value: Partial<ContactNoteViewModel>, index?: number) => {
  let items: Partial<ContactNoteViewModel>[] = computedNotes.value;
  if (index !== undefined && index >= 0 && index <= items.length) {
    items[index] = value;
  } else {
    items.push(value);
  }
  emits('update', items);
};

const onDelete = (index: number) => emits('update', computedNotes.value.filter((item, i) => (i !== index)));

</script>
