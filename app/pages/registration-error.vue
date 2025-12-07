<template>

  <div
    class="relative w-full h-screen flex justify-center items-center bg-secondary-100">
    <div
      class="w-full max-w-[280px] flex flex-col p-4">
      <NuxtImg
        class="block relative w-full"
        :src="globalLayout.logoUrl">
      </NuxtImg>
      <p class="relative text-lg font-semibold text-secondary-800 mt-6">{{ $t('registrationError.title') }}</p>
      <p class="relative text-sm text-secondary-800 mt-2">{{ $t('registrationError.text') }}</p>
      <div class="relative block mt-4">
        <atom-button
          type="button"
          icon="refresh-ccw"
          @click="auth.login()">
          {{ $t('registrationError.retry') }}
        </atom-button>
      </div>
    </div>
  </div>

</template>

<script setup lang="ts">

definePageMeta({
  layout: 'blank'
});

const globalLayout = useGlobalLayout(),
      auth = useAuth();

</script>
