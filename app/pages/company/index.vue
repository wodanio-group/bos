<template>

  <Page :title="$t('company.title')">

    <DataSectionBox
      class="col-span-12"
      :items="items"
      addActionKey="openAdd"
      itemClickActionKey="view"
      :fields="[
        { title: $t('general.customerId'), fieldName: 'customerId' },
        { title: $t('general.name'), fieldName: 'name', transform: (v: any, o: any) => companyDisplayName(o) },
      ]"
      :actions="[
        { title: $t('general.view'), icon: 'external-link', key: 'view' },
        ...((hasRightContactAllEdit === true) ? [{ title: $t('general.edit'), icon: 'square-pen', key: 'view-edit' }] : []),
        ...((hasRightContactAllDelete === true) ? [{ title: $t('general.delete'), icon: 'trash-2', key: 'requestDelete' }] : []),
      ]"
      :paginationState="pagination"
      :paginationIsFirst="paginationIsFirst"
      :paginationIsLast="paginationIsLast"
      :hideAddButto="hasRightContactAllCreate !== true"
      @update:paginationState="paginationSet"
      @updateSearch="searchSet"
      @action="actionHandler">
    </DataSectionBox>

    <Dialog
      :open="openCreateForm === true"
      @update:open="actionHandler($event ? 'openAdd' : 'closeAdd')">
      <template #headerLeft>
        <p class="text-lg text-secondary-600">{{ $t('company.createDialogTitle') }}</p>
      </template>
      <form
        class="flex flex-col gap-2"
        @submit.prevent="actionHandler('create')">
        <atom-input 
          :required="true"
          type="text"
          :title="$t('general.name')"
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
      :title="$t('company.deleteTitle', { name: selectedDeleteItem ? companyDisplayName(selectedDeleteItem) : '?' })"
      :description="$t('company.deleteDescription')"
      :submitButtonTitle="$t('general.delete')"
      submitButtonIcon="trash-2"
      @submit="actionHandler('delete', selectedDeleteItem)"
      @cancel="selectedDeleteItem = null"
      @update:open="actionHandler('requestDelete', $event ? selectedDeleteItem : null)"/>

  </Page>

</template>

<script setup lang="ts">

import type { CompanyViewModel } from '~~/shared/types/contact';
import { companyDisplayName } from '#imports';

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
  deleteById,
  sortSet,
} = useCrud<CompanyViewModel>({
  apiPath: '/api/company'
});
sortSet('customerId', 'desc');
await loadItems();

const hasRightContactAllCreate = computed(() => user && user.rights.includes('contact.all.create')),
      hasRightContactAllEdit = computed(() => user && user.rights.includes('contact.all.edit')),
      hasRightContactAllDelete = computed(() => user && user.rights.includes('contact.all.delete'));

const selectedDeleteItem = useState<CompanyViewModel | null>('companySelectedDeleteItem', () => null),
      defaultCreateForm = {
        name: ''
      },
      createForm = useState('companyCreateForm', () => defaultCreateForm),
      openCreateForm = ref(false);

const actionHandler = async (key: string, item?: CompanyViewModel | null) => { switch (key) {
  case 'openAdd':
    openCreateForm.value = true;
    break;
  case 'closeAdd':
    openCreateForm.value = false;
    break;
  case 'create':
    const createdItem = await create(createForm.value as any);
    if (createdItem === null)
      return toast.add({ type: 'error', title: $t('company.createError', { name: companyDisplayName(createForm as any) }) });
    toast.add({ type: 'success', title: $t('company.createSuccess', { name: companyDisplayName(createdItem) }) });
    createForm.value = defaultCreateForm;
    actionHandler('view-edit', createdItem);
    break;
  case 'view':
    if (!item) return;
    navigateTo(`/company/${item.id}`);
    break;
  case 'view-edit':
    if (!item) return;
    navigateTo(`/company/edit/${item.id}`);
    break;
  case 'delete':
    try {
      if (!item)
        return;
      await deleteById(item.id);
      loadItems();
      toast.add({ type: 'success', title: $t('company.deleteSuccessToast', { name: item ? companyDisplayName(item) : '?' }) });
      selectedDeleteItem.value = null;
    } catch (e) {
      toast.add({ type: 'error', title: $t('company.deleteErrorToast', { name: item ? companyDisplayName(item) : '?' }) });
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

