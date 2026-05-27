<template>

  <PageSectionBox :title="$t('contactNoteSectionBox.title')">
    <div class="w-full flex flex-col p-4">

      <contact-note-item
        class="pb-4"
        mode="create"
        :reset-on-submit="true"
        @update="onUpdate($event)"
        v-if="disableChanges !== true">
      </contact-note-item>

      <contact-note-item
        class="border-t border-t-gray-200 py-4 last:pb-0"
        :disable-changes="disableChanges === true"
        :note="note as any"
        :key="index"
        v-for="(note, index) in computedNotes"
        @update="onUpdate($event, index)"
        @delete="onDelete(index)">
      </contact-note-item>

      <div
        class="flex justify-center items-center w-full py-2"
        v-if="disableChanges === true && computedNotes.length <= 0">
        <p class="text-xs text-gray-400 leading-none text-center" v-html="$t('general.noItemsFound')"></p>
      </div>

    </div>
  </PageSectionBox>

</template>

<script setup lang="ts">
import type { ProjectNoteViewModel } from '~~/shared/types/project';
import type { ContactNoteViewModel } from '~~/shared/types/contact';

const emits = defineEmits<{
  update: [value: Partial<ProjectNoteViewModel>[]]
}>();

const props = defineProps<{
  disableChanges?: boolean;
  notes: ProjectNoteViewModel[];
}>();

const computedNotes = computed(() =>
  props.notes.slice().sort((a, b) => (b.timestamp ?? '').localeCompare(a.timestamp ?? ''))
);

const onUpdate = (value: Partial<ContactNoteViewModel>, index?: number) => {
  let items: Partial<ProjectNoteViewModel>[] = [...computedNotes.value];
  if (index !== undefined && index >= 0 && index <= items.length) {
    items[index] = value as Partial<ProjectNoteViewModel>;
  } else {
    items.push(value as Partial<ProjectNoteViewModel>);
  }
  emits('update', items);
};

const onDelete = (index: number) => emits('update', computedNotes.value.filter((_, i) => i !== index));
</script>
