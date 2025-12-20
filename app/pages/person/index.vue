<template>

  <Page :title="$t('person.title')">

    <DataSectionBox
      class="col-span-12"
      :items="items"
      addActionKey="openAdd"
      itemClickActionKey="view"
      :fields="[
        { title: $t('general.name'), fieldName: 'name', transform: (v: any, o: any) => personDisplayName(o) },
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
      <form
        class="grid grid-cols-2 gap-2"
        @submit.prevent="actionHandler('create')">
        <p class="text-lg text-secondary-600 col-span-2">{{ $t('person.createDialogTitle') }}</p>
        <atom-select 
          class="col-span-2"
          :title="$t('general.gender')"
          :required="true"
          :items="ContactGenders.map((gender: string) => ({
            value: gender,
            title: $t(`genders.${gender}`)
          }))"
          v-model="createForm.gender">
        </atom-select>
        <atom-input 
          :required="true"
          type="text"
          :title="$t('general.firstname')"
          v-model="createForm.firstname"/>
        <atom-input 
          :required="true"
          type="text"
          :title="$t('general.familyname')"
          v-model="createForm.familyname"/>
        <div class="flex justify-end mt-2 col-span-2">
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
      :title="$t('person.deleteTitle', { name: selectedDeleteItem ? personDisplayName(selectedDeleteItem) : '?' })"
      :description="$t('person.deleteDescription')"
      :submitButtonTitle="$t('general.delete')"
      submitButtonIcon="trash-2"
      @submit="actionHandler('delete', selectedDeleteItem)"
      @cancel="selectedDeleteItem = null"
      @update:open="actionHandler('requestDelete', $event ? selectedDeleteItem : null)"/>

  </Page>

</template>

<script setup lang="ts">

import type { PersonViewModel } from '~~/shared/types/contact';
import { personDisplayName } from '#imports';
import { ContactGenders } from '~~/shared/utils/contact';

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
  sortSet,
  create,
  deleteById,
} = useCrud<PersonViewModel>({
  apiPath: '/api/person'
});
sortSet('familyname', 'asc');
await loadItems();

const hasRightContactAllCreate = computed(() => user && user.rights.includes('contact.all.create')),
      hasRightContactAllEdit = computed(() => user && user.rights.includes('contact.all.edit')),
      hasRightContactAllDelete = computed(() => user && user.rights.includes('contact.all.delete'));

const selectedDeleteItem = useState<PersonViewModel | null>('personSelectedDeleteItem', () => null),
      defaultCreateForm = {
        gender: '',
        firstname: '',
        familyname: ''
      },
      createForm = useState('personCreateForm', () => defaultCreateForm),
      openCreateForm = ref(false);

const actionHandler = async (key: string, item?: PersonViewModel | null) => { switch (key) {
  case 'openAdd':
    openCreateForm.value = true;
    break;
  case 'closeAdd':
    openCreateForm.value = false;
    break;
  case 'create':
    const createdItem = await create(createForm.value as any);
    if (createdItem === null)
      return toast.add({ type: 'error', title: $t('person.createSuccess', { name: personDisplayName(createForm as any) }) });
    toast.add({ type: 'success', title: $t('person.createError', { name: personDisplayName(createdItem) }) });
    createForm.value = defaultCreateForm;
    openCreateForm.value = true;
    actionHandler('view-edit', createdItem);
    break;
  case 'view':
    if (!item) return;
    navigateTo(`/person/${item.id}`);
    break;
  case 'view-edit':
    if (!item) return;
    navigateTo(`/person/edit/${item.id}`);
    break;
  case 'delete':
    try {
      if (!item)
        return;
      await deleteById(item.id)
      loadItems();
      toast.add({ type: 'success', title: $t('person.deleteSuccessToast', { name: item ? personDisplayName(item) : '?' }) });
      selectedDeleteItem.value = null;
    } catch (e) {
      toast.add({ type: 'error', title: $t('person.deleteErrorToast', { name: item ? personDisplayName(item) : '?' }) });
    }
    break;
  case 'requestDelete':
    selectedDeleteItem.value = item ?? null;
    break;
} };

onUnmounted(() => {
  createForm.value = defaultCreateForm;
});

</script>

