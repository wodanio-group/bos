<template>

  <Page
    v-if="item"
    :title="item.name"
    :subtitle="$t('project.edit.subtitle')">
    <template #header>
      <atom-button
        type="button"
        icon="circle-x"
        :title="$t('general.cancel')"
        :outline="true"
        @click="navigateTo(`/project/${item.id}`)">
      </atom-button>
      <atom-button
        type="button"
        icon="save"
        :title="$t('project.edit.save')"
        @click="onSave()">
      </atom-button>
    </template>

    <div class="col-span-12 lg:col-span-8">
      <PageSectionBox :title="$t('project.edit.baseDataTitle')">
        <div class="flex flex-col gap-4 p-4">
          <atom-input
            type="text"
            :required="true"
            :title="$t('project.fields.name')"
            v-model="form.name"/>
          <atom-select
            :title="$t('project.fields.status')"
            :items="projectStatusItems"
            v-model="form.status"/>
          <atom-textarea
            :title="$t('project.fields.description')"
            v-model="form.description"/>
        </div>
      </PageSectionBox>
    </div>

    <div class="col-span-12 lg:col-span-4">
      <PageSectionBox :title="$t('project.edit.companyTitle')">
        <div class="flex flex-col gap-4 p-4">
          <molecular-input-entity-select
            :placeholder="$t('project.edit.selectCompany')"
            :search-title="$t('project.edit.companySearch')"
            :search-fn="searchCompany"
            :load-entity-fn="loadCompany"
            v-model="form.companyId"/>
          <p class="text-xs text-gray-400 italic" v-if="!form.companyId">
            {{ $t('project.edit.noCompanyHint') }}
          </p>
          <button
            type="button"
            class="text-xs text-red-400 hover:underline text-left"
            v-if="form.companyId"
            @click="form.companyId = undefined">
            {{ $t('project.edit.removeCompany') }}
          </button>
        </div>
      </PageSectionBox>
    </div>

    <div class="col-span-12" v-if="canEditMembers">
      <PageSectionBox :title="$t('project.edit.membersTitle')">
        <div class="flex flex-col gap-4 p-4">

          <div class="flex items-end gap-2">
            <molecular-input-entity-select
              class="flex-1"
              :placeholder="$t('project.edit.selectMember')"
              :search-title="$t('project.edit.memberSearch')"
              :search-fn="searchUser"
              :load-entity-fn="loadUser"
              :format-name-fn="userDisplayName"
              v-model="newMemberId"/>
            <atom-button
              type="button"
              icon="user-plus"
              :title="$t('project.edit.addMember')"
              @click="addMember()"
              :outline="true"/>
          </div>

          <div
            v-if="form.members.length === 0"
            class="flex justify-center py-2">
            <p class="text-xs text-gray-400">{{ $t('general.noItemsFound') }}</p>
          </div>

          <div
            v-for="(member, index) in form.members"
            :key="member.userId"
            class="grid grid-cols-[1fr_160px_32px] items-center gap-3 py-2 border-b border-b-gray-100 last:border-b-0">
            <div class="flex flex-col min-w-0">
              <span class="text-sm text-primary-950 font-medium truncate">{{ member.userDisplayName ?? member.userEmail }}</span>
              <span class="text-xs text-gray-500 truncate">{{ member.userEmail }}</span>
            </div>
            <select
              :value="member.role"
              @change="(e) => { form.members[index] && (form.members[index]!.role = (e.target as HTMLSelectElement).value as any) }"
              class="w-full px-2 py-1.5 text-sm text-primary-950 border border-secondary-200 rounded-lg shadow shadow-gray-100 focus:border-gray-500 focus:outline-none focus:ring-0">
              <option v-for="opt in projectMemberRoleItems" :key="opt.value" :value="opt.value">{{ opt.title }}</option>
            </select>
            <button
              type="button"
              @click="removeMember(index)"
              class="flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors">
              <atom-icon icon="trash-2" class="!text-sm"/>
            </button>
          </div>

        </div>
      </PageSectionBox>
    </div>

  </Page>

</template>

<script setup lang="ts">
import type { ProjectViewModel } from '~~/shared/types/project';
import type { UserViewModel } from '~~/shared/types/user';

definePageMeta({
  middleware: ['auth']
});

const auth = useAuth();
const user = await auth.getUser();
const toast = useToast();

const { item, upsert, loadItem } = useCrud<ProjectViewModel>({ apiPath: '/api/project' });
await loadItem();

const memberEntry = computed(() => item.value?.members.find(m => m.userId === user?.id));
const isManager = computed(() => memberEntry.value?.role === 'MANAGER');
const canEditMembers = computed(() => user?.rights.includes('project.all.edit') || isManager.value);

const projectStatusItems = computed(() => ProjectStatuses.map(s => ({ value: s, title: $t('projectStatuses.' + s) })));
const projectMemberRoleItems = computed(() => ProjectMemberRoles.map(r => ({ value: r, title: $t('projectMemberRoles.' + r) })));

const form = ref({
  name: item.value?.name ?? '',
  status: item.value?.status ?? 'DRAFT',
  description: item.value?.description ?? '',
  companyId: item.value?.companyId ?? undefined as string | undefined,
  members: (item.value?.members ?? []).map(m => ({
    userId: m.userId,
    userEmail: m.userEmail,
    userDisplayName: m.userDisplayName,
    role: m.role,
  })),
});

// Company search
const searchCompany = async (query: string) => {
  const results = await $fetch<any[]>('/api/company', { query: { search: query, take: 10 } });
  return results.map(c => ({ id: c.id, title: c.name ?? c.id, subtitle: c.customerId }));
};
const loadCompany = async (id: string) => $fetch<any>(`/api/company/${id}`);

// User search & member management
const newMemberId = ref<string | undefined>(undefined);

const searchUser = async (query: string) => {
  const results = await $fetch<UserViewModel[]>('/api/user', { query: { search: query, take: 10 } });
  return results
    .filter(u => !form.value.members.some(m => m.userId === u.id))
    .map(u => ({ id: u.id, title: u.displayName ?? u.email, subtitle: u.email }));
};
const loadUser = async (id: string) => $fetch<UserViewModel>(`/api/user/${id}`);

const addMember = async () => {
  const memberId = newMemberId.value;
  if (!memberId) return;
  if (form.value.members.some(m => m.userId === memberId)) return;
  try {
    const u = await $fetch<UserViewModel>(`/api/user/${memberId}`);
    form.value.members.push({ userId: u.id, userEmail: u.email, userDisplayName: u.displayName, role: 'MEMBER' });
    newMemberId.value = undefined;
  } catch {
    toast.add({ type: 'error', title: $t('project.edit.memberLoadError') });
  }
};

const removeMember = (index: number) => form.value.members.splice(index, 1);

const onSave = async () => {
  try {
    if (!item.value) return;
    await upsert({
      ...item.value,
      name: form.value.name,
      status: form.value.status as any,
      description: form.value.description || null,
      companyId: form.value.companyId ?? null,
      members: form.value.members as any,
      notes: item.value.notes,
    });
    toast.add({ type: 'success', title: $t('project.edit.toast.success') });
    navigateTo(`/project/${item.value.id}`);
  } catch (e) {
    toast.add({ type: 'error', title: $t('project.edit.toast.error') });
  }
};
</script>
