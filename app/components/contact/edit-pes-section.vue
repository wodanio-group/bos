<template>

  <page-section-box
    v-if="pesCustomer"
    :title="$t('company.edit.pesSection.title')"
    class="col-span-1 lg:col-span-12">
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 p-4">
      <atom-input
        type="text"
        :title="$t('general.iban')"
        class="col-span-1 lg:col-span-6"
        v-model="iban">
      </atom-input>
      <atom-select
        :title="$t('general.noDunnings')"
        :items="[{ title: $t('general.yes'), value: 'true' }, { title: $t('general.no'), value: 'false' }]"
        class="col-span-1 lg:col-span-6"
        v-model="noDunningsStr">
      </atom-select>
    </div>
  </page-section-box>

</template>

<script setup lang="ts">
type PesCustomer = { id: string; iban: string | null; noDunnings: boolean };
type PesChange = { id: string; iban: string | undefined; noDunnings: boolean };

const props = defineProps<{ customerId: string | null }>();
const emits = defineEmits<{ change: [value: PesChange | null] }>();

const auth = useAuth();
const user = await auth.getUser();
const hasPesRights = user?.rights.includes('pes.read') && user?.rights.includes('pes.interact');

const pesCustomer = ref<PesCustomer | null>(null);
const iban = ref<string | undefined>(undefined);
const noDunningsStr = ref<string>('false');

if (hasPesRights && props.customerId) {
  const { enabled } = await $fetch<{ enabled: boolean }>('/api/pes/enabled');
  if (enabled) {
    const result = await $fetch<{ items: PesCustomer[] }>('/api/pes/customer', {
      query: { externalId: props.customerId },
    });
    pesCustomer.value = result.items.at(0) ?? null;
    if (pesCustomer.value) {
      iban.value = pesCustomer.value.iban ?? undefined;
      noDunningsStr.value = pesCustomer.value.noDunnings ? 'true' : 'false';
      emits('change', { id: pesCustomer.value.id, iban: iban.value, noDunnings: pesCustomer.value.noDunnings });
    }
  }
}

watch([iban, noDunningsStr], ([newIban, newNoDunningsStr]) => {
  if (pesCustomer.value)
    emits('change', { id: pesCustomer.value.id, iban: newIban, noDunnings: newNoDunningsStr === 'true' });
});
</script>
