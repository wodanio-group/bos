<template>

  <Page
    :title="$t('profile.hello', { name: user?.displayName ?? $t('profile.user') })">

    <PageSectionBox
      :title="$t('profile.userinfo')"
      class="col-span-12">
      <div class="grid grid-cols-1 lg:grid-cols-2">
        <div
          class="flex justify-between items-center gap-4 px-4 py-3 border-b border-b-secondary-200 lg:[&:nth-last-child(2)]:border-b-0 last:border-none odd:border-r odd:border-r-secondary-200"
          v-for="item in items">
          <p class="text-secondary-700 text-sm">{{ item.t }}</p>
          <p class="text-primary-950 text-sm">{{ item.v ?? '-' }}</p>
        </div>
      </div>
    </PageSectionBox>

    <PageSectionBox
      :title="$t('profile.davPassword.title')"
      class="col-span-12">

      <div class="grid grid-cols-1 lg:grid-cols-2">
        <div class="flex justify-between items-center gap-4 px-4 py-3 border-b border-b-secondary-200 odd:border-r odd:border-r-secondary-200">
          <p class="text-secondary-700 text-sm">{{ $t('profile.davPassword.davUrl') }}</p>
          <div class="flex items-center gap-2">
            <p class="text-primary-950 text-sm font-mono break-all">{{ davUrl }}</p>
            <atom-button
              type="button"
              icon="copy"
              :outline="true"
              size="sm"
              @click="copyDavUrl"/>
          </div>
        </div>
        <div class="flex justify-between items-center gap-4 px-4 py-3 border-b border-b-secondary-200 odd:border-r odd:border-r-secondary-200">
          <p class="text-secondary-700 text-sm">{{ $t('profile.davPassword.title') }}</p>
          <p class="text-primary-950 text-sm">{{ davPasswordIsSet ? $t('profile.davPassword.isSet') : $t('profile.davPassword.isNotSet') }}</p>
        </div>
      </div>

      <form
        class="flex flex-col gap-2 p-4"
        @submit.prevent="actionHandler('setPassword')">
        <atom-input
          type="password"
          :required="true"
          :title="$t('profile.davPassword.passwordLabel')"
          v-model="passwordForm.password"/>
        <div class="flex justify-between mt-2">
          <atom-button
            v-if="davPasswordIsSet"
            type="button"
            icon="trash-2"
            :outline="true"
            :title="$t('profile.davPassword.removePassword')"
            @click="actionHandler('requestRemove')"/>
          <div v-else/>
          <div class="flex gap-2">
            <atom-button
              type="button"
              icon="smartphone"
              :outline="true"
              :title="$t('profile.davPassword.downloadConfig')"
              @click="downloadAppleConfig"/>
            <atom-button
              type="submit"
              icon="save"
              :title="davPasswordIsSet ? $t('profile.davPassword.changePassword') : $t('profile.davPassword.setPassword')"/>
          </div>
        </div>
      </form>

    </PageSectionBox>

    <SimpleAlertDialog
      :open="showRemoveConfirm"
      :title="$t('profile.davPassword.removeConfirmTitle')"
      :description="$t('profile.davPassword.removeConfirmDescription')"
      :submitButtonTitle="$t('profile.davPassword.removePassword')"
      submitButtonIcon="trash-2"
      @submit="actionHandler('removePassword')"
      @cancel="showRemoveConfirm = false"
      @update:open="(v: boolean) => { if (!v) showRemoveConfirm = false }"/>

  </Page>

</template>

<script setup lang="ts">
import { DateTime } from 'luxon';

definePageMeta({
  middleware: ['auth']
});

const auth = useAuth(),
      user = await auth.getUser(),
      toast = useToast(),
      runtimeConfig = useRuntimeConfig();

const items: { t: string, v: string | null | undefined }[] = !user ? [] : [
  { t: $t('general.id'), v: user.id },
  { t: $t('general.name'), v: user.displayName },
  { t: $t('general.email'), v: user.email },
  { t: $t('general.role'), v: $t('roles.'+user.role) },
  { t: $t('general.updatedAt'), v: DateTime.fromISO(user.updatedAt).toFormat($t('format.datetime')) },
  { t: $t('general.createdAt'), v: DateTime.fromISO(user.createdAt).toFormat($t('format.datetime')) },
];

const davUrl = computed(() => `${runtimeConfig.public.siteUrl}`);

const davPasswordIsSet = ref(false);
if (user) {
  try {
    const davStatus = await $fetch<{ isSet: boolean }>('/api/user/me/dav-password');
    davPasswordIsSet.value = davStatus.isSet;
  } catch {}
}

const passwordForm = ref({ password: '' });
const showRemoveConfirm = ref(false);

const downloadAppleConfig = async () => {
  try {
    const blob = await $fetch<Blob>('/api/user/me/dav-config', { responseType: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'wodanio-contacts.mobileconfig';
    a.click();
    URL.revokeObjectURL(url);
    davPasswordIsSet.value = true;
    toast.add({ type: 'success', title: $t('profile.davPassword.downloadConfigSuccess') });
  } catch {
    toast.add({ type: 'error', title: $t('profile.davPassword.downloadConfigError') });
  }
};

const copyDavUrl = async () => {
  await navigator.clipboard.writeText(davUrl.value);
  toast.add({ type: 'success', title: $t('general.copied') });
};

const actionHandler = async (key: string) => { switch (key) {
  case 'setPassword':
    try {
      await $fetch('/api/user/me/dav-password', {
        method: 'PUT',
        body: { password: passwordForm.value.password },
      });
      davPasswordIsSet.value = true;
      passwordForm.value = { password: '' };
      toast.add({ type: 'success', title: $t('profile.davPassword.setSuccess') });
    } catch {
      toast.add({ type: 'error', title: $t('profile.davPassword.setError') });
    }
    break;
  case 'requestRemove':
    showRemoveConfirm.value = true;
    break;
  case 'removePassword':
    try {
      await $fetch('/api/user/me/dav-password', { method: 'DELETE' });
      davPasswordIsSet.value = false;
      showRemoveConfirm.value = false;
      toast.add({ type: 'success', title: $t('profile.davPassword.removeSuccess') });
    } catch {
      toast.add({ type: 'error', title: $t('profile.davPassword.removeError') });
    }
    break;
} }

</script>
