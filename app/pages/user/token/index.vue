<template>

  <Page :title="$t('userToken.title')">

    <DataSectionBox
      class="col-span-12"
      :items="items"
      addActionKey="openAdd"
      :fields="[
        { title: $t('general.name'), fieldName: 'name' },
        { title: $t('general.user'), fieldName: 'user', transform: (v: any) => v?.displayName || v?.email || '-' },
        { title: $t('general.createdAt'), fieldName: 'createdAt', transform: (v: string) => DateTime.fromISO(v).toFormat('dd. LLL yyyy, HH:mm') },
      ]"
      :actions="[
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
      :open="openCreateForm === true"
      @update:open="actionHandler($event ? 'openAdd' : 'closeAdd')">
      <template #headerLeft>
        <p class="text-lg text-secondary-600">{{ $t('userToken.createDialogTitle') }}</p>
      </template>
      <form
        class="flex flex-col gap-2"
        @submit.prevent="actionHandler('create')">
        <atom-input
          :required="false"
          type="text"
          :title="$t('general.name')"
          v-model="createForm.name"/>

        <!-- Only show user selector if user has all.create permission -->
        <atom-select
          v-if="hasAllCreatePermission"
          :title="$t('general.user')"
          :required="false"
          :items="userOptions"
          v-model="createForm.userId">
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

    <!-- Display token after creation -->
    <Dialog
      :open="createdToken !== null"
      @update:open="createdToken = null">
      <div class="flex flex-col gap-4">
        <p class="text-lg text-secondary-600">{{ $t('userToken.tokenCreatedTitle') }}</p>
        <p class="text-sm text-secondary-500">{{ $t('userToken.tokenCreatedDescription') }}</p>
        <div class="p-3 bg-gray-100 dark:bg-gray-800 font-mono rounded font-mono text-sm break-all">
          {{ createdToken }}
        </div>
        <div class="flex justify-end mt-2">
          <atom-button
            type="button"
            @click="copyToken"
            icon="copy"
            :title="$t('userToken.copyToken')">
          </atom-button>
        </div>
      </div>
    </Dialog>

    <SimpleAlertDialog
      :open="selectedDeleteItem !== null"
      :title="$t('userToken.deleteTitle', { name: selectedDeleteItem?.name || $t('userToken.unnamedToken') })"
      :description="$t('userToken.deleteDescription')"
      :submitButtonTitle="$t('general.delete')"
      submitButtonIcon="trash-2"
      @submit="actionHandler('delete', selectedDeleteItem)"
      @cancel="selectedDeleteItem = null"
      @update:open="actionHandler('requestDelete', $event ? selectedDeleteItem : null)"/>

  </Page>

</template>

<script setup lang="ts">

import type { UserTokenViewModel, UserViewModel } from '~~/shared/types/user';
import { DateTime } from 'luxon';

definePageMeta({
  middleware: ['auth']
});

const auth = useAuth();
const user = await auth.getUser();
const toast = useToast();

const hasAllCreatePermission = computed(() => user && user.rights.includes('user.token.all.create'));

const {
  items,
  loadItems,
  pagination,
  paginationIsFirst,
  paginationIsLast,
  paginationSet,
  searchSet,
  create,
  deleteById
} = useCrud<UserTokenViewModel>({
  apiPath: '/api/user/token'
});
await loadItems();

// Load users for the dropdown if user has all.create permission
const userOptions = ref<{ value: string, title: string }[]>([]);
if (hasAllCreatePermission.value) {
  const { items: users, loadItems: loadUsers } = useCrud<UserViewModel>({
    apiPath: '/api/user',
    key: 'userTokenUserSelect'
  });
  await loadUsers();
  userOptions.value = users.value.map(u => ({
    value: u.id,
    title: u.displayName || u.email
  }));
}

const openCreateForm = useState<boolean>('userTokenOpenCreateForm', () => false),
      defaultCreateForm = {
        name: '',
        userId: user?.id
      },
      createForm = useState('userTokenCreateForm', () => ({ ...defaultCreateForm })),
      selectedDeleteItem = useState<UserTokenViewModel | null>('userTokenSelectedDeleteItem', () => null),
      createdToken = useState<string | null>('userTokenCreatedToken', () => null);

const copyToken = async () => {
  if (createdToken.value) {
    await navigator.clipboard.writeText(createdToken.value);
    toast.add({ type: 'success', title: $t('userToken.tokenCopied') });
  }
};

const actionHandler = async (key: string, item?: UserTokenViewModel | null) => { switch (key) {
  case 'create':
    try {
      const result = await create(createForm.value as any);
      if (result && (result as any).token) {
        createdToken.value = (result as any).token;
      }
      loadItems();
      openCreateForm.value = false;
      createForm.value = { ...defaultCreateForm };
      toast.add({ type: 'success', title: $t('userToken.createSuccess') });
    } catch (e) {
      toast.add({ type: 'error', title: $t('userToken.createError') });
    }
    break;
  case 'delete':
    try {
      if (!item)
        return;
      await deleteById(item.id);
      loadItems();
      selectedDeleteItem.value = null;
      toast.add({ type: 'success', title: $t('userToken.deleteSuccessToast') });
    } catch (e) {
      toast.add({ type: 'error', title: $t('userToken.deleteErrorToast') });
    }
    break;
  case 'openAdd':
    openCreateForm.value = true;
    createForm.value = { ...defaultCreateForm };
    break;
  case 'closeAdd':
    openCreateForm.value = false;
    createForm.value = { ...defaultCreateForm };
    break;
  case 'requestDelete':
    selectedDeleteItem.value = item ?? null;
    break;
} }

</script>
