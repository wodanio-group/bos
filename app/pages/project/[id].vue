<template>

  <Page
    v-if="item"
    :title="item.name"
    :subtitle="$t('project.item.subtitle')">
    <template #header>
      <atom-button
        type="button"
        icon="square-pen"
        :title="$t('general.edit')"
        :outline="true"
        @click="navigateTo(`/project/edit/${item.id}`)"
        v-if="canEdit">
      </atom-button>
      <atom-button
        type="button"
        icon="trash-2"
        :title="$t('general.delete')"
        :outline="true"
        @click="showDeletePopover = true"
        v-if="canDelete">
      </atom-button>
    </template>

    <div class="col-span-8">
      <project-note-section-box
        :disable-changes="!canEditNotes"
        :notes="item.notes"
        @update="onUpdateNotes($event)">
      </project-note-section-box>
    </div>

    <div class="col-span-4 flex flex-col gap-4">
      <PageSectionBox :title="$t('project.item.infoTitle')">
        <div class="flex flex-col gap-3 p-4 text-sm">
          <div class="flex flex-col gap-0.5">
            <span class="text-xs text-gray-500 font-semibold">{{ $t('project.fields.status') }}</span>
            <span class="text-primary-950">{{ $t('projectStatuses.' + item.status) }}</span>
          </div>
          <div class="flex flex-col gap-0.5" v-if="item.description">
            <span class="text-xs text-gray-500 font-semibold">{{ $t('project.fields.description') }}</span>
            <span class="text-primary-950 whitespace-pre-wrap">{{ item.description }}</span>
          </div>
          <div class="flex flex-col items-start gap-0.5">
            <span class="text-xs text-gray-500 font-semibold">{{ $t('project.fields.company') }}</span>
            <molecule-link-button
              v-if="item.companyId"
              :to="`/company/${item.companyId}`"
              :title="item.companyName ?? item.companyId"/>
            <span v-else class="text-gray-400 italic">{{ $t('project.internal') }}</span>
          </div>
        </div>
      </PageSectionBox>

      <PageSectionBox :title="$t('project.item.membersTitle')">
        <div class="flex flex-col p-4 gap-2">
          <div
            v-if="item.members.length === 0"
            class="flex justify-center items-center py-2">
            <p class="text-xs text-gray-400">{{ $t('general.noItemsFound') }}</p>
          </div>
          <div
            v-for="member in item.members"
            :key="member.id"
            class="flex items-center justify-between py-2 border-b border-b-gray-100 last:border-b-0 gap-2">
            <div class="flex flex-col min-w-0">
              <span class="text-sm text-primary-950 font-medium truncate">{{ member.userDisplayName ?? member.userEmail }}</span>
              <span class="text-xs text-gray-500 truncate">{{ member.userEmail }}</span>
            </div>
            <span class="shrink-0 text-xs px-2 py-0.5 rounded-full bg-secondary-100 text-secondary-600 font-semibold">
              {{ $t('projectMemberRoles.' + member.role) }}
            </span>
          </div>
        </div>
      </PageSectionBox>
    </div>

    <SimpleAlertDialog
      :open="showDeletePopover === true"
      :title="$t('project.item.delete.title', { name: item.name })"
      :description="$t('project.item.delete.description')"
      :submitButtonTitle="$t('general.delete')"
      submitButtonIcon="trash-2"
      @submit="onDelete"
      @cancel="showDeletePopover = false"
      @update:open="showDeletePopover = $event"/>

  </Page>

</template>

<script setup lang="ts">
import type { ProjectViewModel, ProjectNoteViewModel } from '~~/shared/types/project';

definePageMeta({
  middleware: ['auth']
});

const auth = useAuth();
const user = await auth.getUser();
const toast = useToast();

const { item, upsert, loadItem, deleteById } = useCrud<ProjectViewModel>({
  apiPath: '/api/project'
});
await loadItem();

const memberEntry = computed(() => item.value?.members.find(m => m.userId === user?.id));
const isManager = computed(() => memberEntry.value?.role === 'MANAGER');

const canEdit = computed(() =>
  user?.rights.includes('project.all.edit') || isManager.value
);
const canDelete = computed(() =>
  user?.rights.includes('project.all.delete') || isManager.value
);
// Members can edit their own notes too
const canEditNotes = computed(() =>
  user?.rights.includes('project.all.edit') || !!memberEntry.value
);

const onUpdateNotes = async (notes: Partial<ProjectNoteViewModel>[]) => {
  try {
    if (!item.value) return;
    await upsert({ ...item.value, notes: notes as any });
    await loadItem();
    toast.add({ type: 'success', title: $t('project.notes.toast.success') });
  } catch (e) {
    toast.add({ type: 'error', title: $t('project.notes.toast.error') });
  }
};

const showDeletePopover = ref(false);
const onDelete = async () => {
  try {
    if (!item.value) return;
    await deleteById(item.value.id);
    toast.add({ type: 'success', title: $t('project.item.delete.success') });
    navigateTo('/project');
  } catch (e) {
    toast.add({ type: 'error', title: $t('project.item.delete.error') });
  }
};
</script>
