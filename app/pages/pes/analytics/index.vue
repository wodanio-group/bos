<template>

  <div class="col-span-12 flex flex-col gap-4">

    <!-- Filter bar -->
    <PageSectionBox :hidde-header="true">
      <div class="flex items-center justify-end gap-3 p-3">
        <pes-cost-center-select
          v-model="costCenterFilter"
          :null-label="$t('company.pes.allCostCenters')"
          :compact="true"/>
        <atom-button
          type="button"
          icon="refresh-cw"
          :outline="true"
          :loading="loading"
          :title="$t('general.reload')"
          @click="load"/>
      </div>
    </PageSectionBox>

    <!-- MRR -->
    <PageSectionBox :title="$t('pes.analytics.mrr.title')">
      <div v-if="loading" class="w-full flex items-center justify-center h-20">
        <atom-icon icon="loader-circle" class="animate-spin text-secondary-400 !text-xl"/>
      </div>
      <div v-else class="grid grid-cols-2 gap-px bg-secondary-100">
        <div class="flex flex-col gap-1 p-5 bg-white">
          <span class="text-xs font-semibold text-secondary-500 uppercase tracking-wide">
            {{ $t('pes.analytics.mrr.realistic') }}
          </span>
          <span class="text-2xl font-bold text-primary-950">{{ formatCurrency(mrrRealistic) }}</span>
          <span class="text-xs text-secondary-400">{{ $t('pes.analytics.mrr.realisticDesc') }}</span>
        </div>
        <div class="flex flex-col gap-1 p-5 bg-white">
          <span class="text-xs font-semibold text-secondary-500 uppercase tracking-wide">
            {{ $t('pes.analytics.mrr.optimistic') }}
          </span>
          <span class="text-2xl font-bold text-primary-950">{{ formatCurrency(mrrOptimistic) }}</span>
          <span class="text-xs text-secondary-400">{{ $t('pes.analytics.mrr.optimisticDesc') }}</span>
        </div>
      </div>
    </PageSectionBox>

    <!-- Revenue -->
    <PageSectionBox :title="$t('pes.analytics.revenue.title')">
      <template #headerRight>
        <div class="flex items-center gap-2">
          <label class="text-xs text-secondary-500">{{ $t('pes.analytics.revenue.from') }}</label>
          <InputMonthPicker v-model="fromMonth"/>
          <label class="text-xs text-secondary-500">{{ $t('pes.analytics.revenue.to') }}</label>
          <InputMonthPicker v-model="toMonth"/>
        </div>
      </template>

      <div v-if="loading" class="w-full flex items-center justify-center h-20">
        <atom-icon icon="loader-circle" class="animate-spin text-secondary-400 !text-xl"/>
      </div>
      <table v-else class="w-full text-sm">
        <thead>
          <tr class="border-b border-secondary-200">
            <th class="px-4 py-2 text-left text-xs font-semibold text-secondary-500">{{ $t('pes.analytics.revenue.month') }}</th>
            <th class="px-4 py-2 text-right text-xs font-semibold text-secondary-500">{{ $t('pes.analytics.revenue.items') }}</th>
            <th class="px-4 py-2 text-right text-xs font-semibold text-secondary-500">{{ $t('pes.analytics.revenue.net') }}</th>
            <th class="px-4 py-2 text-right text-xs font-semibold text-secondary-500">{{ $t('pes.analytics.revenue.gross') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="row in revenueRows"
            :key="row.month"
            class="border-b border-secondary-100 last:border-b-0 hover:bg-secondary-50">
            <td class="px-4 py-2 font-medium">{{ row.month }}</td>
            <td class="px-4 py-2 text-right text-secondary-600">{{ row.count }}</td>
            <td class="px-4 py-2 text-right">{{ formatCurrency(row.net) }}</td>
            <td class="px-4 py-2 text-right font-medium">{{ formatCurrency(row.gross) }}</td>
          </tr>
          <tr v-if="revenueRows.length > 0" class="border-t-2 border-secondary-200 bg-secondary-50">
            <td class="px-4 py-2 text-xs font-semibold text-secondary-500 uppercase tracking-wide">{{ $t('pes.analytics.revenue.total') }}</td>
            <td class="px-4 py-2 text-right font-semibold">{{ revenueTotal.count }}</td>
            <td class="px-4 py-2 text-right font-semibold">{{ formatCurrency(revenueTotal.net) }}</td>
            <td class="px-4 py-2 text-right font-bold">{{ formatCurrency(revenueTotal.gross) }}</td>
          </tr>
          <tr v-else-if="!loading">
            <td colspan="4" class="px-4 py-8 text-center text-secondary-400 text-sm">{{ $t('general.noItemsFound') }}</td>
          </tr>
        </tbody>
      </table>
    </PageSectionBox>

  </div>

</template>

<script setup lang="ts">
import { DateTime } from 'luxon';
import { formatCurrency } from '~~/shared/utils/default';

type RecurringChargeItem = {
  id: string;
  startAt: string;
  endAt: string | null;
  periodQuantity: number;
  periodUnit: 'HOUR' | 'DAY' | 'WEEK' | 'MONTH' | 'YEAR';
  quantity: number;
  price: number;
  costCenterId: string | null;
};

type ChargeItem = {
  id: string;
  serviceDate: string;
  subtotal: number;
  total: number;
  costCenterId: string | null;
};

type RevenueRow = { month: string; count: number; net: number; gross: number };

const toast = useToast();

const costCenterFilter = ref<string | null>(null);

const now = DateTime.now();
const fromMonth = ref(now.minus({ months: 11 }).toFormat('yyyy-MM'));
const toMonth   = ref(now.toFormat('yyyy-MM'));

const loading = ref(false);
const rciItems  = ref<RecurringChargeItem[]>([]);
const chargeItems = ref<ChargeItem[]>([]);

// ── MRR ─────────────────────────────────────────────────────────────────────

const periodUnitFactor = (unit: string) => {
  switch (unit) {
    case 'HOUR': return 1;
    case 'DAY':  return 24;
    case 'WEEK': return 168;
    case 'MONTH': return 730;
    case 'YEAR': return 8760;
    default: return 1;
  }
};

const calcMrr = (items: RecurringChargeItem[]) =>
  items.reduce((sum, item) => {
    const factor = item.periodQuantity * periodUnitFactor(item.periodUnit);
    return sum + (item.price / factor) * item.quantity;
  }, 0) * 730;

const mrrRealistic = computed(() => {
  const endOfMonth = now.endOf('month');
  return calcMrr(rciItems.value.filter(item => {
    const startAt = DateTime.fromISO(item.startAt);
    const endAt   = item.endAt ? DateTime.fromISO(item.endAt) : null;
    return startAt <= now && (endAt === null || endAt > endOfMonth);
  }));
});

const mrrOptimistic = computed(() => {
  const endOfMonth = now.endOf('month');
  return calcMrr(rciItems.value.filter(item => {
    const startAt = DateTime.fromISO(item.startAt);
    const endAt   = item.endAt ? DateTime.fromISO(item.endAt) : null;
    return (endAt === null || endAt > endOfMonth)
      && (startAt <= now || endAt === null || endAt > startAt.plus({ hours: 1 }));
  }));
});

// ── Revenue ──────────────────────────────────────────────────────────────────

const revenueRows = computed<RevenueRow[]>(() => {
  const from = DateTime.fromFormat(fromMonth.value, 'yyyy-MM').startOf('month');
  const to   = DateTime.fromFormat(toMonth.value,   'yyyy-MM').endOf('month');

  const months: RevenueRow[] = [];
  let cursor = from;
  while (cursor <= to) {
    const monthStart = cursor.startOf('month');
    const monthEnd   = cursor.endOf('month');
    const monthItems = chargeItems.value.filter(ci => {
      const d = DateTime.fromISO(ci.serviceDate);
      return d >= monthStart && d <= monthEnd;
    });
    months.push({
      month: cursor.toFormat('yyyy-MM'),
      count: monthItems.length,
      net:   monthItems.reduce((s, ci) => s + ci.subtotal, 0),
      gross: monthItems.reduce((s, ci) => s + ci.total, 0),
    });
    cursor = cursor.plus({ months: 1 });
  }
  return months.reverse();
});

const revenueTotal = computed(() => ({
  count: revenueRows.value.reduce((s, r) => s + r.count, 0),
  net:   revenueRows.value.reduce((s, r) => s + r.net, 0),
  gross: revenueRows.value.reduce((s, r) => s + r.gross, 0),
}));

// ── Load ─────────────────────────────────────────────────────────────────────

const load = async () => {
  loading.value = true;
  const costCenterIds = costCenterFilter.value ? [costCenterFilter.value] : undefined;
  try {
    const [rciResult, ciResult] = await Promise.all([
      $fetch<{ items: RecurringChargeItem[] }>('/api/pes/recurring-charge-item', {
        query: { take: 999999, ...(costCenterIds ? { costCenterIds } : {}) },
      }),
      $fetch<{ items: ChargeItem[] }>('/api/pes/charge-item', {
        query: { take: 999999, ...(costCenterIds ? { costCenterIds } : {}) },
      }),
    ]);
    rciItems.value   = rciResult.items;
    chargeItems.value = ciResult.items;
  } catch {
    toast.add({ type: 'error', title: $t('general.loadError') });
  } finally {
    loading.value = false;
  }
};

watch(costCenterFilter, load);
onMounted(load);
</script>
