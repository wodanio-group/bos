<template>

  <Page :title="$t('dashboard.title')">

    <div class="col-span-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

      <!-- Companies Stats -->
      <PageSectionBox 
        v-if="companiesCount !== null"
        :title="$t('dashboard.stats.companies')">
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
      <PageSectionBox
        v-if="personsCount !== null"
        :title="$t('dashboard.stats.persons')">
        <div class="p-6">
          <div class="text-3xl font-bold text-gray-900 dark:text-white">
            {{ personsCount }}
          </div>
          <div class="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {{ $t('dashboard.stats.totalPersons') }}
          </div>
        </div>
      </PageSectionBox>

      <!-- Projects Stats -->
      <PageSectionBox
        v-if="projectsCount !== null"
        :title="$t('dashboard.stats.projects')">
        <div class="p-6">
          <div class="text-3xl font-bold text-gray-900 dark:text-white">
            {{ projectsCount }}
          </div>
          <div class="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {{ $t('dashboard.stats.totalProjects') }}
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
const companiesCount = ref<number | null>(null);
const personsCount = ref<number | null>(null);
const projectsCount = ref<number | null>(null);

const { data: stats } = await useFetch<StatsItem[]>('/api/stats', {
  method: 'POST',
  body: {
    keys: ['TOTAL_COMPANY_COUNT', 'TOTAL_PERSON_COUNT', 'TOTAL_PROJECT_COUNT']
  }
});

if (stats.value) {
  companiesCount.value = stats.value.find(s => s.key === 'TOTAL_COMPANY_COUNT')?.value ?? null;
  personsCount.value   = stats.value.find(s => s.key === 'TOTAL_PERSON_COUNT')?.value ?? null;
  projectsCount.value  = stats.value.find(s => s.key === 'TOTAL_PROJECT_COUNT')?.value ?? null;
}

</script>
