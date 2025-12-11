<template>

  <Page
    :title="$t('timeTracking.title')">

    <DataSectionBox
      class="col-span-12"
      :items="items"
      :fields="[
        { title: $t('general.from'), fieldName: 'from', transform: (value: string | null) => ((value !== null) ? DateTime.fromISO(value).toFormat($t('format.datetime')) : '-') },
        { title: $t('general.to'), fieldName: 'to', transform: (value: string | null) => ((value !== null) ? DateTime.fromISO(value).toFormat($t('format.datetime')) : '-') },
        { title: $t('general.duration'), fieldName: 'duration', transform: (value: number) => ((value > 0) ? Duration.fromMillis(value).toFormat($t('format.duration')) : '-') },
        ...((hasRightUserAllView === true) ? [{ title: $t('general.user'), fieldName: 'user', transform: (id: string) => users.find(u => u.id === id)?.displayName ?? '-' }] : []),
      ]"
      :filters="[
        { title: $t('general.from'), icon: 'calendar-days', key: 'from', type: 'date' },
        { title: $t('general.to'), icon: 'calendar-days', key: 'to', type: 'date' },
        ...(((hasRightUserAllView === true) ? [{ title: $t('general.user'), icon: 'calendar-days', key: 'user', type: 'select', items: users.map(u => ({ title: u.displayName ?? '?', value: u.id })) }] : []) as any),
      ]"
      :header-actions="[
        { title: $t('timeTracking.csvExport'), icon: 'arrow-down-to-line', key: 'csvExport' }
      ]"
      :actions="[
        { title: $t('general.delete'), icon: 'trash-2', key: 'requestDelete' },
      ]"
      :paginationState="pagination"
      :paginationIsFirst="paginationIsFirst"
      :paginationIsLast="paginationIsLast"
      :hide-search="true"
      :hide-add-butto="true"
      @action="actionHandler"
      @update-filter="actionFilter">
    </DataSectionBox>

  </Page>

</template>

<script setup lang="ts">
import { DateTime, Duration } from 'luxon';
import type { TimeTrackingActivityViewModel } from '~~/shared/types/time-tracking';
import type { UserViewModel } from '~~/shared/types/user';

definePageMeta({
  middleware: ['auth']
});

const auth = useAuth();
const user = await auth.getUser();

const toast = useToast();

const hasRightUserAllView = computed(() => user && user.rights.includes('user.all.view'));
const users = ref<UserViewModel[]>([]);
if (hasRightUserAllView.value === true) {
  const userCrud = useCrud<UserViewModel>({
    apiPath: '/api/user'
  });
  await userCrud.loadItems();
  users.value = userCrud.items.value;
}
const { 
  items, 
  loadItems,
  pagination,
  paginationIsFirst,
  paginationIsLast,
  deleteById,
} = useCrud<CompanyViewModel>({
  apiPath: '/api/time-tracking/activity',
  query: { isNotRunning: false }
});
await loadItems();

const actionHandler = async (key: string, item?: TimeTrackingActivityViewModel | null) => { switch (key) {
  case 'csvExport':
    break;
  case 'requestDelete':
    break;
  case 'delete':
    break;
} };

const actionFilter = async (key: string, value: string) => { switch (key) {
  case 'from':
    console.log(value);
    await loadItems();
    break;
  case 'to':
    console.log(value);
    await loadItems();
    break;
  case 'user':
    console.log(value);
    await loadItems();
    break;
} };

</script>
