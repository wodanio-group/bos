<template>

  <Page
    :title="isCreateMode ? $t('quote.create.title') : $t('quote.edit.title', { quoteId: item?.quoteId })">
    <template #header>
      <atom-button
        type="button"
        icon="circle-x"
        :title="$t('general.cancel')"
        :outline="true"
        @click="navigateBack()">
      </atom-button>
      <atom-button
        type="button"
        icon="save"
        :title="isCreateMode ? $t('quote.create.save') : $t('quote.edit.save')"
        @click="onSave()">
      </atom-button>
    </template>

    <div class="col-span-12">
      <PageSectionBox :title="isCreateMode ? $t('quote.create.basicInfo') : $t('quote.edit.basicInfo')">
        <div class="px-4 py-3 grid grid-cols-2 gap-4">

          <atom-select
            :title="$t('quote.fields.status')"
            :required="true"
            :items="statusItems"
            v-model="editForm.status"/>

          <molecular-input-entity-select
            v-if="hasRightUserAllRead"
            :title="$t('quote.fields.owner')"
            :placeholder="$t('quote.create.selectOwner')"
            :search-title="$t('quote.create.searchOwner')"
            :search-fn="searchUser"
            :load-entity-fn="loadUser"
            :format-name-fn="userDisplayName"
            v-model="editForm.ownerId"/>

          <molecular-input-entity-select
            :title="$t('quote.fields.company')"
            :required="true"
            :placeholder="$t('quote.create.selectCompany')"
            :search-title="$t('quote.create.searchCompany')"
            :search-fn="searchCompany"
            :load-entity-fn="loadCompany"
            v-model="editForm.companyId"
            class="col-span-2">
          </molecular-input-entity-select>

          <atom-input
            type="date"
            :title="$t('quote.fields.quoteDate')"
            :required="true"
            v-model="editForm.quoteDate"/>

          <atom-input
            type="date"
            :title="$t('quote.fields.validUntil')"
            v-model="editForm.quoteValidUntil"/>

          <atom-textarea
            :title="$t('quote.fields.introText')"
            :rows="4"
            v-model="editForm.introText"/>

          <atom-textarea
            :title="$t('quote.fields.outroText')"
            :rows="4"
            v-model="editForm.outroText"/>
        </div>
      </PageSectionBox>

      <PageSectionBox :title="$t('quote.edit.items')" class="mt-4">
        <template #headerRight>
          <atom-button
            type="button"
            icon="plus"
            :title="$t('quote.edit.addItem')"
            :outline="true"
            @click="addItem()">
          </atom-button>
        </template>
        <div class="divide-y divide-secondary-100">
          <div
            v-for="(quoteItem, index) in editForm.quoteItems"
            :key="index"
            :ref="el => { if (el) quoteItemRefs[index] = el }"
            class="px-4 py-3 hover:bg-secondary-50">
            <div class="flex items-start gap-3">
              <div class="grid grid-cols-12 gap-3 flex-1">
                <div class="col-span-12">
                  <atom-input
                    type="text"
                    :title="$t('quote.edit.itemTitle')"
                    :required="true"
                    v-model="quoteItem.title"/>
                </div>

                <div class="col-span-12">
                  <atom-textarea
                    :title="$t('quote.edit.itemDescription')"
                    :rows="2"
                    v-model="quoteItem.description"/>
                </div>

                <div class="col-span-3">
                  <atom-input
                    type="number"
                    step="0.01"
                    :title="$t('quote.edit.price')"
                    :required="true"
                    v-model.number="quoteItem.price"/>
                </div>

                <div class="col-span-2">
                  <atom-input
                    type="number"
                    step="0.01"
                    :title="$t('quote.edit.quantity')"
                    :required="true"
                    v-model.number="quoteItem.quantity"/>
                </div>

                <div class="col-span-2">
                  <molecular-select-unit
                    :title="$t('quote.edit.unit')"
                    v-model="quoteItem.unit"/>
                </div>

                <div class="col-span-2">
                  <molecular-select-tax-rate
                    :title="$t('quote.edit.taxRate')"
                    :required="true"
                    v-model="quoteItem.taxRate"/>
                </div>

                <div class="col-span-3">
                  <label class="w-full flex flex-col gap-1">
                    <span class="text-xs text-gray-600 font-semibold">{{ $t('quote.edit.itemSubtotal') }}</span>
                    <div class="w-full px-4 py-1.5 text-sm text-primary-950 bg-secondary-50 border border-secondary-200 rounded-lg">
                      {{ formatCurrency(calculateItemSubtotal(quoteItem)) }}
                    </div>
                  </label>
                </div>
              </div>
              <div class="flex flex-col gap-2">
                <atom-button
                  type="button"
                  icon="chevron-up"
                  :disabled="index === 0"
                  :outline="true"
                  @click="moveItemUp(index)">
                </atom-button>
                <atom-button
                  type="button"
                  icon="chevron-down"
                  :disabled="index === editForm.quoteItems.length - 1"
                  :outline="true"
                  @click="moveItemDown(index)">
                </atom-button>
                <atom-button
                  type="button"
                  icon="trash-2"
                  :outline="true"
                  @click="removeItem(index)">
                </atom-button>
              </div>
            </div>
          </div>
        </div>

        <div class="border-t-2 border-t-secondary-300 bg-secondary-50 px-4 py-3">
          <div class="flex justify-between items-center mb-2">
            <span class="text-sm text-secondary-700">{{ $t('quote.item.subtotal') }}</span>
            <span class="text-sm font-medium text-primary-950">{{ formatCurrency(calculatedTotals.subtotal) }}</span>
          </div>
          <div class="flex justify-between items-center mb-2">
            <span class="text-sm text-secondary-700">{{ $t('quote.item.tax') }}</span>
            <span class="text-sm font-medium text-primary-950">{{ formatCurrency(calculatedTotals.tax) }}</span>
          </div>
          <div class="flex justify-between items-center pt-2 border-t border-t-secondary-200">
            <span class="text-base font-semibold text-primary-950">{{ $t('quote.item.total') }}</span>
            <span class="text-base font-bold text-primary-600">{{ formatCurrency(calculatedTotals.total) }}</span>
          </div>
        </div>
      </PageSectionBox>
    </div>

  </Page>

</template>

<script setup lang="ts">
import type { QuoteViewModel } from '~~/shared/types/quote';
import { calculateQuoteItemTotals, calculateQuoteTotals, QuoteStatuses } from '~~/shared/utils/quote';
import { formatCurrency } from '~~/shared/utils/default';
import { userDisplayName } from '~~/shared/utils/user';
import { DateTime } from 'luxon';

definePageMeta({
  middleware: ['auth']
});

const route = useRoute();
const toast = useToast();
const auth = useAuth();
const user = await auth.getUser();

// Check if we're in create mode (id === '+')
const isCreateMode = computed(() => route.params.id === '+');

// User rights
const hasRightUserAllRead = computed(() => user && user.rights.includes('user.all.view'));

// Status items for select
const statusItems = QuoteStatuses.map(status => ({
  title: $t(`quote.status.${status}`),
  value: status
}));

const { item, upsert, loadItem, clearItem } = useCrud<QuoteViewModel>({
  apiPath: '/api/quote'
});

// Only load item if not in create mode
if (!isCreateMode.value) {
  await loadItem();
}

const navigateBack = (id?: string) => {
  if (isCreateMode.value) {
    return navigateTo('/quote');
  }
  return navigateTo(`/quote/${id ?? item.value?.id}`);
};

interface EditQuoteItem {
  quotePosition: number;
  title: string;
  description: string;
  quantity: number;
  unit: string;
  price: number;
  taxRate: number | undefined;
}

// Company search for create mode
const searchCompany = async (query: string) => {
  const results: any = await $fetch('/api/company', {
    params: { search: query, take: 20 }
  });
  return (results as any[]).map((c: any) => ({
    id: c.id,
    title: c.name || `${c.firstname || ''} ${c.familyname || ''}`.trim() || c.customerId,
    subtitle: c.customerId
  }));
};

const loadCompany = async (id: string) => {
  return await $fetch(`/api/company/${id}`) as any;
};

// User search
const searchUser = async (query: string) => {
  const results: any = await $fetch('/api/user', {
    params: { search: query, take: 20 }
  });
  return (results as any[]).map((u: any) => ({
    id: u.id,
    title: u.displayName || u.email,
    subtitle: u.email
  }));
};

const loadUser = async (id: string) => {
  return await $fetch(`/api/user/${id}`) as any;
};

// Load default values from options for create mode
const { item: defaultIntroOption, loadItem: loadDefaultIntro } = useOption('QUOTE_DEFAULT_INTRO_TEXT');
const { item: defaultOutroOption, loadItem: loadDefaultOutro } = useOption('QUOTE_DEFAULT_OUTRO_TEXT');

if (isCreateMode.value) {
  await Promise.all([
    loadDefaultIntro(),
    loadDefaultOutro()
  ]);
}

const editForm = ref({
  status: item.value?.status || 'DRAFT',
  companyId: item.value?.companyId || '',
  ownerId: item.value?.ownerId || user?.id,
  quoteDate: item.value?.quoteDate || DateTime.now().toFormat('yyyy-LL-dd'),
  quoteValidUntil: item.value?.quoteValidUntil || '',
  introText: item.value?.introText || defaultIntroOption.value?.value?.value as string || '',
  outroText: item.value?.outroText || defaultOutroOption.value?.value.value as string || '',
  quoteItems: (item.value?.quoteItems || [{
    quotePosition: 1,
    title: '',
    description: '',
    quantity: 1,
    unit: '',
    price: 0,
    taxRate: undefined,
  }]).map(qi => ({
    quotePosition: qi.quotePosition,
    title: qi.title,
    description: qi.description || '',
    quantity: qi.quantity,
    unit: qi.unit || '',
    price: qi.price,
    taxRate: qi.taxRate,
  })) as EditQuoteItem[]
});

const calculateItemSubtotal = (item: EditQuoteItem) => {
  const totals = calculateQuoteItemTotals(item.quantity || 0, item.price || 0, item.taxRate || 0);
  return totals.subtotal;
};

const calculatedTotals = computed(() => {
  const itemsWithTotals = editForm.value.quoteItems.map(item =>
    calculateQuoteItemTotals(item.quantity || 0, item.price || 0, item.taxRate || 0)
  );
  return calculateQuoteTotals(itemsWithTotals);
});

const quoteItemRefs = ref<any[]>([]);

const addItem = () => {
  const maxPosition = editForm.value.quoteItems.length > 0
    ? Math.max(...editForm.value.quoteItems.map(i => i.quotePosition))
    : 0;

  editForm.value.quoteItems.push({
    quotePosition: maxPosition + 1,
    title: '',
    description: '',
    quantity: 1,
    unit: '',
    price: 0,
    taxRate: undefined,
  });

  // Scroll to the newly added item
  nextTick(() => {
    const newIndex = editForm.value.quoteItems.length - 1;
    const newItemElement = quoteItemRefs.value[newIndex];
    if (newItemElement) {
      const el = newItemElement.$el || newItemElement;
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });
};

const removeItem = (index: number) => {
  editForm.value.quoteItems.splice(index, 1);
  updatePositions();
};

const moveItemUp = (index: number) => {
  if (index > 0) {
    const item = editForm.value.quoteItems.splice(index, 1)[0];
    if (item) {
      editForm.value.quoteItems.splice(index - 1, 0, item);
      updatePositions();
    }
  }
};

const moveItemDown = (index: number) => {
  if (index < editForm.value.quoteItems.length - 1) {
    const item = editForm.value.quoteItems.splice(index, 1)[0];
    if (item) {
      editForm.value.quoteItems.splice(index + 1, 0, item);
      updatePositions();
    }
  }
};

const updatePositions = () => {
  editForm.value.quoteItems.forEach((item, index) => {
    item.quotePosition = index + 1;
  });
};

const onSave = async () => {
  try {
    if (editForm.value.quoteItems.length === 0) {
      toast.add({ type: 'error', title: $t('quote.edit.error.noItems') });
      return;
    }

    if (!editForm.value.companyId) {
      toast.add({ type: 'error', title: $t('quote.create.error.noCompany') });
      return;
    }

    if (!editForm.value.quoteDate) {
      toast.add({ type: 'error', title: $t('quote.create.error.noDate') });
      return;
    }

    const res = await upsert({
      ...(item.value ?? {}),
      status: editForm.value.status,
      companyId: filterString(editForm.value.companyId),
      ownerId: filterString(editForm.value.ownerId),
      quoteDate: editForm.value.quoteDate,
      quoteValidUntil: filterString(editForm.value.quoteValidUntil),
      introText: filterString(editForm.value.introText),
      outroText: filterString(editForm.value.outroText),
      quoteItems: editForm.value.quoteItems.map(o => ({
        quotePosition: o.quotePosition,
        title: filterString(o.title),
        description: filterString(o.description),
        quantity: o.quantity,
        unit: filterString(o.unit),
        price: o.price,
        taxRate: o.taxRate, // Already converted from percent by watcher
      })),
    } as any);

    toast.add({ type: 'success', title: $t('quote.create.toast.success') });
    navigateTo(`/quote/${res.id}`);
  } catch (e) {
    const errorKey = isCreateMode.value ? 'quote.create.toast.error' : 'quote.edit.toast.error';
    toast.add({ type: 'error', title: $t(errorKey) });
  }
};

onMounted(() => {
  if (isCreateMode)
    clearItem();
});

</script>
