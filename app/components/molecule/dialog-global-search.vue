<template>

  <Dialog
    :open="open === true"
    @update:open="onUpdateOpen">
    <template #headerLeft>
      <p class="text-sm text-secondary-600 mb-2">{{ $t('layout.dialogSearch.searchPlaceholder') }}</p>
    </template>
    <div class="flex flex-col">
      <InputSearch
        ref="searchInputRef"
        :hide-clear-button="true"
        @update:model-value="onUpdateSearch">
      </InputSearch>
      <div
        ref="resultsContainerRef"
        class="flex flex-col mt-2 max-h-[360px] overflow-hidden overflow-y-auto"
        v-if="(searchResults?.length ?? 0) > 0">
        <template
          :key="result.id"
          v-for="(result, index) in searchResults">
          <button
            :ref="el => { if (el) resultRefs[index] = el as HTMLElement }"
            type="button"
            :class="[
              'relative flex flex-col text-left w-full px-4 py-2 border outline-0 transition-colors rounded-lg',
              selectedIndex === index
                ? 'bg-secondary-100 border-secondary-200'
                : 'border-transparent hover:bg-secondary-100 focus:bg-secondary-100 focus:border-secondary-200'
            ]"
            @click="onSelect(result)"
            @mouseenter="selectedIndex = index">
            <div class="flex items-center gap-2">
              <atom-icon
                :icon="getIconForType(result.type)"
                class="flex-shrink-0"
                :class="getIconClassForType(result.type)">
              </atom-icon>
              <div class="flex-1 overflow-hidden">
                <span class="text-sm text-primary-950 truncate block">{{ result.title }}</span>
                <span class="text-xs text-primary-950/60 font-semibold truncate block" v-if="result.subtitle">{{ result.subtitle }}</span>
              </div>
            </div>
          </button>
        </template>
      </div>
      <div
        class="flex items-center justify-center py-8"
        v-if="shownNoFindings">
        <p class="text-center text-sm text-secondary-700">{{ $t('layout.dialogSearch.noResults') }}</p>
      </div>
    </div>
  </Dialog>

</template>

<script setup lang="ts">

import { companyDisplayName, personDisplayName } from '#imports';

interface IFinding {
  type: 'person' | 'company' | 'quote';
  id: string;
  title: string;
  subtitle?: string | null;
  to: string;
  updatedAt: number;
}

const layoutMenu = useLayoutMenu();

const open = defineModel<boolean>('open');

const searchInputRef = ref<any>(null);
const resultsContainerRef = ref<HTMLElement | null>(null);
const resultRefs = ref<(HTMLElement | null)[]>([]);
const searchResults = ref<IFinding[]>([]);
const selectedIndex = ref<number>(-1);
const input = ref<string>('');
const shownNoFindings = computed(() => input.value.length > 2 && searchResults.value.length <= 0);

const onUpdateOpen = (isOpen: boolean) => {
  if (!isOpen) {
    open.value = false;
    searchResults.value = [];
    input.value = '';
    selectedIndex.value = -1;
  }
};

const onSelect = (item: IFinding) => {
  open.value = false;
  layoutMenu.setOpen(false);
  return navigateTo(item.to);
};

const onUpdateSearch = async (value: string | null | undefined) => {
  const search = filterString(value);
  input.value = search || '';

  if (!search || search.length < 3) {
    searchResults.value = [];
    selectedIndex.value = -1;
    return;
  }

  try {
    const [persons, companies, quotes] = await Promise.all([
      $fetch(`/api/person?search=${search}&take=10`),
      $fetch(`/api/company?search=${search}&take=10`),
      $fetch(`/api/quote?search=${search}&take=10`)
    ]);

    searchResults.value = ([
      ...persons.map((o: any) => ({
        type: 'person' as const,
        id: o.id,
        title: personDisplayName(o),
        subtitle: null,
        to: `/person/${o.id}`,
        updatedAt: (new Date(o.updatedAt ?? o.createdAt)).getTime()
      })),
      ...companies.map((o: any) => ({
        type: 'company' as const,
        id: o.id,
        title: companyDisplayName(o),
        subtitle: o.customerId,
        to: `/company/${o.id}`,
        updatedAt: (new Date(o.updatedAt ?? o.createdAt)).getTime()
      })),
      ...quotes.map((o: any) => ({
        type: 'quote' as const,
        id: o.id,
        title: o.quoteId,
        subtitle: null,
        to: `/quote/${o.id}`,
        updatedAt: (new Date(o.updatedAt ?? o.createdAt)).getTime()
      })),
    ] as IFinding[]).sort((a, b) => b.updatedAt - a.updatedAt);

    selectedIndex.value = -1;
  } catch (e) {
    console.error('Global search failed', e);
    searchResults.value = [];
    selectedIndex.value = -1;
  }
};

const getIconForType = (type: IFinding['type']) => {
  switch (type) {
    case 'person': return 'user-round';
    case 'company': return 'building';
    case 'quote': return 'file-text';
    default: return 'file-text';
  }
};

const getIconClassForType = (type: IFinding['type']) => {
  switch (type) {
    case 'person': return 'text-blue-600';
    case 'company': return 'text-green-600';
    case 'quote': return 'text-purple-600';
    default: return 'text-gray-600';
  }
};

const scrollToSelected = () => {
  if (selectedIndex.value >= 0 && resultRefs.value[selectedIndex.value] && resultsContainerRef.value) {
    const element = resultRefs.value[selectedIndex.value];
    const container = resultsContainerRef.value;

    if (element) {
      const elementTop = element.offsetTop;
      const elementBottom = elementTop + element.offsetHeight;
      const containerTop = container.scrollTop;
      const containerBottom = containerTop + container.clientHeight;

      if (elementTop < containerTop) {
        container.scrollTop = elementTop;
      } else if (elementBottom > containerBottom) {
        container.scrollTop = elementBottom - container.clientHeight;
      }
    }
  }
};

// Auto-focus input when dialog opens
watch(() => open.value, (newValue) => {
  if (newValue) {
    setTimeout(() => {
      const input = searchInputRef.value?.$el?.querySelector('input')
        || searchInputRef.value?.querySelector?.('input')
        || document.activeElement?.closest('[role="dialog"]')?.querySelector('input')
        || document.querySelector('[role="dialog"] input[type="search"]')
        || document.querySelector('[role="dialog"] input');

      if (input) {
        input.focus();
      }
    }, 100);
  }
});

let handler: any;
onMounted(() => {
  handler = (e: KeyboardEvent) => {
    // Only handle keyboard events when dialog is open
    if (!open.value) return;

    if (e.code === 'Escape') {
      e.preventDefault();
      open.value = false;
      return;
    }

    // Only handle arrow keys and Enter when there are search results
    if (searchResults.value.length === 0) return;

    if (e.code === 'ArrowDown') {
      e.preventDefault();
      selectedIndex.value = Math.min(selectedIndex.value + 1, searchResults.value.length - 1);
      scrollToSelected();
    } else if (e.code === 'ArrowUp') {
      e.preventDefault();
      selectedIndex.value = Math.max(selectedIndex.value - 1, 0);
      scrollToSelected();
    } else if (e.code === 'Enter' && selectedIndex.value >= 0) {
      e.preventDefault();
      const selected = searchResults.value[selectedIndex.value];
      if (selected) {
        onSelect(selected);
      }
    }
  };
  window.addEventListener('keydown', handler);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handler);
  searchResults.value = [];
  selectedIndex.value = -1;
});

</script>
