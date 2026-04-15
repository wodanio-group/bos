<template>

  <PageSectionBox class="col-span-12">

    <div class="flex flex-col gap-6 p-4">

      <div class="flex flex-col gap-1.5">
        <label class="text-xs font-semibold text-secondary-500 uppercase tracking-wide">
          {{ $t('pes.export.selectType') }}
        </label>
        <select
          v-model="selectedKey"
          class="px-3 py-2 text-sm border border-secondary-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent">
          <option value="" disabled>{{ $t('pes.export.selectTypePlaceholder') }}</option>
          <option
            v-for="exportType in exportTypes"
            :key="exportType.key"
            :value="exportType.key">
            {{ $t(exportType.titleKey) }}
          </option>
        </select>
      </div>

      <div v-if="selectedExport" class="flex flex-col gap-3">
        <div class="flex items-start gap-3 p-3 bg-secondary-50 rounded-lg border border-secondary-100">
          <atom-icon :icon="selectedExport.icon" class="text-secondary-400 !text-lg mt-0.5"/>
          <div class="flex flex-col gap-1 flex-1">
            <div class="flex items-center gap-2">
              <span class="text-sm font-medium text-secondary-900">{{ $t(selectedExport.titleKey) }}</span>
              <span class="text-xs font-mono bg-secondary-200 text-secondary-600 px-2 py-0.5 rounded">
                {{ selectedExport.format }}
              </span>
            </div>
            <p class="text-xs text-secondary-500">{{ $t(selectedExport.descriptionKey) }}</p>
          </div>
        </div>

        <div class="flex justify-end">
          <atom-button
            type="button"
            icon="download"
            :title="$t('pes.export.download')"
            :loading="downloading"
            @click="onDownload">
          </atom-button>
        </div>
      </div>

    </div>

  </PageSectionBox>

</template>

<script setup lang="ts">
import { DateTime } from 'luxon';

type ExportDefinition = {
  key: string;
  titleKey: string;
  descriptionKey: string;
  icon: string;
  format: string;
  apiPath: string;
  apiQuery: Record<string, string>;
  filename: () => string;
};

const { downloadFile } = useFileDownload();
const toast = useToast();

const selectedKey = ref<string>('');
const downloading = ref(false);

const exportTypes: ExportDefinition[] = [
  {
    key: 'customer-datev',
    titleKey: 'pes.export.types.customerDatev.title',
    descriptionKey: 'pes.export.types.customerDatev.description',
    icon: 'users',
    format: 'DATEV CSV',
    apiPath: '/api/pes/customer/export',
    apiQuery: { format: 'datev' },
    filename: () => `kunden-datev-${DateTime.now().toFormat('yyyy-MM-dd')}.csv`,
  },
];

const selectedExport = computed(() =>
  exportTypes.find(e => e.key === selectedKey.value) ?? null,
);

const onDownload = async () => {
  if (!selectedExport.value || downloading.value) return;
  downloading.value = true;
  try {
    const query = new URLSearchParams(selectedExport.value.apiQuery).toString();
    await downloadFile(`${selectedExport.value.apiPath}?${query}`, selectedExport.value.filename());
  } catch {
    toast.add({ type: 'error', title: $t('pes.export.toast.downloadError') });
  } finally {
    downloading.value = false;
  }
};
</script>
