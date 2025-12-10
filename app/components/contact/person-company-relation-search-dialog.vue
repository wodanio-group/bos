<template>

  <Dialog
    :open="open === true"
    @update:open="onUpdateOpen">
    <div class="flex flex-col">
      <p class="text-sm text-secondary-600 mb-2" v-html="$t(`contactEdit.personCompanyRelations.searchDialog.${contactType}.title`)"></p>
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
            <span class="text-xs text-primary-950/60 font-semibold" v-html="result.customerId" v-if="result.customerId"></span>
            <span class="text-sm text-primary-950" v-html="result.name"></span>
          </button>
        </template>
      </div>
    </div>  
  </Dialog>

</template>

<script setup lang="ts">
import type InputSearch from '../InputSearch.vue';

const searchInputRef = ref();

const props = defineProps<{
  open: boolean,
  contactType: 'company' | 'person',
}>();
const open = computed(() => props.open ?? false);

const emits = defineEmits<{
  'select': [string],
  'close': [void],
}>();

const onUpdateOpen = (open: boolean) => {
  if (!open)
    emits('close');
  searchResults.value = [];
}

const searchResults = ref<any[]>();
const onUpdateSearch = async (value: string | null | undefined) => {
  const search = filterString(value);
  if (!search || search.length < 3) {
    searchResults.value = [];
  } else {
    try {
      searchResults.value = (await $fetch<any[]>(`/api/${props.contactType}?search=${value}&take=20`))
        .map(o => ({
          id: o.id,
          customerId: o.customerId ?? null,
          name: (props.contactType === 'company')
            ? companyDisplayName(o)
            : (props.contactType === 'person')
              ? personDisplayName(o)
              : '?',
        }))
        .sort((a, b) => a.name.localeCompare(b.name));
    } catch (e) {
      console.error(e);
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
