<template>

  <div>

    <label class="w-full flex flex-col gap-1 relative">
      <span class="text-xs text-gray-600 font-semibold" v-if="title">
        {{ title }}{{ (required === true) ? ' *' : '' }}
      </span>
      <button
        type="button"
        @click="openDialog"
        class="w-full px-4 py-1.5 text-sm text-left border border-secondary-200 rounded-lg shadow shadow-gray-100 focus:border-gray-500 focus:outline-none focus:ring-0 hover:border-gray-400 transition-colors"
        :class="{
          'text-primary-950': selectedName,
          'text-secondary-500': !selectedName
        }">
        <span v-if="selectedName">{{ selectedName }}</span>
        <span v-else>{{ placeholder }}</span>
      </button>
    </label>

    <molecule-dialog-entity-search
      :open="dialogOpen"
      :title="searchTitle"
      :search-fn="searchFn"
      @select="onSelect"
      @close="dialogOpen = false">
    </molecule-dialog-entity-search>

  </div>

</template>

<script setup lang="ts">

const selectedId = defineModel<string>();

const props = defineProps<{
  title?: string | null;
  required?: boolean | null;
  placeholder: string;
  searchTitle: string;
  searchFn: (query: string) => Promise<{ id: string; title: string; subtitle?: string | null }[]>;
  loadEntityFn: (id: string) => Promise<{ name?: string; firstname?: string; familyname?: string; [key: string]: any }>;
  formatNameFn?: (entity: any) => string;
}>();

const dialogOpen = ref(false);
const selectedName = ref<string>('');

const openDialog = () => {
  dialogOpen.value = true;
};

const onSelect = async (id: string) => {
  selectedId.value = id;
  const entity = await props.loadEntityFn(id);

  if (props.formatNameFn) {
    selectedName.value = props.formatNameFn(entity);
  } else {
    // Default formatting
    selectedName.value = entity.name || `${entity.firstname || ''} ${entity.familyname || ''}`.trim() || id;
  }

  dialogOpen.value = false;
};

// Load entity name if selectedId is already set
watch(() => selectedId.value, async (newId) => {
  if (newId && !selectedName.value) {
    try {
      const entity = await props.loadEntityFn(newId);

      if (props.formatNameFn) {
        selectedName.value = props.formatNameFn(entity);
      } else {
        selectedName.value = entity.name || `${entity.firstname || ''} ${entity.familyname || ''}`.trim() || newId;
      }
    } catch (e) {
      console.error('Failed to load entity name', e);
    }
  }
}, { immediate: true });

</script>
