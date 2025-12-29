<template>

  <page-section-box 
    :title="$t('contactEdit.baseInfo.title')"
    class="col-span-1 lg:col-span-12">
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 p-4">

      <atom-input
        type="text"
        :title="$t('general.name')"
        class="col-span-1 lg:col-span-6"
        v-model="baseInfos.name"
        v-if="contactType === 'company'">
      </atom-input>

      <atom-input
        type="text"
        :title="$t('general.name2')"
        class="col-span-1 lg:col-span-6"
        v-model="baseInfos.name2"
        v-if="contactType === 'company'">
      </atom-input>

      <atom-input
        type="text"
        :title="$t('general.taxId')"
        class="col-span-1 lg:col-span-6"
        v-model="baseInfos.taxId"
        v-if="contactType === 'company'">
      </atom-input>

      <atom-input
        type="text"
        :title="$t('general.vatId')"
        class="col-span-1 lg:col-span-6"
        v-model="baseInfos.vatId"
        v-if="contactType === 'company'">
      </atom-input>

      <atom-select
        :title="$t('general.gender')"
        :items="ContactGenders.map(o => ({ title: $t(`genders.${o}`), value: o }))"
        class="col-span-1 lg:col-span-2"
        v-model="baseInfos.gender"
        v-if="contactType === 'person'">
      </atom-select>

      <atom-input
        type="text"
        :title="$t('general.firstname')"
        class="col-span-1 lg:col-span-5"
        v-model="baseInfos.firstname"
        v-if="contactType === 'person'">
      </atom-input>

      <atom-input
        type="text"
        :title="$t('general.familyname')"
        class="col-span-1 lg:col-span-5"
        v-model="baseInfos.familyname"
        v-if="contactType === 'person'">
      </atom-input>

      <atom-input
        type="date"
        :title="$t('general.birthday')"
        class="col-span-1 lg:col-span-12"
        v-model="baseInfos.birthdayAt"
        v-if="contactType === 'person'">
      </atom-input>

    </div>
  </page-section-box>

  <page-section-box 
    :title="$t('contactEdit.communicationWays.title')"
    class="col-span-1 lg:col-span-6"
    :fixed-height="true">
    <div class="flex flex-col p-4">

      <div class="w-full flex justify-between items-center py-2 pt-0">
        <span class="text-sm text-gray-700 leading-none font-semibold" v-html="$t('general.phone')"></span>
        <atom-button
          type="button"
          :title="$t('general.add')"
          icon="plus"
          @click="updateCommunicationWays({ type: 'PHONE' })">
        </atom-button>
      </div>

      <contact-edit-communication-way-item
        :communication-way="item"
        :key="item.uid"
        v-for="item in phoneCommunicationWays"
        @change="updateCommunicationWays({ ...$event, uid: item.uid }, item.uid)"
        @remove="updateCommunicationWays(null, item.uid)"
        class="py-2">
      </contact-edit-communication-way-item>
      <div 
        class="flex justify-center items-center w-full py-2"
        v-if="phoneCommunicationWays.length <= 0">
        <p class="text-xs text-gray-400 leading-none text-center" v-html="$t('general.noItemsFound')"></p>
      </div>

      <div class="w-full flex justify-between items-center py-2 pt-4 mt-2 border-t border-t-secondary-200">
        <span class="text-sm text-gray-700 leading-none font-semibold" v-html="$t('general.email')"></span>
        <atom-button
          type="button"
          :title="$t('general.add')"
          icon="plus"
          @click="updateCommunicationWays({ type: 'EMAIL' })">
        </atom-button>
      </div>

      <contact-edit-communication-way-item
        :communication-way="item"
        :key="item.uid"
        v-for="item in emailCommunicationWays"
        @change="updateCommunicationWays({ ...$event, uid: item.uid }, item.uid)"
        @remove="updateCommunicationWays(null, item.uid)"
        class="py-2">
      </contact-edit-communication-way-item>
      <div 
        class="flex justify-center items-center w-full py-2"
        v-if="emailCommunicationWays.length <= 0">
        <p class="text-xs text-gray-400 leading-none text-center" v-html="$t('general.noItemsFound')"></p>
      </div>

      <div class="w-full flex justify-between items-center py-2 pt-4 mt-2 border-t border-t-secondary-200">
        <span class="text-sm text-gray-700 leading-none font-semibold" v-html="$t('general.web')"></span>
        <atom-button
          type="button"
          :title="$t('general.add')"
          icon="plus"
          @click="updateCommunicationWays({ type: 'WEB' })">
        </atom-button>
      </div>

      <contact-edit-communication-way-item
        :communication-way="item"
        :key="item.uid"
        v-for="item in webCommunicationWays"
        @change="updateCommunicationWays({ ...$event, uid: item.uid }, item.uid)"
        @remove="updateCommunicationWays(null, item.uid)"
        class="py-2 last:pb-0">
      </contact-edit-communication-way-item>
      <div 
        class="flex justify-center items-center w-full py-2"
        v-if="webCommunicationWays.length <= 0">
        <p class="text-xs text-gray-400 leading-none text-center" v-html="$t('general.noItemsFound')"></p>
      </div>
      
    </div>
  </page-section-box>

  <page-section-box 
    :title="$t('contactEdit.addresses.title')"
    class="col-span-1 lg:col-span-6"
    :fixed-height="true">
    <template #headerRight>
      <atom-button
        type="button"
        :title="$t('general.add')"
        icon="plus"
        @click="updateAddresses({})">
      </atom-button>
    </template>
    <div class="flex flex-col p-4">
      <contact-edit-address-item
        :contact-address="item"
        :key="item.uid"
        v-for="item in addresses"
        @change="updateAddresses({ ...$event, uid: item.uid }, item.uid)"
        @remove="updateAddresses(null, item.uid)"
        class="border-t border-t-secondary-200 py-4 first:border-t-0 first:pt-0 last:pb-0">
      </contact-edit-address-item>
      <div 
        class="flex justify-center items-center w-full py-2"
        v-if="addresses.length <= 0">
        <p class="text-xs text-gray-400 leading-none text-center" v-html="$t('general.noItemsFound')"></p>
      </div>
    </div>
  </page-section-box>

  <page-section-box 
    :title="$t((contactType === 'person') ? 'contactEdit.personCompanyRelations.companiesTitle' : 'contactEdit.personCompanyRelations.personsTitle')"
    class="col-span-1 lg:col-span-12"
    :fixed-height="true">
    <template #headerRight>
      <atom-button
        type="button"
        :title="$t('general.add')"
        icon="plus"
        @click="openSearchPersonCompanyRelationDialog = true">
      </atom-button>
    </template>
    <div class="flex flex-col gap-4 p-4">
      <template
        :key="item.id"
        v-for="item in personCompanyRelationItems">
        <contact-edit-person-company-relation-item
          :contact-type="(contactType === 'company') ? 'person' : 'company'"
          :item="item"
          @change="updatePersonCompanyRelationItems($event)"
          @delete="deletePersonCompanyRelationItem(item.id)">
        </contact-edit-person-company-relation-item>
      </template>
      <div 
        class="flex justify-center items-center w-full py-2"
        v-if="personCompanyRelationItems.length <= 0">
        <p class="text-xs text-gray-400 leading-none text-center" v-html="$t('general.noItemsFound')"></p>
      </div>
    </div>
  </page-section-box>

  <organism-dialog-entity-search
    :open="openSearchPersonCompanyRelationDialog"
    :title="$t(`contactEdit.personCompanyRelations.searchDialog.${(contactType === 'company') ? 'person' : 'company'}.title`)"
    :search-fn="searchPersonCompanyRelation"
    @select="(id) => {
      updatePersonCompanyRelationItems({ id, role: null });
      openSearchPersonCompanyRelationDialog = false;
    }"
    @close="openSearchPersonCompanyRelationDialog = false">
  </organism-dialog-entity-search>

</template>

<script setup lang="ts">
import { DateTime } from 'luxon';
import type { ContactAddressViewModel, ContactCommunicationWayViewModel, ContactViewModel } from '~~/shared/types/contact';
import { ContactGenders } from '~~/shared/utils/contact';

const emits = defineEmits<{
  change: [value: ContactViewModel]
}>();

const props = defineProps<{
  contact?: ContactViewModel | null,
}>();
const contactType = computed<'company' | 'person'>(() => (props.contact && 'firstname' in props.contact) ? 'person' : 'company');

const baseInfos = ref({
  name: (props.contact && 'name' in props.contact) ? props.contact.name ?? '' : '',
  name2: (props.contact && 'name2' in props.contact) ? props.contact.name2 ?? '' : '',
  taxId: (props.contact && 'taxId' in props.contact) ? props.contact.taxId ?? '' : '',
  vatId: (props.contact && 'vatId' in props.contact) ? props.contact.vatId ?? '' : '',
  firstname: (props.contact && 'firstname' in props.contact) ? props.contact.firstname ?? '' : '',
  surename: (props.contact && 'surename' in props.contact) ? props.contact.surename ?? '' : '',
  familyname: (props.contact && 'familyname' in props.contact) ? props.contact.familyname ?? '' : '',
  gender: (props.contact && 'gender' in props.contact) ? props.contact.gender ?? '' : '',
  birthdayAt: (props.contact && 'birthdayAt' in props.contact && props.contact.birthdayAt) ? DateTime.fromISO(props.contact.birthdayAt).toFormat('yyyy-LL-dd') : '',
});

const addresses = ref<Partial<(ContactAddressViewModel & { uid: string })>[]>((props.contact?.addresses ?? []).map(o => ({
  uid: crypto.randomUUID(),
  ...o,
})));
const updateAddresses = (value: Partial<(ContactAddressViewModel & { uid: string })> | null, uid?: string) => {
  if (uid === undefined && value !== null) {
    addresses.value.push({ ...value, uid: crypto.randomUUID() });
  } else if (uid !== undefined && value === null) {
    addresses.value = addresses.value.filter(o => o.uid !== uid);
  } else if (uid !== undefined && value !== null) {
    addresses.value = addresses.value.map(o => (o.uid === uid) ? value : o);
  }
}; 

const communicationWays = ref<Partial<(ContactCommunicationWayViewModel & { uid: string })>[]>((props.contact?.communicationWays ?? []).map(o => ({
  uid: crypto.randomUUID(),
  ...o,
})));
const phoneCommunicationWays = computed(() => (communicationWays?.value ?? []).filter(o => o.type === 'PHONE'));
const emailCommunicationWays = computed(() => (communicationWays?.value ?? []).filter(o => o.type === 'EMAIL'));
const webCommunicationWays = computed(() => (communicationWays?.value ?? []).filter(o => o.type === 'WEB'));
const updateCommunicationWays = (value: Partial<(ContactCommunicationWayViewModel & { uid: string })> | null, uid?: string) => {
  if (uid === undefined && value !== null) {
    communicationWays.value.push({ ...value, uid: crypto.randomUUID() });
  } else if (uid !== undefined && value === null) {
    communicationWays.value = communicationWays.value.filter(o => o.uid !== uid);
  } else if (uid !== undefined && value !== null) {
    communicationWays.value = communicationWays.value.map(o => (o.uid === uid) ? value : o);
  }
}; 

const openSearchPersonCompanyRelationDialog = ref<boolean>(false);
const personCompanyRelationFieldName = computed(() => (contactType.value === 'company') ? 'persons' : 'companies');
const personCompanyRelationItems = ref<{ id: string, role: string | null }[]>((props.contact && 'persons' in props.contact)
  ? props.contact.persons
  : (props.contact && 'companies' in props.contact)
    ? props.contact.companies
    : []);
const updatePersonCompanyRelationItems = (value: { id: string, role: string | null }) => {
  if (personCompanyRelationItems.value.find(o => o.id === value.id)) {
    personCompanyRelationItems.value = personCompanyRelationItems.value.map(o => (o.id === value.id) ? value : o);
  } else {
    personCompanyRelationItems.value.push(value);
  }
};

// Search function for person/company relations
const searchPersonCompanyRelation = async (query: string) => {
  const searchType = (contactType.value === 'company') ? 'person' : 'company';
  const results = await $fetch<any[]>(`/api/${searchType}?search=${query}&take=20`);

  return results
    .map(o => ({
      id: o.id,
      title: (searchType === 'company')
        ? companyDisplayName(o)
        : personDisplayName(o),
      subtitle: o.customerId ?? null,
    }))
    .sort((a, b) => a.title.localeCompare(b.title));
};
const deletePersonCompanyRelationItem = (id: string) => {
  personCompanyRelationItems.value = personCompanyRelationItems.value.filter(o => (o.id !== id));
};

watch([baseInfos, addresses, communicationWays, personCompanyRelationItems], ([baseInfos, addresses, communicationWays, personCompanyRelationItems]) => {
  if (!props.contact)
    return;
  emits('change', {
    ...props.contact,
    ...baseInfos,
    name: filterString(baseInfos.name),
    name2: filterString(baseInfos.name2),
    taxId: filterString(baseInfos.taxId),
    vatId: filterString(baseInfos.vatId),
    firstname: filterString(baseInfos.firstname),
    surename: filterString(baseInfos.surename),
    familyname: filterString(baseInfos.familyname),
    birthdayAt: (baseInfos.birthdayAt.length > 0) ? `${baseInfos.birthdayAt}T00:00:00Z`: null,
    addresses: addresses as ContactAddressViewModel[],
    communicationWays: communicationWays as ContactCommunicationWayViewModel[],
    [personCompanyRelationFieldName.value]: personCompanyRelationItems,
  });
}, { deep: true, immediate: true });

</script>
