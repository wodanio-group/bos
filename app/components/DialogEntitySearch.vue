<template>

  <Dialog
    :open="open === true"
    @update:open="onUpdateOpen">
    <template #headerLeft>
      <p class="text-sm text-secondary-600 mb-2" v-if="title" v-html="title"></p>
    </template>
    <div class="flex flex-col">
      <InputSearch
        :hide-clear-button="true"
        @update:model-value="onUpdateSearch">
      </InputSearch>
      <div
        class="flex flex-col mt-2 max-h-[360px] overflow-hidden overflow-x-auto"
        v-if="(searchResults?.length ?? 0) > 0">
        <template
          :key="result.id"
          v-for="result in searchResults">
          <button
            type="button"
            class="relative flex flex-col text-left w-full px-4 py-2 border border-transparent outline-0 transition-colors rounded-lg focus:bg-secondary-100 focus:border-secondary-200 hover:bg-secondary-100"
            @click="emits('select', result.id)">
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
 * <DialogEntitySearch
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

const searchResults = ref<SearchResult[]>([]);
const onUpdateSearch = async (value: string | null | undefined) => {
  const search = filterString(value);
  if (!search || search.length < minSearchLength.value) {
    searchResults.value = [];
  } else {
    try {
      const results = await props.searchFn(search);
      searchResults.value = results;
    } catch (e) {
      console.error('DialogEntitySearch: Search failed', e);
      searchResults.value = [];
    }
  }
}

let handler: any;
onMounted(() => {
  handler = (e: KeyboardEvent) => {
    if (e.code === 'Escape') {
      e.preventDefault();
      emits('close');
    }
  };
  window.addEventListener('keydown', handler);
});
onBeforeUnmount(() => {
  window.removeEventListener('keydown', handler);
  searchResults.value = [];
});

</script>
