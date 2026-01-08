<template>

  <Page :title="$t('user.title')">

    <DataSectionBox
      class="col-span-12"
      :items="items"
      addActionKey="openEdit"
      itemClickActionKey="openEdit"
      :fields="[
        { title: $t('general.name'), fieldName: 'displayName' },
        { title: $t('general.email'), fieldName: 'email' },
        { title: $t('general.role'), fieldName: 'role', transform: (v: string | null) => (v ? $t(`roles.${v}`) : null) },
      ]"
      :actions="[
        { title: $t('general.edit'), icon: 'edit', key: 'openEdit' },
        { title: $t('general.delete'), icon: 'trash-2', key: 'requestDelete' },
      ]"
      :paginationState="pagination"
      :paginationIsFirst="paginationIsFirst"
      :paginationIsLast="paginationIsLast"
      @update:paginationState="paginationSet"
      @updateSearch="searchSet"
      @action="actionHandler">
    </DataSectionBox>

    <Dialog
      :open="selectedEditItem !== undefined"
      @update:open="actionHandler($event ? '' : 'closeEdit')">
      <template #headerLeft>
        <p class="text-lg text-secondary-600">{{ $t((selectedEditItem === null) ? 'user.editTitleAdd' : 'user.editTitleEdit', { name: selectedEditItem?.displayName ?? selectedEditItem?.email ?? '?' }) }}</p>
      </template>
      <form
        class="flex flex-col gap-2"
        @submit.prevent="actionHandler('edit')">
        <atom-input 
          :required="true"
          type="email"
          :title="$t('general.email')"
          v-model="editForm.email"/>
        <atom-input
          :required="true"
          type="text"
          :title="$t('general.name')"
          v-model="editForm.displayName"/>
        <atom-select 
          :title="$t('general.role')"
          :required="true"
          :items="UserRoleRights.map(r => ({
            value: r.role,
            title: $t(`roles.${r.role}`)
          }))"
          v-model="editForm.role">
        </atom-select>
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
      :title="$t('user.deleteTitle', { name: selectedDeleteItem?.displayName ?? selectedDeleteItem?.email ?? '?' })"
      :description="$t('user.deleteDescription')"
      :submitButtonTitle="$t('general.delete')"
      submitButtonIcon="trash-2"
      @submit="actionHandler('delete', selectedDeleteItem)"
      @cancel="selectedDeleteItem = null"
      @update:open="actionHandler('requestDelete', $event ? selectedDeleteItem : null)"/>

  </Page>

</template>

<script setup lang="ts">

import type { UserViewModel } from '~~/shared/types/user';

definePageMeta({
  middleware: ['auth']
});

const toast = useToast();

const { 
  items, 
  loadItems, 
  pagination, 
  paginationIsFirst, 
  paginationIsLast, 
  paginationSet, 
  searchSet,
  upsert,
  deleteById 
} = useCrud<UserViewModel>({
  apiPath: '/api/user'
});
await loadItems();

const selectedEditItem = useState<UserViewModel | null | undefined>('userSelectedEditItem', () => undefined),
      defaultEditForm = {
        displayName: '',
        email: '',
        role: 'NONE'
      },
      editForm = useState('userEditForm', () => defaultEditForm),
      selectedDeleteItem = useState<UserViewModel | null>('userSelectedDeleteItem', () => null);

const actionHandler = async (key: string, item?: UserViewModel | null) => { switch (key) {
  case 'edit':
    if (!(await upsert(editForm.value as any)))
      return toast.add({ type: 'error', title: $t('user.error.upsert') });
    loadItems();
    selectedEditItem.value = undefined;
    editForm.value = { ...defaultEditForm };
    toast.add({ type: 'success', title: $t('user.success.upsert') });
    break;
  case 'delete':
    try {
      if (!item)
        return;
      await deleteById(item.id)
      loadItems();
      selectedDeleteItem.value = null;
      toast.add({ type: 'success', title: $t('user.success.delete') });
    } catch (e) {
      toast.add({ type: 'error', title: $t('user.error.delete') });
    }
    break;
  case 'openEdit':
    selectedEditItem.value = item ?? null;
    editForm.value = item ? { ...(item as any) } : { ...defaultEditForm };
    break;
  case 'closeEdit':
    selectedEditItem.value = undefined;
    editForm.value = defaultEditForm;
    break;
  case 'requestDelete':
    selectedDeleteItem.value = item ?? null;
    break;
} }

</script>
