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

  </Page>

</template>

<script setup lang="ts">
import { DateTime } from 'luxon';


definePageMeta({
  middleware: ['auth']
});

const auth = useAuth(),
      user = await auth.getUser();

const items: { t: string, v: string | null | undefined }[] = !user ? [] : [
  { t: $t('general.id'), v: user.id },  
  { t: $t('general.name'), v: user.displayName },
  { t: $t('general.email'), v: user.email },
  { t: $t('general.role'), v: $t('roles.'+user.role) },
  { t: $t('general.updatedAt'), v: DateTime.fromISO(user.updatedAt).toFormat($t('format.datetime')) },
  { t: $t('general.createdAt'), v: DateTime.fromISO(user.createdAt).toFormat($t('format.datetime')) },
];

</script>
