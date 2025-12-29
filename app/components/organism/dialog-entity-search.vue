<template>

  <Dialog
    :open="open === true"
    @update:open="onUpdateOpen">
    <template #headerLeft>
      <p class="text-sm text-secondary-600 mb-2" v-if="title" v-html="title"></p>
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
            @click="selectResult(result.id)"
            @mouseenter="selectedIndex = index">
            <span class="text-xs text-primary-950/60 font-semibold" v-html="result.subtitle" v-if="result.subtitle"></span>
            <span class="text-sm text-primary-950" v-html="result.title"></span>
          </button>
        </template>
      </div>
    </div>
  </Dialog>

</template>

<script setup lang="ts">

/**
 * Abstract search dialog component for searching entities
 *
 * @example Usage for searching companies:
 * <organism-dialog-entity-search
 *   :open="openDialog"
 *   title="Search for a company"
 *   :search-fn="async (query) => {
 *     const results = await $fetch(`/api/company?search=${query}&take=20`);
 *     return results.map(c => ({
 *       id: c.id,
 *       title: companyDisplayName(c),
 *       subtitle: c.customerId
 *     }));
 *   }"
 *   @select="(id) => handleSelect(id)"
 *   @close="openDialog = false"
 * />
 */

export interface SearchResult {
  id: string;
  title: string;
  subtitle?: string | null;
}

const props = defineProps<{
  /** Whether the dialog is open */
  open: boolean;
  /** Title text shown above the search input */
  title?: string;
  /**
   * Search function that takes a query string and returns search results
   * @param query - The search query entered by the user
   * @returns Array of search results with id, title, and optional subtitle
   */
  searchFn: (query: string) => Promise<SearchResult[]>;
  /** Minimum search query length before triggering search (default: 3) */
  minSearchLength?: number;
  /** Maximum number of results to show (handled by searchFn) */
  maxResults?: number;
}>();

const open = computed(() => props.open ?? false);
const minSearchLength = computed(() => props.minSearchLength ?? 3);

const emits = defineEmits<{
  'select': [string],
  'close': [void],
}>();

const onUpdateOpen = (open: boolean) => {
  if (!open)
    emits('close');
  searchResults.value = [];
}

const searchInputRef = ref<any>(null);
const resultsContainerRef = ref<HTMLElement | null>(null);
const resultRefs = ref<(HTMLElement | null)[]>([]);
const searchResults = ref<SearchResult[]>([]);
const selectedIndex = ref<number>(-1);

const onUpdateSearch = async (value: string | null | undefined) => {
  const search = filterString(value);
  if (!search || search.length < minSearchLength.value) {
    searchResults.value = [];
    selectedIndex.value = -1;
  } else {
    try {
      const results = await props.searchFn(search);
      searchResults.value = results;
      selectedIndex.value = -1;
    } catch (e) {
      console.error('DialogEntitySearch: Search failed', e);
      searchResults.value = [];
      selectedIndex.value = -1;
    }
  }
}

const selectResult = (id: string) => {
  emits('select', id);
}

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
}

// Auto-focus input when dialog opens
watch(() => props.open, (newValue) => {
  if (newValue) {
    // Use a longer delay to ensure the dialog is fully rendered
    setTimeout(() => {
      // Try multiple approaches to find and focus the input
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
    if (!props.open) return;

    if (e.code === 'Escape') {
      e.preventDefault();
      emits('close');
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
        selectResult(selected.id);
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
