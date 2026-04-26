<template>

  <div class="col-span-12 flex flex-col gap-4">

    <PageSectionBox :title="$t('pes.export.sections.customers')">
      <div class="flex flex-col gap-4 p-4">
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold text-secondary-500 uppercase tracking-wide">
            {{ $t('pes.export.selectFormat') }}
          </label>
          <select
            v-model="selectedCustomerKey"
            class="px-3 py-2 text-sm border border-secondary-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent">
            <option value="" disabled>{{ $t('pes.export.selectFormatPlaceholder') }}</option>
            <option
              v-for="exportType in customerExportTypes"
              :key="exportType.key"
              :value="exportType.key">
              {{ $t(exportType.titleKey) }}
            </option>
          </select>
        </div>

        <div v-if="selectedCustomerExport" class="flex flex-col gap-3">
          <div class="flex items-start gap-3 p-3 bg-secondary-50 rounded-lg border border-secondary-100">
            <atom-icon :icon="selectedCustomerExport.icon" class="text-secondary-400 !text-lg mt-0.5"/>
            <div class="flex flex-col gap-1 flex-1">
              <div class="flex items-center gap-2">
                <span class="text-sm font-medium text-secondary-900">{{ $t(selectedCustomerExport.titleKey) }}</span>
                <span class="text-xs font-mono bg-secondary-200 text-secondary-600 px-2 py-0.5 rounded">
                  {{ selectedCustomerExport.format }}
                </span>
              </div>
              <p class="text-xs text-secondary-500">{{ $t(selectedCustomerExport.descriptionKey) }}</p>
            </div>
          </div>

          <div class="flex justify-end">
            <atom-button
              type="button"
              icon="download"
              :title="$t('pes.export.download')"
              :loading="downloadingCustomer"
              @click="onDownload('customer')">
            </atom-button>
          </div>
        </div>
      </div>
    </PageSectionBox>

    <PageSectionBox :title="$t('pes.export.sections.charges')">
      <div class="flex flex-col gap-4 p-4">
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold text-secondary-500 uppercase tracking-wide">
            {{ $t('pes.export.selectFormat') }}
          </label>
          <select
            v-model="selectedChargeKey"
            class="px-3 py-2 text-sm border border-secondary-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent">
            <option value="" disabled>{{ $t('pes.export.selectFormatPlaceholder') }}</option>
            <option
              v-for="exportType in chargeExportTypes"
              :key="exportType.key"
              :value="exportType.key">
              {{ $t(exportType.titleKey) }}
            </option>
          </select>
        </div>

        <div v-if="selectedChargeExport" class="flex flex-col gap-3">
          <div class="flex items-start gap-3 p-3 bg-secondary-50 rounded-lg border border-secondary-100">
            <atom-icon :icon="selectedChargeExport.icon" class="text-secondary-400 !text-lg mt-0.5"/>
            <div class="flex flex-col gap-1 flex-1">
              <div class="flex items-center gap-2">
                <span class="text-sm font-medium text-secondary-900">{{ $t(selectedChargeExport.titleKey) }}</span>
                <span class="text-xs font-mono bg-secondary-200 text-secondary-600 px-2 py-0.5 rounded">
                  {{ selectedChargeExport.format }}
                </span>
              </div>
              <p class="text-xs text-secondary-500">{{ $t(selectedChargeExport.descriptionKey) }}</p>
            </div>
          </div>

          <div class="flex justify-end">
            <atom-button
              type="button"
              icon="download"
              :title="$t('pes.export.download')"
              :loading="downloadingCharge"
              @click="onDownload('charge')">
            </atom-button>
          </div>
        </div>
      </div>
    </PageSectionBox>

  </div>

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

const selectedCustomerKey = ref<string>('');
const selectedChargeKey = ref<string>('');
const downloadingCustomer = ref(false);
const downloadingCharge = ref(false);

const customerExportTypes: ExportDefinition[] = [
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

const chargeExportTypes: ExportDefinition[] = [
  {
    key: 'charges-datev',
    titleKey: 'pes.export.types.chargesDatev.title',
    descriptionKey: 'pes.export.types.chargesDatev.description',
    icon: 'file-invoice',
    format: 'DATEV CSV',
    apiPath: '/api/pes/charge/export',
    apiQuery: { format: 'datev' },
    filename: () => `rechnungen-datev-${DateTime.now().toFormat('yyyy-MM-dd')}.csv`,
  },
];

const selectedCustomerExport = computed(() =>
  customerExportTypes.find(e => e.key === selectedCustomerKey.value) ?? null,
);

const selectedChargeExport = computed(() =>
  chargeExportTypes.find(e => e.key === selectedChargeKey.value) ?? null,
);

const onDownload = async (section: 'customer' | 'charge') => {
  const isCustomer = section === 'customer';
  const exportDef = isCustomer ? selectedCustomerExport.value : selectedChargeExport.value;
  const downloading = isCustomer ? downloadingCustomer : downloadingCharge;

  if (!exportDef || downloading.value) return;
  downloading.value = true;
  try {
    const query = new URLSearchParams(exportDef.apiQuery).toString();
    await downloadFile(`${exportDef.apiPath}?${query}`, exportDef.filename());
  } catch {
    toast.add({ type: 'error', title: $t('pes.export.toast.downloadError') });
  } finally {
    downloading.value = false;
  }
};
</script>
