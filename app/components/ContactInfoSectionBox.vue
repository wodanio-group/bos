<template>

  <PageSectionBox>
    <template #headerRight>
      <Button
        type="button"
        icon="lucide:edit"
        :title="$t('general.edit')">
      </Button>
    </template>
    <div
      class="flex flex-col gap-4 py-4">
      <template
        v-for="line in lines">
        <div
          v-if="line.title && line.value && (!line.type || line.type === 'text')"
          class="w-full flex items-center justify-between gap-2 px-4">
          <span class="text-xs font-semibold text-secondary-600">{{ line.title }}</span>
          <span class="text-sm text-right" v-html="line.value"></span>
        </div>
        <div
          v-if="line.type === 'div'"
          class="w-full h-0 border-t border-t-secondary-200">
        </div>
      </template>
    </div>
  </PageSectionBox>

</template>

<script setup lang="ts">
import type { CompanyViewModel, PersonViewModel } from '~~/shared/types/contact';

const props = defineProps<{
  contact: CompanyViewModel | PersonViewModel
}>();
const isCompany = computed(() => ('customerId' in props.contact));

const lines: {
  type?: 'text' | 'div',
  title?: string | null,
  value?: string | null
}[] = [
  { title: $t('general.externalId'), value: props.contact.externalId },
  { title: $t('general.customerId'), value: ('customerId' in props.contact) ? props.contact.customerId : null },
  { title: $t('general.name'), value: isCompany.value ? companyDisplayName(props.contact as any) : personDisplayName(props.contact as any) },
  { title: $t('general.vatId'), value: ('vatId' in props.contact) ? props.contact.vatId : null },
  { title: $t('general.taxId'), value: ('taxId' in props.contact) ? props.contact.taxId : null },
  ...(((props.contact.communicationWays.length > 0) ? [{ type: 'div' }] : []) as any),
  ...props.contact.communicationWays
    .sort((a, b) => String(a.type).localeCompare(String(b.type)))
    .map(o => {

      return {
        title: `${$t('contactCommunicationWayCategories.'+o.category)} ${$t('contactCommunicationWayTypes.'+o.type)}`,
        value: (o.type === 'EMAIL')
          ? `<a class="hover:underline" href="mailto:${o.value}" target="_blank">${o.value}</a>`
          : (o.type === 'PHONE')
            ? `<a class="hover:underline" href="tel:${o.value}" target="_blank">${o.value}</a>`
            : `<a class="hover:underline" href="${o.value}" target="_blank">${o.value}</a>`
      };
    }),
  ...(((props.contact.addresses.length > 0) ? [{ type: 'div' }] : []) as any),
  ...props.contact.addresses
    .map(o => {

      return {
        title: $t('contactAddressCategories.'+o.category),
        value: [
          o.address,
          o.address2,
          o.address3,
          o.address4,
          (o.city && o.zipCode) ? `${o.zipCode} ${o.city}` : null,
          $t('countries.'+o.country)
        ].map(o => o?.trim() ?? '').filter(o => o.length > 0).join('<br>')
      };
    })
];

</script>
