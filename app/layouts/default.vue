<template>

  <aside
    class="fixed top-0 left-0 h-screen w-screen lg:w-aside-width flex flex-col justify-between items-start p-4 pb-12 lg:pb-4 lg:translate-x-0 transition-transform lg:transition-none bg-secondary-50 border-r border-r-secondary-100 z-40"
    :class="{
      '-translate-x-full': (layoutMenu.open.value !== true),
      'translate-x-0': (layoutMenu.open.value === true)
    }">
    <div class="w-full flex flex-col gap-4 justify-start">

      <NuxtLink
        to="/dashboard"
        @click="layoutMenu.setOpen(false)"
        class="block relative w-8/12 lg:w-full">
        <NuxtImg
          class="block relative w-full h-auto"
          :src="globalLayout.logoUrl">
        </NuxtImg>
      </NuxtLink>

      <button
        type="button"
        class="relative flex items-center justify-between px-3 py-2 text-sm text-primary-950 rounded-lg bg-secondary-100"
        @click.prevent="onSearch()">
        <span class="flex justify-start items-center gap-2">
          <Icon icon="lucide:search"/>
          <span>{{ $t('layout.aside.search') }}</span>
        </span>
        <span class="hidden lg:inline-block">⌘ S</span>
      </button>

      <nav class="w-full  flex flex-col">
        <NuxtLink
          class="flex justify-start items-center gap-2 text-sm text-primary-950 px-3 py-2 rounded-lg transition-colors hover:bg-secondary-100 cursor-pointer"
          v-for="item in mainMenuItems"
          :key="item.title+item.to"
          :to="item.to"
          :href="item.href"
          @click="onClickItem(item)">
          <Icon :icon="item.icon" class="text-lg"/>
          <span>{{ item.title }}</span>
        </NuxtLink>
      </nav>

    </div>
    <div class="w-full flex flex-col gap-4 justify-start">
      
      <nav class="w-full flex flex-col">
        <NuxtLink
          class="flex justify-start items-center gap-2 text-sm text-primary-950 px-3 py-2 rounded-lg transition-colors hover:bg-secondary-100 cursor-pointer"
          v-for="item in secondMenuItems"
          :key="item.title+item.to"
          :to="item.to"
          :href="item.href"
          @click="onClickItem(item)">
          <Icon :icon="item.icon" class="text-lg"/>
          <span>{{ item.title }}</span>
        </NuxtLink>
      </nav>

    </div>
  </aside>

  <button
    type="button"
    class="fixed top-4 right-4 w-10 h-10 flex lg:hidden justify-center items-center bg-secondary-100 rounded-xl shadow-lg shadow-primary-950/20 z-[45]"
    @click="layoutMenu.toggle()">
    <Icon icon="lucide:x" class="text-primary-950 text-xl" v-if="(layoutMenu.open.value === true)"/>
    <Icon icon="lucide:menu" class="text-primary-950 text-xl" v-if="(layoutMenu.open.value !== true)"/>
  </button>

  <main 
    class="block relative w-full lg:w-main-width ml-0 lg:ml-aside-width min-h-screen">
    <slot></slot>
  </main>

  <DialogSearch
    v-model:open="searchOpen">
  </DialogSearch>

  <div
    class="flex justify-center items-center fixed top-0 left-0 w-screen h-screen backdrop-blur-2xl z-[9999]"
    v-if="!user">
    <Icon icon="lucide:loader-circle" class="animate-spin text-primary-900 text-3xl"/>
  </div>

</template>

<script setup lang="ts">

interface IMenuItem {
  title: string;
  icon: string;
  to?: string;
  href?: string;
  onClick?: (() => (any | Promise<any>))
}

const globalLayout = useGlobalLayout(),
      layoutMenu = useLayoutMenu(),
      auth = useAuth(),
      user = await auth.getUser();

useHead({
  title: globalLayout.siteTitle,
});

const onClickItem = (item: IMenuItem) => {
  layoutMenu.setOpen(false);
  if (item.onClick)
    return item.onClick();
}

const mainMenuItems: IMenuItem[] = [
  { title: $t('layout.aside.dashboard'), icon: 'lucide:gauge', to: '/dashboard' },
  ...(!user?.rights.includes('contact.all.view') ? [] : [{ title: $t('layout.aside.companies'), icon: 'lucide:building', to: '/company' }]),
  ...(!user?.rights.includes('contact.all.view') ? [] : [{ title: $t('layout.aside.persons'), icon: 'lucide:users-round', to: '/person' }]),
];

const secondMenuItems: IMenuItem[] = [
  ...(!user?.rights.includes('user.all.view') ? [] : [{ title: $t('layout.aside.users'), icon: 'lucide:users-round', to: '/user' }]),
  { title: $t('layout.aside.profile'), icon: 'lucide:circle-user-round', to: '/profile' },
  { title: $t('layout.aside.logout'), icon: 'lucide:log-out', onClick: () => auth.logout() },
];

const searchOpen = ref<boolean>(false);
const onSearch = () => {
  searchOpen.value = true;
};

onMounted(() => {
  const handler = (e: KeyboardEvent) => {
    if (e.code === 'KeyS' && e.metaKey) {
      e.preventDefault();
      onSearch();
    }
  };
  window.addEventListener('keydown', handler);
  onBeforeUnmount(() => {
    window.removeEventListener('keydown', handler);
  });
});

</script>
