<template>

  <DialogRoot
    v-model:open="open">
    <DialogPortal>
      <DialogOverlay class="absolute top-0 left-0 w-full h-full backdrop-blur-sm z-[98]"/>
      <DialogContent
        class="fixed top-[15%] left-[50%] max-h-[85vh] w-[90vw] max-w-[24rem] translate-x-[-50%] shadow-lg text-sm rounded-xl overflow-hidden border border-secondary-200 bg-secondary-50 focus:outline-none z-[99]">
        <ComboboxRoot :open="true">
          <ComboboxInput
            :placeholder="$t('layout.dialogSearch.searchPlaceholder')"
            class="bg-transparent w-full px-4 py-2.5 text-sm outline-none ring-0 rounded-t-xl text-primary-950 placeholder-primary-950/60"
            :class="{ 'rounded-b-xl': !(shownNoFindings || findings.length > 0) }"
            @keydown.enter.prevent
            @update:model-value="onUpdate"/>
          <ComboboxContent
            class="border-t border-secondary-200 max-h-[20rem] overflow-y-auto"
            :class="{ 'p-2': (shownNoFindings || findings.length > 0) }"
            @escape-key-down="open = false">
            <ComboboxEmpty 
              class="text-center p-4 text-sm text-primary-950"
              v-if="shownNoFindings">
              {{ $t('layout.dialogSearch.noResults') }}
            </ComboboxEmpty>
            <ComboboxGroup
              v-if="findings.length > 0">
              <ComboboxItem
                v-for="item in findings"
                :key="item.id"
                :value="item"
                class="cursor-pointer px-4 py-2 rounded-md data-[highlighted]:bg-secondary-100 inline-flex w-full items-center gap-4"
                @select="onSelect(item)">
                <Icon :icon="item.type === 'person' ? 'lucide:user-round' : 'lucide:building'" />
                <span>{{ item.title }}</span>
              </ComboboxItem>
            </ComboboxGroup>
          </ComboboxContent>
        </ComboboxRoot>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>

</template>

<script setup lang="ts">

import { companyDisplayName, personDisplayName } from '#imports';

interface IFinding {
  type: 'person' | 'company';
  id: string;
  title: string;
  to: string;
  updatedAt: number;
}

const layoutMenu = useLayoutMenu();

const open = defineModel<boolean>('open');

const input = useState<string>('dialogSearchInput', () => ''),
      findings = useState<IFinding[]>('dialogSearchFindings', () => ([])),
      shownNoFindings = computed(() => input.value.length > 2 && findings.value.length <= 0);

const onSelect = (item: IFinding) => {
  open.value = false;
  layoutMenu.setOpen(false);
  return navigateTo(item.to);
};

const onUpdate = async (value: string) => {
  input.value = value;
  if (value.length <= 2) {
    findings.value = [];
    return;
  }
  try {
    const persons = await $fetch(`/api/person?search=${value}&take=10`),
          companies = await $fetch(`/api/company?search=${value}&take=10`);
    findings.value = ([
      ...persons.map(o => ({
        type: 'person',
        id: o.id,
        title: personDisplayName(o as any),
        to: `/person/${o.id}`,
        updatedAt: (new Date(o.updatedAt ?? o.createdAt)).getTime()
      })),
      ...companies.map(o => ({
        type: 'company',
        id: o.id,
        title: companyDisplayName(o as any, { withCustomerId: true }),
        to: `/company/${o.id}`,
        updatedAt: (new Date(o.updatedAt ?? o.createdAt)).getTime()
      }))
    ] as IFinding[]).sort((a, b) => a.updatedAt - b.updatedAt);
  } catch (e) { }
};

</script>
