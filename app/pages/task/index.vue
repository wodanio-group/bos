<template>

  <Page :title="$t('task.title')">

    <DataSectionBox
      class="col-span-12"
      :items="items"
      addActionKey="openAdd"
      itemClickActionKey="openView"
      :fields="[
        { title: $t('task.fields.status'), fieldName: 'doneAt', transform: (v: any) => v ? $t('task.status.done') : $t('task.status.open') },
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

    <!-- Create Dialog -->
    <Dialog
      :open="openCreateDialog === true"
      @update:open="openCreateDialog = $event">
      <form
        class="flex flex-col gap-2"
        @submit.prevent="onCreate">
        <p class="text-lg text-secondary-600">{{ $t('task.createDialogTitle') }}</p>

        <atom-select
          :required="true"
          :title="$t('task.fields.type')"
          v-model="createForm.type"
          :items="taskTypeOptions"/>

        <atom-input
          :required="true"
          type="text"
          :title="$t('task.fields.name')"
          v-model="createForm.name"/>

        <atom-textarea
          :title="$t('task.fields.content')"
          v-model="createForm.content"/>

        <atom-input
          type="datetime-local"
          :title="$t('task.fields.startDate')"
          v-model="createForm.startAt"/>

        <atom-input
          type="datetime-local"
          :title="$t('task.fields.dueDate')"
          v-model="createForm.dueDateAt"/>

        <atom-select
          :required="true"
          :title="$t('task.fields.status')"
          v-model="createForm.isDone"
          :items="taskStatusOptions"/>

        <div class="flex justify-end mt-2">
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
      <div class="flex flex-col gap-4" v-if="selectedViewItem">
        <p class="text-lg text-secondary-600">{{ selectedViewItem.name }}</p>

        <!-- Content Section (Full Width) -->
        <div class="flex flex-col gap-1" v-if="selectedViewItem.content">
          <span class="text-sm text-secondary-500">{{ $t('task.fields.content') }}</span>
          <span class="text-base whitespace-pre-wrap">{{ selectedViewItem.content }}</span>
        </div>

        <!-- Two Column Grid for Other Information -->
        <div class="grid grid-cols-2 gap-4">
          <div class="flex flex-col gap-1">
            <span class="text-sm text-secondary-500">{{ $t('task.fields.status') }}</span>
            <span class="text-base">
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
            <span class="text-base">{{ $t(`task.types.${selectedViewItem.type}`) }}</span>
          </div>

          <div class="flex flex-col gap-1" v-if="selectedViewItem.startAt">
            <span class="text-sm text-secondary-500">{{ $t('task.fields.startDate') }}</span>
            <span class="text-base">{{ new Date(selectedViewItem.startAt).toLocaleString() }}</span>
          </div>

          <div class="flex flex-col gap-1" v-if="selectedViewItem.dueDateAt">
            <span class="text-sm text-secondary-500">{{ $t('task.fields.dueDate') }}</span>
            <span class="text-base">{{ new Date(selectedViewItem.dueDateAt).toLocaleString() }}</span>
          </div>

          <div class="flex flex-col gap-1" v-if="hasRightUserAllView">
            <span class="text-sm text-secondary-500">{{ $t('task.fields.user') }}</span>
            <span class="text-base">{{ getUserName(selectedViewItem.userId) }}</span>
          </div>

          <div class="flex flex-col gap-1" v-if="hasRightContactAllView && selectedViewItem.companyId">
            <span class="text-sm text-secondary-500">{{ $t('task.fields.company') }}</span>
            <NuxtLink :to="`/contact/company/${selectedViewItem.companyId}`" class="text-base text-primary-600 hover:underline">
              {{ getCompanyName(selectedViewItem.companyId) }}
            </NuxtLink>
          </div>

          <div class="flex flex-col gap-1" v-if="hasRightContactAllView && selectedViewItem.personId">
            <span class="text-sm text-secondary-500">{{ $t('task.fields.person') }}</span>
            <NuxtLink :to="`/contact/person/${selectedViewItem.personId}`" class="text-base text-primary-600 hover:underline">
              {{ getPersonName(selectedViewItem.personId) }}
            </NuxtLink>
          </div>

          <div class="flex flex-col gap-1" v-if="selectedViewItem.doneAt">
            <span class="text-sm text-secondary-500">{{ $t('task.fields.doneDate') }}</span>
            <span class="text-base">{{ new Date(selectedViewItem.doneAt).toLocaleString() }}</span>
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

    <!-- Edit Dialog -->
    <Dialog
      :open="openEditDialog === true"
      @update:open="openEditDialog = $event">
      <form
        class="flex flex-col gap-2"
        @submit.prevent="onUpdate"
        v-if="selectedEditItem">
        <p class="text-lg text-secondary-600">{{ $t('task.edit.title', { name: selectedEditItem.name }) }}</p>

        <atom-select
          :required="true"
          :title="$t('task.fields.type')"
          v-model="editForm.type"
          :items="taskTypeOptions"/>

        <atom-input
          :required="true"
          type="text"
          :title="$t('task.fields.name')"
          v-model="editForm.name"/>

        <atom-textarea
          :title="$t('task.fields.content')"
          v-model="editForm.content"/>

        <div class="grid grid-cols-2 gap-2">
          <atom-input
            type="datetime-local"
            :title="$t('task.fields.startDate')"
            v-model="editForm.startAt"/>

          <atom-input
            type="datetime-local"
            :title="$t('task.fields.dueDate')"
            v-model="editForm.dueDateAt"/>
        </div>

        <atom-select
          :required="true"
          :title="$t('task.fields.status')"
          v-model="editForm.isDone"
          :items="taskStatusOptions"/>

        <div class="flex justify-end mt-2">
          <atom-button
            type="submit"
            icon="save"
            :title="$t('general.save')">
          </atom-button>
        </div>
      </form>
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

  </Page>

</template>

<script setup lang="ts">

import type { TaskViewModel } from '~~/shared/types/task';
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
const usersCache = ref<Map<string, { firstName: string; lastName: string }>>(new Map());
const companiesCache = ref<Map<string, { name: string }>>(new Map());
const personsCache = ref<Map<string, { firstName: string; lastName: string }>>(new Map());

// Helper function to get user name
const getUserName = (userId: string): string => {
  if (userId === user?.id) return $t('task.currentUser');
  const cachedUser = usersCache.value.get(userId);
  if (cachedUser) return `${cachedUser.firstName} ${cachedUser.lastName}`;

  // Fetch user data asynchronously
  $fetch(`/api/user/${userId}`).then((userData: any) => {
    usersCache.value.set(userId, { firstName: userData.firstName, lastName: userData.lastName });
  }).catch(() => {});

  return $t('general.loading');
};

// Helper function to get company name
const getCompanyName = (companyId: string | null): string => {
  if (!companyId) return '-';
  const cachedCompany = companiesCache.value.get(companyId);
  if (cachedCompany) return cachedCompany.name;

  // Fetch company data asynchronously
  $fetch(`/api/company/${companyId}`).then((companyData: any) => {
    companiesCache.value.set(companyId, { name: companyData.name });
  }).catch(() => {});

  return $t('general.loading');
};

// Helper function to get person name
const getPersonName = (personId: string | null): string => {
  if (!personId) return '-';
  const cachedPerson = personsCache.value.get(personId);
  if (cachedPerson) return `${cachedPerson.firstName} ${cachedPerson.lastName}`;

  // Fetch person data asynchronously
  $fetch(`/api/person/${personId}`).then((personData: any) => {
    personsCache.value.set(personId, { firstName: personData.firstName, lastName: personData.lastName });
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

// Create dialog state
const openCreateDialog = ref(false);
const defaultCreateForm = {
  type: 'ACTION' as const,
  name: '',
  content: '',
  startAt: '',
  dueDateAt: '',
  isDone: 'open',
};
const createForm = reactive({ ...defaultCreateForm });

// View dialog state
const openViewDialog = ref(false);
const selectedViewItem = ref<TaskViewModel | null>(null);

// Edit dialog state
const openEditDialog = ref(false);
const selectedEditItem = ref<TaskViewModel | null>(null);
const editForm = reactive({
  type: 'ACTION',
  name: '',
  content: '',
  startAt: '',
  dueDateAt: '',
  isDone: 'open',
});

// Delete state
const selectedDeleteItem = ref<TaskViewModel | null>(null);

// Action handlers
const actionHandler = async (key: string, item?: TaskViewModel | null) => {
  switch (key) {
    case 'openAdd':
      Object.assign(createForm, defaultCreateForm);
      openCreateDialog.value = true;
      break;
    case 'openView':
      if (!item) return;
      selectedViewItem.value = item;
      openViewDialog.value = true;
      break;
    case 'openEdit':
      if (!item) return;
      selectedEditItem.value = item;
      editForm.type = item.type;
      editForm.name = item.name;
      editForm.content = item.content ?? '';
      editForm.startAt = formatDateTimeLocal(item.startAt);
      editForm.dueDateAt = formatDateTimeLocal(item.dueDateAt);
      editForm.isDone = item.doneAt ? 'done' : 'open';
      openEditDialog.value = true;
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

const onCreate = async () => {
  try {
    const createdItem = await create({
      type: createForm.type,
      name: createForm.name,
      content: createForm.content || null,
      startAt: parseDateTimeLocal(createForm.startAt),
      dueDateAt: parseDateTimeLocal(createForm.dueDateAt),
      doneAt: createForm.isDone === 'done' ? new Date().toISOString() : null,
    } as any);

    if (createdItem === null) {
      return toast.add({ type: 'error', title: $t('task.createError', { name: createForm.name }) });
    }

    toast.add({ type: 'success', title: $t('task.createSuccess', { name: createdItem.name }) });
    Object.assign(createForm, defaultCreateForm);
    openCreateDialog.value = false;
    await loadItems();
  } catch (e) {
    toast.add({ type: 'error', title: $t('task.createError', { name: createForm.name }) });
  }
};

const openEditFromView = () => {
  if (!selectedViewItem.value) return;
  openViewDialog.value = false;
  actionHandler('openEdit', selectedViewItem.value);
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

const onUpdate = async () => {
  try {
    if (!selectedEditItem.value) return;

    await upsert({
      ...selectedEditItem.value,
      type: editForm.type,
      name: editForm.name,
      content: editForm.content || null,
      startAt: parseDateTimeLocal(editForm.startAt),
      dueDateAt: parseDateTimeLocal(editForm.dueDateAt),
      doneAt: editForm.isDone === 'done' ? (selectedEditItem.value.doneAt || new Date().toISOString()) : null,
    });

    toast.add({ type: 'success', title: $t('task.edit.toast.success') });
    openEditDialog.value = false;
    selectedEditItem.value = null;
    await loadItems();
  } catch (e) {
    toast.add({ type: 'error', title: $t('task.edit.toast.error') });
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
