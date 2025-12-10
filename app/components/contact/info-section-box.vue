<template>

  <PageSectionBox>
    <template #headerRight>
      <atom-button
        type="button"
        icon="square-pen"
        :title="$t('general.edit')"
        @click="emits('edit')">
      </atom-button>
    </template>
    <div class="flex flex-col gap-4 py-4">
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
    <div 
      class="border-t border-t-secondary-200 flex flex-col gap-4 p-4"
      v-if="hasRelations">
      <contact-info-section-box-person-company-relation-item
        v-for="item of personCompanyRelationItems"
        :key="item.id"
        :contactType="(contactType === 'company') ? 'person' : 'company'"
        :item="item">
      </contact-info-section-box-person-company-relation-item>
    </div>
  </PageSectionBox>

</template>

<script setup lang="ts">
import type { CompanyViewModel, PersonViewModel } from '~~/shared/types/contact';

const emits = defineEmits<{
  edit: []
}>();

const props = defineProps<{
  contact: CompanyViewModel | PersonViewModel
}>();
const contactType = computed<'company' | 'person'>(() => (props.contact && 'firstname' in props.contact) ? 'person' : 'company');
const hasRelations = computed(() => (contactType.value === 'company' && props.contact && 'persons' in props.contact && props.contact.persons.length > 0) 
                      || (contactType.value === 'person' && props.contact && 'companies' in props.contact && props.contact.companies.length > 0));

const personCompanyRelationItems = computed(() => (props.contact && 'persons' in props.contact)
  ? props.contact.persons
  : (props.contact && 'companies' in props.contact)
    ? props.contact.companies
    : []);

const lines: {
  type?: 'text' | 'div',
  title?: string | null,
  value?: string | null
}[] = [
  { title: $t('general.externalId'), value: props.contact.externalId },
  { title: $t('general.customerId'), value: ('customerId' in props.contact) ? props.contact.customerId : null },
  { title: $t('general.name'), value: (contactType.value === 'company') ? companyDisplayName(props.contact as any) : personDisplayName(props.contact as any) },
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
