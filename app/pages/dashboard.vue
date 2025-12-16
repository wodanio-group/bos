<template>

  <Page :title="$t('dashboard.title')">

    <div class="col-span-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

      <!-- Companies Stats -->
      <PageSectionBox :title="$t('dashboard.stats.companies')">
        <div class="p-6">
          <div class="text-3xl font-bold text-gray-900 dark:text-white">
            {{ companiesCount }}
          </div>
          <div class="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {{ $t('dashboard.stats.totalCompanies') }}
          </div>
        </div>
      </PageSectionBox>

      <!-- Persons Stats -->
      <PageSectionBox :title="$t('dashboard.stats.persons')">
        <div class="p-6">
          <div class="text-3xl font-bold text-gray-900 dark:text-white">
            {{ personsCount }}
          </div>
          <div class="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {{ $t('dashboard.stats.totalPersons') }}
          </div>
        </div>
      </PageSectionBox>

    </div>

    <!-- <TimeTrackingStartStopSection
      class="col-span-12 lg:col-span-4"
      v-if="hasRightTimetrackingOwn === true">
    </TimeTrackingStartStopSection> -->

  </Page>

</template>

<script setup lang="ts">

definePageMeta({
  middleware: ['auth']
});

const auth = useAuth();
const user = await auth.getUser();

const hasRightTimetrackingOwn = computed(() => user
  && ( (user.rights.includes('timetracking.all.view') && user.rights.includes('timetracking.all.edit'))
    || (user.rights.includes('timetracking.own.view') && user.rights.includes('timetracking.own.create')) ));

// Fetch dashboard statistics
const companiesCount = ref(0);
const personsCount = ref(0);

// Load company count
const { items: companies, loadItems: loadCompanies } = useCrud<CompanyViewModel>({
  apiPath: '/api/company'
});
await loadCompanies();
companiesCount.value = companies.value.length;

// Load person count
const { items: persons, loadItems: loadPersons } = useCrud<PersonViewModel>({
  apiPath: '/api/person'
});
await loadPersons();
personsCount.value = persons.value.length;

</script>
