<template>

  <quote-pes-convert-dialog
    v-if="showPesDialog && pesCustomer"
    :quote="quote"
    :pesCustomer="pesCustomer"
    :open="showPesDialog"
    @update:open="showPesDialog = false">
  </quote-pes-convert-dialog>

  <tr
    class="text-sm text-primary-950 border-b border-b-secondary-200 transition-color hover:bg-secondary-50 cursor-pointer"
    @click="navigateTo(`/quote/${quote.id}`)">
    <td class="px-4 py-3">
      <div class="flex items-center gap-1.5">
        <atom-icon :icon="statusIcon(quote.status).name" class="!text-base flex-shrink-0" :class="statusIcon(quote.status).classes"/>
        <span>{{ $t(`quote.status.${quote.status}`) }}</span>
      </div>
    </td>
    <td class="px-4 py-3 font-medium truncate">{{ quote.quoteId }}</td>
    <td class="px-4 py-3 text-secondary-600">{{ formatDate(quote.quoteDate) }}</td>
    <td class="px-4 py-3 text-right">{{ formatCurrency(quote.subtotal) }}</td>
    <td class="px-4 py-3 w-12" @click.stop>
      <div class="flex justify-end items-center">
        <DropdownMenuRoot>
          <DropdownMenuTrigger class="transition-colors hover:bg-secondary-100 px-1 rounded">
            <atom-icon icon="ellipsis" class="!text-lg"/>
          </DropdownMenuTrigger>
          <DropdownMenuPortal>
            <DropdownMenuContent
              :align="'end'"
              class="bg-white border border-secondary-200 rounded-lg shadow-lg py-1 shadow-secondary-100 min-w-[150px]">
              <DropdownMenuItem
                class="flex justify-start items-center gap-2 px-3 py-1 cursor-pointer text-sm text-left rounded-lg transition-colors hover:bg-secondary-100 whitespace-nowrap"
                @select="navigateTo(`/quote/${quote.id}`)">
                <atom-icon icon="external-link" class="flex-shrink-0"/>
                <span>{{ $t('general.view') }}</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                class="flex justify-start items-center gap-2 px-3 py-1 cursor-pointer text-sm text-left rounded-lg transition-colors hover:bg-secondary-100 whitespace-nowrap"
                @select="emit('downloadPdf', quote)">
                <atom-icon icon="download" class="flex-shrink-0"/>
                <span>{{ $t('quote.item.downloadPdf') }}</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                v-if="pesCustomer && hasPesInteractRight"
                class="flex justify-start items-center gap-2 px-3 py-1 cursor-pointer text-sm text-left rounded-lg transition-colors hover:bg-secondary-100 whitespace-nowrap"
                @select="showPesDialog = true">
                <atom-icon icon="package-plus" class="flex-shrink-0"/>
                <span>{{ $t('quote.pesConvert.menuItem') }}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenuPortal>
        </DropdownMenuRoot>
      </div>
    </td>
  </tr>

</template>

<script setup lang="ts">
import { DateTime } from 'luxon';
import { formatCurrency } from '~~/shared/utils/default';
import type { QuoteViewModel } from '~~/shared/types/quote';

defineProps<{
  quote: QuoteViewModel;
  pesCustomer?: { id: string } | null;
  hasPesInteractRight?: boolean;
}>();
const emit = defineEmits<{ downloadPdf: [quote: QuoteViewModel] }>();

const showPesDialog = ref(false);

const formatDate = (dateStr: string) =>
  DateTime.fromISO(dateStr).toFormat($t('format.date'));

const statusIcon = (status: string) => {
  switch (status) {
    case 'DRAFT':    return { name: 'notebook-pen',      classes: 'text-gray-600' };
    case 'SENT':     return { name: 'send',              classes: 'text-blue-600' };
    case 'ACCEPTED': return { name: 'circle-check-big',  classes: 'text-green-600' };
    case 'REJECTED': return { name: 'circle-x',          classes: 'text-red-600' };
    default:         return { name: 'file',              classes: 'text-gray-400' };
  }
};
</script>
