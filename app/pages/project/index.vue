<template>

  <Page :title="$t('project.title')">

    <DataSectionBox
      class="col-span-12"
      :items="items"
      addActionKey="openAdd"
      itemClickActionKey="view"
      :fields="[
        { title: $t('project.fields.status'), fieldName: 'status', transform: (v: any) => statusBadge(v) },
        { title: $t('project.fields.name'), fieldName: 'name' },
        { title: $t('project.fields.company'), fieldName: 'companyName', transform: (v: any) => v ?? $t('project.internal') },
      ]"
      :filters="[{
        key: 'status',
        type: 'select',
        emptyLabel: $t('general.all'),
        items: ProjectStatuses.map((s: string) => ({ value: s, title: $t('projectStatuses.' + s) })),
      }]"
      :actions="[
        { title: $t('general.view'), icon: 'external-link', key: 'view' },
        ...((hasRightEdit === true) ? [{ title: $t('general.edit'), icon: 'square-pen', key: 'view-edit' }] : []),
        ...((hasRightDelete === true) ? [{ title: $t('general.delete'), icon: 'trash-2', key: 'requestDelete' }] : []),
      ]"
      :paginationState="pagination"
      :paginationIsFirst="paginationIsFirst"
      :paginationIsLast="paginationIsLast"
      :hideAddButton="hasRightCreate !== true"
      @update:paginationState="paginationSet"
      @updateSearch="searchSet"
      @updateFilter="filterSet"
      @action="actionHandler">
    </DataSectionBox>

    <Dialog
      :open="openCreateForm === true"
      @update:open="actionHandler($event ? 'openAdd' : 'closeAdd')">
      <template #headerLeft>
        <p class="text-lg text-secondary-600">{{ $t('project.createDialogTitle') }}</p>
      </template>
      <form
        class="flex flex-col gap-2"
        @submit.prevent="actionHandler('create')">
        <atom-input
          :required="true"
          type="text"
          :title="$t('project.fields.name')"
          v-model="createForm.name"/>
        <div class="flex justify-end mt-2">
          <atom-button
            type="submit"
            icon="save"
            :title="$t('general.save')">
          </atom-button>
        </div>
      </form>
    </Dialog>

    <SimpleAlertDialog
      :open="selectedDeleteItem !== null"
      :title="$t('project.deleteTitle', { name: selectedDeleteItem?.name ?? '?' })"
      :description="$t('project.deleteDescription')"
      :submitButtonTitle="$t('general.delete')"
      submitButtonIcon="trash-2"
      @submit="actionHandler('delete', selectedDeleteItem)"
      @cancel="selectedDeleteItem = null"
      @update:open="actionHandler('requestDelete', $event ? selectedDeleteItem : null)"/>

  </Page>

</template>

<script setup lang="ts">
import type { ProjectViewModel } from '~~/shared/types/project';

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
  filterSet,
  create,
  deleteById,
} = useCrud<ProjectViewModel>({
  apiPath: '/api/project'
});
await loadItems();

const hasRightCreate = computed(() => user?.rights.includes('project.all.create')),
      hasRightEdit   = computed(() => user?.rights.includes('project.all.edit')),
      hasRightDelete = computed(() => user?.rights.includes('project.all.delete'));

const statusBadgeClasses: Record<string, string> = {
  DRAFT:    'bg-secondary-100 text-secondary-700',
  ACTIVE:   'bg-green-100 text-green-700',
  ARCHIVED: 'bg-gray-100 text-gray-500',
};
const statusBadge = (status: string): string => {
  const cls = statusBadgeClasses[status] ?? 'bg-secondary-100 text-secondary-700';
  return `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${cls}">${$t('projectStatuses.' + status)}</span>`;
};

const selectedDeleteItem = useState<ProjectViewModel | null>('projectSelectedDeleteItem', () => null),
      defaultCreateForm = { name: '' },
      createForm = useState('projectCreateForm', () => defaultCreateForm),
      openCreateForm = ref(false);

const actionHandler = async (key: string, item?: ProjectViewModel | null) => { switch (key) {
  case 'openAdd':
    openCreateForm.value = true;
    break;
  case 'closeAdd':
    openCreateForm.value = false;
    break;
  case 'create':
    const created = await create(createForm.value as any);
    if (created === null)
      return toast.add({ type: 'error', title: $t('project.createError') });
    toast.add({ type: 'success', title: $t('project.createSuccess', { name: created.name }) });
    createForm.value = defaultCreateForm;
    actionHandler('view-edit', created);
    break;
  case 'view':
    if (!item) return;
    navigateTo(`/project/${item.id}`);
    break;
  case 'view-edit':
    if (!item) return;
    navigateTo(`/project/edit/${item.id}`);
    break;
  case 'delete':
    try {
      if (!item) return;
      await deleteById(item.id);
      loadItems();
      toast.add({ type: 'success', title: $t('project.deleteSuccessToast', { name: item.name }) });
      selectedDeleteItem.value = null;
    } catch (e) {
      toast.add({ type: 'error', title: $t('project.deleteErrorToast', { name: item?.name ?? '?' }) });
    }
    break;
  case 'requestDelete':
    selectedDeleteItem.value = item ?? null;
    break;
} };

onMounted(() => {
  createForm.value = defaultCreateForm;
});
</script>
