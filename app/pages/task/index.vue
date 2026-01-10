<template>

  <Page :title="$t('task.title')">

    <DataSectionBox
      class="col-span-12"
      :items="items"
      addActionKey="openAdd"
      itemClickActionKey="openView"
      :fields="[
        { 
          title: $t('task.fields.status'), 
          fieldName: 'doneAt', 
          transform: (v: any) => v ? $t('task.status.done') : $t('task.status.open'), 
          transformIcon: (v: string, i: TaskViewModel) => (i.doneAt !== null ? ({ name: 'circle-check-big', classes: 'text-green-600' }) : undefined)
        },
        { title: $t('task.fields.name'), fieldName: 'name' },
        { title: $t('task.fields.type'), fieldName: 'type', transform: (v: any) => $t(`task.types.${v}`) },
        ...(hasRightUserAllView ? [{ title: $t('task.fields.user'), fieldName: 'userId', transform: (v: any, item: any) => getUserName(item.userId) }] : []),
        { title: $t('task.fields.dueDate'), fieldName: 'dueDateAt', transform: (v: any) => v ? new Date(v).toLocaleDateString() : '-' },
      ]"
      :actions="getTaskActions"
      :paginationState="pagination"
      :paginationIsFirst="paginationIsFirst"
      :paginationIsLast="paginationIsLast"
      :hideAddButto="!(hasRightTaskAllCreate || hasRightTaskOwnCreate)"
      @update:paginationState="paginationSet"
      @updateSearch="searchSet"
      @action="actionHandler">
    </DataSectionBox>

    <!-- Task Form Dialog (Create/Edit) -->
    <Dialog
      :open="openTaskFormDialog"
      @update:open="openTaskFormDialog = $event">
      <template #headerLeft>
        <p class="text-lg text-secondary-600">
          {{ taskFormMode === 'create' ? $t('task.createDialogTitle') : $t('task.edit.title', { name: taskForm.name }) }}
        </p>
      </template>
      <form
        class="flex flex-col gap-2"
        @submit.prevent="onSubmitTaskForm">

        <atom-select
          :required="true"
          :title="$t('task.fields.status')"
          v-model="taskForm.isDone"
          :items="taskStatusOptions"/>

        <atom-select
          :required="true"
          :title="$t('task.fields.type')"
          v-model="taskForm.type"
          :items="taskTypeOptions"/>

        <atom-input
          :required="true"
          type="text"
          :title="$t('task.fields.name')"
          v-model="taskForm.name"/>

        <atom-textarea
          :title="$t('task.fields.content')"
          v-model="taskForm.content"/>

        <div class="grid grid-cols-2 gap-2">
          <atom-input
            type="datetime-local"
            :title="$t('task.fields.startDate')"
            v-model="taskForm.startAt"/>

          <atom-input
            type="datetime-local"
            :title="$t('task.fields.dueDate')"
            v-model="taskForm.dueDateAt"/>
        </div>

        <div class="grid grid-cols-2 gap-2" v-if="hasRightContactAllView">
          <div class="flex flex-col gap-1">
            <label class="text-xs text-gray-600 font-semibold">{{ $t('task.fields.company') }}</label>
            <button
              type="button"
              class="w-full px-4 py-1.5 text-sm text-primary-950 border border-secondary-200 rounded-lg shadow shadow-gray-100 text-left hover:bg-secondary-50 focus:border-gray-500 focus:outline-none focus:ring-0 transition-colors"
              @click="openCompanySearchDialog = true">
              <span v-if="taskForm.companyId">{{ getCompanyName(taskForm.companyId) }}</span>
              <span v-else class="text-secondary-400">{{ $t('task.selectCompany') }}</span>
            </button>
          </div>

          <div class="flex flex-col gap-1">
            <label class="text-xs text-gray-600 font-semibold">{{ $t('task.fields.person') }}</label>
            <button
              type="button"
              class="w-full px-4 py-1.5 text-sm text-primary-950 border border-secondary-200 rounded-lg shadow shadow-gray-100 text-left hover:bg-secondary-50 focus:border-gray-500 focus:outline-none focus:ring-0 transition-colors"
              @click="openPersonSearchDialog = true">
              <span v-if="taskForm.personId">{{ getPersonName(taskForm.personId) }}</span>
              <span v-else class="text-secondary-400">{{ $t('task.selectPerson') }}</span>
            </button>
          </div>
        </div>

        <div class="flex flex-col gap-1" v-if="hasRightUserAllView">
          <label class="text-xs text-gray-600 font-semibold">{{ $t('task.fields.user') }}</label>
          <button
            type="button"
            class="w-full px-4 py-1.5 text-sm text-primary-950 border border-secondary-200 rounded-lg shadow shadow-gray-100 text-left hover:bg-secondary-50 focus:border-gray-500 focus:outline-none focus:ring-0 transition-colors"
            @click="openUserSearchDialog = true">
            <span v-if="taskForm.userId">{{ getUserName(taskForm.userId) }}</span>
            <span v-else class="text-secondary-400">{{ $t('task.selectUser') }}</span>
          </button>
        </div>

        <div class="flex justify-end gap-2 mt-2">
          <atom-button
            v-if="taskFormMode === 'edit'"
            type="button"
            icon="x"
            :title="$t('general.cancel')"
            :outline="true"
            @click="onCancelEdit">
          </atom-button>
          <atom-button
            type="submit"
            icon="save"
            :title="$t('general.save')">
          </atom-button>
        </div>
      </form>
    </Dialog>

    <!-- View Dialog -->
    <Dialog
      :open="openViewDialog === true"
      @update:open="openViewDialog = $event">
      <template #headerLeft>
        <p 
          class="text-lg text-secondary-600"
          v-if="selectedViewItem">{{ selectedViewItem.name }}</p>
      </template>
      <div class="flex flex-col gap-4" v-if="selectedViewItem">

        <!-- Content Section (Full Width) -->
        <div class="flex flex-col gap-1" v-if="selectedViewItem.content">
          <span class="text-sm text-primary-950 whitespace-pre-wrap">{{ selectedViewItem.content }}</span>
        </div>

        <!-- Two Column Grid for Other Information -->
        <div class="grid grid-cols-2 gap-4">
          <div class="flex flex-col gap-1">
            <span class="text-sm text-secondary-500">{{ $t('task.fields.status') }}</span>
            <span class="text-sm text-primary-950">
              <span v-if="selectedViewItem.doneAt" class="text-green-600">
                {{ $t('task.status.done') }}
              </span>
              <span v-else class="text-orange-600">
                {{ $t('task.status.open') }}
              </span>
            </span>
          </div>

          <div class="flex flex-col gap-1">
            <span class="text-sm text-secondary-500">{{ $t('task.fields.type') }}</span>
            <span class="text-sm text-primary-950">{{ $t(`task.types.${selectedViewItem.type}`) }}</span>
          </div>

          <div class="flex flex-col gap-1" v-if="selectedViewItem.startAt">
            <span class="text-sm text-secondary-500">{{ $t('task.fields.startDate') }}</span>
            <span class="text-sm text-primary-950">{{ new Date(selectedViewItem.startAt).toLocaleString() }}</span>
          </div>

          <div class="flex flex-col gap-1" v-if="selectedViewItem.dueDateAt">
            <span class="text-sm text-secondary-500">{{ $t('task.fields.dueDate') }}</span>
            <span class="text-sm text-primary-950">{{ new Date(selectedViewItem.dueDateAt).toLocaleString() }}</span>
          </div>

          <div class="col-span-2 flex flex-col gap-1" v-if="hasRightUserAllView">
            <span class="text-sm text-secondary-500">{{ $t('task.fields.user') }}</span>
            <span class="text-sm text-primary-950">{{ getUserName(selectedViewItem.userId) }}</span>
          </div>

          <div class="flex flex-col gap-1" v-if="hasRightContactAllView && selectedViewItem.companyId">
            <span class="text-sm text-secondary-500">{{ $t('task.fields.company') }}</span>
            <div>
              <molecule-link-button
                :to="`/company/${selectedViewItem.companyId}`"
                :title="getCompanyName(selectedViewItem.companyId)" />
            </div>
          </div>

          <div class="flex flex-col gap-1" v-if="hasRightContactAllView && selectedViewItem.personId">
            <span class="text-sm text-secondary-500">{{ $t('task.fields.person') }}</span>
            <div>
              <molecule-link-button
                :to="`/person/${selectedViewItem.personId}`"
                :title="getPersonName(selectedViewItem.personId)" />
            </div>
          </div>

          <div class="flex flex-col gap-1" v-if="selectedViewItem.doneAt">
            <span class="text-sm text-secondary-500">{{ $t('task.fields.doneDate') }}</span>
            <span class="text-sm text-primary-950">{{ new Date(selectedViewItem.doneAt).toLocaleString() }}</span>
          </div>
        </div>

        <!-- Action Buttons at Bottom -->
        <div class="flex justify-end gap-2 mt-2">
          <atom-button
            v-if="hasRightTaskAllEdit || hasRightTaskOwnEdit"
            type="button"
            icon="square-pen"
            :title="$t('general.edit')"
            :outline="true"
            @click="openEditFromView">
          </atom-button>
          <atom-button
            v-if="hasRightTaskAllDelete || hasRightTaskOwnDelete"
            type="button"
            icon="trash-2"
            :title="$t('general.delete')"
            :outline="true"
            @click="requestDeleteFromView">
          </atom-button>
        </div>
      </div>
    </Dialog>

    <!-- Delete Confirmation Dialog -->
    <SimpleAlertDialog
      :open="selectedDeleteItem !== null"
      :title="$t('task.deleteTitle', { name: selectedDeleteItem?.name ?? '?' })"
      :description="$t('task.deleteDescription')"
      :submitButtonTitle="$t('general.delete')"
      submitButtonIcon="trash-2"
      @submit="onDelete"
      @cancel="selectedDeleteItem = null"
      @update:open="!$event && (selectedDeleteItem = null)"/>

    <!-- User Search Dialog -->
    <molecule-dialog-entity-search
      :open="openUserSearchDialog"
      :title="$t('task.selectUser')"
      :search-fn="searchUsers"
      @select="(id) => { taskForm.userId = id; openUserSearchDialog = false; }"
      @close="openUserSearchDialog = false"/>

    <!-- Company Search Dialog -->
    <molecule-dialog-entity-search
      :open="openCompanySearchDialog"
      :title="$t('task.selectCompany')"
      :search-fn="searchCompanies"
      @select="(id) => { taskForm.companyId = id; openCompanySearchDialog = false; }"
      @close="openCompanySearchDialog = false"/>

    <!-- Person Search Dialog -->
    <molecule-dialog-entity-search
      :open="openPersonSearchDialog"
      :title="$t('task.selectPerson')"
      :search-fn="searchPersons"
      @select="(id) => { taskForm.personId = id; openPersonSearchDialog = false; }"
      @close="openPersonSearchDialog = false"/>

  </Page>

</template>

<script setup lang="ts">

import type { CompanyViewModel, PersonViewModel } from '~~/shared/types/contact';
import type { TaskViewModel } from '~~/shared/types/task';
import type { UserViewModel } from '~~/shared/types/user';
import { TaskTypes } from '~~/shared/utils/task';

definePageMeta({
  middleware: ['auth']
});

const auth = useAuth();
const user = await auth.getUser();
const toast = useToast();

const {
  items,
  loadItems,
  pagination,
  paginationIsFirst,
  paginationIsLast,
  paginationSet,
  searchSet,
  create,
  upsert,
  deleteById,
  sortSet,
} = useCrud<TaskViewModel>({
  apiPath: '/api/task'
});
sortSet('createdAt', 'desc');
await loadItems();

const hasRightTaskAllCreate = computed(() => user && user.rights.includes('task.all.create')),
      hasRightTaskOwnCreate = computed(() => user && user.rights.includes('task.own.create')),
      hasRightTaskAllEdit = computed(() => user && user.rights.includes('task.all.edit')),
      hasRightTaskOwnEdit = computed(() => user && user.rights.includes('task.own.edit')),
      hasRightTaskAllDelete = computed(() => user && user.rights.includes('task.all.delete')),
      hasRightTaskOwnDelete = computed(() => user && user.rights.includes('task.own.delete')),
      hasRightUserAllView = computed(() => user && user.rights.includes('user.all.view')),
      hasRightContactAllView = computed(() => user && user.rights.includes('contact.all.view'));

// Dynamic actions based on task status
const getTaskActions = (item: TaskViewModel) => {
  const actions: { title: string; icon: string; key: string }[] = [];

  // Toggle done/open action with dynamic label and icon
  if (hasRightTaskAllEdit.value || hasRightTaskOwnEdit.value) {
    if (item.doneAt) {
      // Task is done, show "Set open"
      actions.push({ title: $t('task.toggleDone.setOpen'), icon: 'circle-x', key: 'toggleDone' });
    } else {
      // Task is open, show "Set done"
      actions.push({ title: $t('task.toggleDone.setDone'), icon: 'circle-check', key: 'toggleDone' });
    }
  }

  // Edit action
  if (hasRightTaskAllEdit.value || hasRightTaskOwnEdit.value) {
    actions.push({ title: $t('general.edit'), icon: 'square-pen', key: 'openEdit' });
  }

  // Delete action
  if (hasRightTaskAllDelete.value || hasRightTaskOwnDelete.value) {
    actions.push({ title: $t('general.delete'), icon: 'trash-2', key: 'requestDelete' });
  }

  return actions;
};

// User data cache
const usersCache = ref<Map<string, UserViewModel>>(new Map());
const companiesCache = ref<Map<string, CompanyViewModel>>(new Map());
const personsCache = ref<Map<string, PersonViewModel>>(new Map());

// Helper function to get user name
const getUserName = (userId: string): string => {
  const cachedUser = usersCache.value.get(userId);
  if (cachedUser)
    return userDisplayName(cachedUser);

  // Fetch user data asynchronously
  $fetch(`/api/user/${userId}`).then((userData: any) => {
    usersCache.value.set(userId, userData);
  }).catch(() => {});

  return $t('general.loading');
};

// Helper function to get company name
const getCompanyName = (companyId: string | null): string => {
  if (!companyId) return '-';
  const cachedCompany = companiesCache.value.get(companyId);
  if (cachedCompany) return companyDisplayName(cachedCompany);

  // Fetch company data asynchronously
  $fetch(`/api/company/${companyId}`).then((companyData: any) => {
    companiesCache.value.set(companyId, companyData);
  }).catch(() => {});

  return $t('general.loading');
};

// Helper function to get person name
const getPersonName = (personId: string | null): string => {
  if (!personId) return '-';
  const cachedPerson = personsCache.value.get(personId);
  if (cachedPerson) 
    return personDisplayName(cachedPerson);

  // Fetch person data asynchronously
  $fetch(`/api/person/${personId}`).then((personData: any) => {
    personsCache.value.set(personId, personData);
  }).catch(() => {});

  return $t('general.loading');
};

const taskTypeOptions = computed(() => TaskTypes.map(type => ({
  value: type,
  title: $t(`task.types.${type}`)
})));

const taskStatusOptions = computed(() => [
  { value: 'done', title: $t('task.status.done') },
  { value: 'open', title: $t('task.status.open') }
]);

// Helper functions for datetime conversion
const formatDateTimeLocal = (isoString: string | null): string => {
  if (!isoString) return '';
  const date = new Date(isoString);
  const offset = date.getTimezoneOffset() * 60000;
  const localDate = new Date(date.getTime() - offset);
  return localDate.toISOString().slice(0, 16);
};

const parseDateTimeLocal = (localString: string): string | null => {
  if (!localString) return null;
  return new Date(localString).toISOString();
};

// Task form dialog state (combined create/edit)
const openTaskFormDialog = ref(false);
const taskFormMode = ref<'create' | 'edit'>('create');
const selectedEditItem = ref<TaskViewModel | null>(null);
const defaultTaskForm = {
  type: 'ACTION' as const,
  name: '',
  content: '',
  startAt: '',
  dueDateAt: '',
  isDone: 'open',
  userId: user?.id ?? null,
  companyId: null as string | null,
  personId: null as string | null,
};
const taskForm = reactive({ ...defaultTaskForm });

// View dialog state
const openViewDialog = ref(false);
const selectedViewItem = ref<TaskViewModel | null>(null);

// Delete state
const selectedDeleteItem = ref<TaskViewModel | null>(null);

// Search dialog states (unified for both create and edit)
const openUserSearchDialog = ref(false);
const openCompanySearchDialog = ref(false);
const openPersonSearchDialog = ref(false);

// Search functions
const searchUsers = async (query: string) => {
  const results = await $fetch<any[]>(`/api/user?search=${query}&take=20`);
  return results.map(u => {
    const firstName = u.firstName || '';
    const lastName = u.lastName || '';
    const fullName = `${firstName} ${lastName}`.trim() || u.email || u.id;
    return {
      id: u.id,
      title: fullName,
      subtitle: u.email
    };
  }).sort((a, b) => a.title.localeCompare(b.title));
};

const searchCompanies = async (query: string) => {
  const results = await $fetch<any[]>(`/api/company?search=${query}&take=20`);
  return results.map(c => ({
    id: c.id,
    title: companyDisplayName(c),
    subtitle: c.customerId ?? null
  })).sort((a, b) => a.title.localeCompare(b.title));
};

const searchPersons = async (query: string) => {
  const results = await $fetch<any[]>(`/api/person?search=${query}&take=20`);
  return results.map(p => ({
    id: p.id,
    title: personDisplayName(p),
    subtitle: p.externalId ?? null
  })).sort((a, b) => a.title.localeCompare(b.title));
};

// Action handlers
const actionHandler = async (key: string, item?: TaskViewModel | null) => {
  switch (key) {
    case 'openAdd':
      taskFormMode.value = 'create';
      Object.assign(taskForm, defaultTaskForm);
      selectedEditItem.value = null;
      openTaskFormDialog.value = true;
      break;
    case 'openView':
      if (!item) return;
      selectedViewItem.value = item;
      openViewDialog.value = true;
      break;
    case 'openEdit':
      if (!item) return;
      taskFormMode.value = 'edit';
      selectedEditItem.value = item;
      taskForm.type = item.type;
      taskForm.name = item.name;
      taskForm.content = item.content ?? '';
      taskForm.startAt = formatDateTimeLocal(item.startAt);
      taskForm.dueDateAt = formatDateTimeLocal(item.dueDateAt);
      taskForm.isDone = item.doneAt ? 'done' : 'open';
      taskForm.userId = item.userId;
      taskForm.companyId = item.companyId;
      taskForm.personId = item.personId;
      openTaskFormDialog.value = true;
      break;
    case 'requestDelete':
      selectedDeleteItem.value = item ?? null;
      break;
    case 'toggleDone':
      if (!item) return;
      await toggleTaskDone(item);
      break;
  }
};

const onSubmitTaskForm = async () => {
  if (taskFormMode.value === 'create') {
    try {
      const createdItem = await create({
        type: taskForm.type,
        name: taskForm.name,
        content: taskForm.content || null,
        startAt: parseDateTimeLocal(taskForm.startAt),
        dueDateAt: parseDateTimeLocal(taskForm.dueDateAt),
        doneAt: taskForm.isDone === 'done' ? new Date().toISOString() : null,
        userId: taskForm.userId ?? user?.id,
        companyId: taskForm.companyId,
        personId: taskForm.personId,
      } as any);

      if (createdItem === null) {
        return toast.add({ type: 'error', title: $t('task.createError', { name: taskForm.name }) });
      }

      toast.add({ type: 'success', title: $t('task.createSuccess', { name: createdItem.name }) });
      Object.assign(taskForm, defaultTaskForm);
      openTaskFormDialog.value = false;
      await loadItems();
    } catch (e) {
      toast.add({ type: 'error', title: $t('task.createError', { name: taskForm.name }) });
    }
  } else {
    // Edit mode
    try {
      if (!selectedEditItem.value) return;

      await upsert({
        ...selectedEditItem.value,
        type: taskForm.type,
        name: taskForm.name,
        content: taskForm.content || null,
        startAt: parseDateTimeLocal(taskForm.startAt),
        dueDateAt: parseDateTimeLocal(taskForm.dueDateAt),
        doneAt: taskForm.isDone === 'done' ? (selectedEditItem.value.doneAt || new Date().toISOString()) : null,
        userId: taskForm.userId ?? selectedEditItem.value.userId,
        companyId: taskForm.companyId,
        personId: taskForm.personId,
      });

      toast.add({ type: 'success', title: $t('task.edit.toast.success') });
      openTaskFormDialog.value = false;
      selectedEditItem.value = null;
      await loadItems();
    } catch (e) {
      toast.add({ type: 'error', title: $t('task.edit.toast.error') });
    }
  }
};

const openEditFromView = () => {
  if (!selectedViewItem.value) return;
  openViewDialog.value = false;
  actionHandler('openEdit', selectedViewItem.value);
};

const onCancelEdit = () => {
  openTaskFormDialog.value = false;
  if (selectedEditItem.value) {
    selectedViewItem.value = selectedEditItem.value;
    openViewDialog.value = true;
  }
};

const requestDeleteFromView = () => {
  if (!selectedViewItem.value) return;
  selectedDeleteItem.value = selectedViewItem.value;
  openViewDialog.value = false;
};

const toggleTaskDone = async (item: TaskViewModel) => {
  try {
    const newDoneAt = item.doneAt ? null : new Date().toISOString();

    await upsert({
      ...item,
      doneAt: newDoneAt,
    });

    toast.add({
      type: 'success',
      title: newDoneAt
        ? $t('task.toggleDone.markedDone', { name: item.name })
        : $t('task.toggleDone.markedOpen', { name: item.name })
    });

    await loadItems();
  } catch (e) {
    toast.add({ type: 'error', title: $t('task.toggleDone.error') });
  }
};

const onDelete = async () => {
  try {
    if (!selectedDeleteItem.value) return;

    await deleteById(selectedDeleteItem.value.id);
    toast.add({ type: 'success', title: $t('task.deleteSuccessToast', { name: selectedDeleteItem.value.name }) });
    selectedDeleteItem.value = null;
    await loadItems();
  } catch (e) {
    toast.add({ type: 'error', title: $t('task.deleteErrorToast', { name: selectedDeleteItem.value?.name ?? '?' }) });
  }
};

</script>
