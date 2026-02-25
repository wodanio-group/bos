<template>

  <page-section-box
    v-if="pesCustomer"
    :title="$t('company.pes.title')"
    :fixedHeight="true"
    class="col-span-1 lg:col-span-12">

    <template #headerLeft>
      <button
        class="px-3 py-1 text-sm font-medium border-b-2 transition-colors"
        :class="activeTab === 'mandates'
          ? 'border-primary-600 text-primary-600'
          : 'border-transparent text-secondary-500 hover:text-secondary-700'"
        @click="activeTab = 'mandates'">
        {{ $t('company.pes.mandates.tabTitle') }}
      </button>
      <button
        class="px-3 py-1 text-sm font-medium border-b-2 transition-colors"
        :class="activeTab === 'recurringChargeItems'
          ? 'border-primary-600 text-primary-600'
          : 'border-transparent text-secondary-500 hover:text-secondary-700'"
        @click="activeTab = 'recurringChargeItems'">
        {{ $t('company.pes.recurringChargeItems.tabTitle') }}
      </button>
      <button
        class="px-3 py-1 text-sm font-medium border-b-2 transition-colors"
        :class="activeTab === 'chargeItems'
          ? 'border-primary-600 text-primary-600'
          : 'border-transparent text-secondary-500 hover:text-secondary-700'"
        @click="activeTab = 'chargeItems'">
        {{ $t('company.pes.chargeItems.tabTitle') }}
      </button>
      <button
        class="px-3 py-1 text-sm font-medium border-b-2 transition-colors"
        :class="activeTab === 'charges'
          ? 'border-primary-600 text-primary-600'
          : 'border-transparent text-secondary-500 hover:text-secondary-700'"
        @click="activeTab = 'charges'">
        {{ $t('company.pes.charges.tabTitle') }}
      </button>
    </template>

    <template #headerRight>
      <atom-button
        v-if="hasPesInteractRight && activeTab === 'mandates'"
        type="button"
        icon="plus"
        :title="$t('company.pes.mandates.create')"
        @click="showCreateDialog = true">
      </atom-button>
      <atom-button
        v-if="hasPesInteractRight && activeTab === 'recurringChargeItems'"
        type="button"
        icon="plus"
        :title="$t('company.pes.recurringChargeItems.create')"
        @click="showCreateRciDialog = true">
      </atom-button>
      <atom-button
        v-if="hasPesInteractRight && activeTab === 'chargeItems'"
        type="button"
        icon="plus"
        :title="$t('company.pes.chargeItems.create')"
        @click="showCreateCiDialog = true">
      </atom-button>
      <atom-button
        v-if="hasPesInteractRight && activeTab === 'charges'"
        type="button"
        icon="plus"
        :title="$t('company.pes.charges.create')"
        @click="showCreateChargeDialog = true">
      </atom-button>
    </template>

    <!-- Mandates tab -->
    <div v-if="activeTab === 'mandates'" class="flex flex-col py-2">
      <div
        v-if="mandates.length === 0"
        class="w-full flex items-center justify-center h-20">
        <p class="text-center text-secondary-700 text-sm">{{ $t('general.noItemsFound') }}</p>
      </div>
      <div
        v-for="mandate in mandates"
        :key="mandate.id"
        class="flex flex-col gap-2 px-4 py-3 border-b border-b-secondary-200 last:border-b-0">
        <div class="flex items-center justify-between gap-2">
          <span
            v-if="!mandate.revokedAt"
            class="text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
            {{ $t('company.pes.mandates.active') }}
          </span>
          <span v-else class="text-xs text-secondary-500">
            {{ $t('company.pes.mandates.revokedAt') }}: {{ formatDate(mandate.revokedAt) }}
          </span>
          <atom-button
            v-if="!mandate.revokedAt && hasPesInteractRight"
            type="button"
            icon="ban"
            :title="$t('company.pes.mandates.revoke')"
            :outline="true"
            @click="mandateToRevoke = mandate">
          </atom-button>
        </div>
        <div class="w-full flex items-center justify-between gap-2">
          <span class="text-xs font-semibold text-secondary-600">{{ $t('company.pes.mandates.payer') }}</span>
          <span class="text-sm text-right">{{ mandate.payer }}</span>
        </div>
        <div class="w-full flex items-center justify-between gap-2">
          <span class="text-xs font-semibold text-secondary-600">{{ $t('general.iban') }}</span>
          <span class="text-sm text-right">{{ formatIban(mandate.iban) }}</span>
        </div>
        <div class="w-full flex items-center justify-between gap-2">
          <span class="text-xs font-semibold text-secondary-600">{{ $t('general.bic') }}</span>
          <span class="text-sm text-right">{{ mandate.bic }}</span>
        </div>
        <div class="w-full flex items-center justify-between gap-2">
          <span class="text-xs font-semibold text-secondary-600">{{ $t('general.bankName') }}</span>
          <span class="text-sm text-right">{{ mandate.bankName }}</span>
        </div>
        <div class="w-full flex items-center justify-between gap-2">
          <span class="text-xs font-semibold text-secondary-600">{{ $t('company.pes.mandates.grantedAt') }}</span>
          <span class="text-sm text-right">{{ formatDate(mandate.grantedAt) }}</span>
        </div>
        <div v-if="mandate.referenceID" class="w-full flex items-center justify-between gap-2">
          <span class="text-xs font-semibold text-secondary-600">{{ $t('company.pes.mandates.referenceID') }}</span>
          <span class="text-sm text-right">{{ mandate.referenceID }}</span>
        </div>
      </div>
    </div>

    <!-- Recurring Charge Items tab -->
    <div v-if="activeTab === 'recurringChargeItems'" class="flex flex-col py-2">
      <div
        v-if="recurringChargeItems.length === 0"
        class="w-full flex items-center justify-center h-20">
        <p class="text-center text-secondary-700 text-sm">{{ $t('general.noItemsFound') }}</p>
      </div>
      <div
        v-for="rci in recurringChargeItems"
        :key="rci.id"
        class="flex flex-col gap-2 px-4 py-3 border-b border-b-secondary-200 last:border-b-0">
        <div class="flex items-center justify-between gap-2">
          <span
            v-if="!rci.endAt || new Date(rci.endAt) > new Date()"
            class="text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
            {{ $t('company.pes.recurringChargeItems.active') }}
          </span>
          <span v-else class="text-xs text-secondary-500">
            {{ $t('company.pes.recurringChargeItems.endAt') }}: {{ formatDate(rci.endAt!) }}
          </span>
          <div v-if="hasPesInteractRight" class="flex gap-1">
            <atom-button
              type="button"
              icon="pencil"
              :title="$t('company.pes.recurringChargeItems.edit')"
              :outline="true"
              @click="openEditRci(rci)">
            </atom-button>
            <atom-button
              type="button"
              icon="calendar-x"
              :title="$t('company.pes.recurringChargeItems.end')"
              :outline="true"
              @click="openEndRci(rci)">
            </atom-button>
          </div>
        </div>
        <div class="w-full flex items-center justify-between gap-2">
          <span class="text-xs font-semibold text-secondary-600">{{ $t('company.pes.recurringChargeItems.title') }}</span>
          <span class="text-sm text-right">{{ rci.title }}</span>
        </div>
        <div v-if="rci.description" class="w-full flex items-center justify-between gap-2">
          <span class="text-xs font-semibold text-secondary-600">{{ $t('company.pes.recurringChargeItems.description') }}</span>
          <span class="text-sm text-right">{{ rci.description }}</span>
        </div>
        <div class="w-full flex items-center justify-between gap-2">
          <span class="text-xs font-semibold text-secondary-600">{{ $t('company.pes.recurringChargeItems.period') }}</span>
          <span class="text-sm text-right">{{ rci.periodQuantity }} {{ $t(`company.pes.recurringChargeItems.periodUnits.${rci.periodUnit}`) }}</span>
        </div>
        <div class="w-full flex items-center justify-between gap-2">
          <span class="text-xs font-semibold text-secondary-600">{{ $t('company.pes.recurringChargeItems.price') }}</span>
          <span class="text-sm text-right">{{ formatCurrency(rci.price) }}<span v-if="rci.unit"></span></span>
        </div>
        <div class="w-full flex items-center justify-between gap-2">
          <span class="text-xs font-semibold text-secondary-600">{{ $t('company.pes.recurringChargeItems.quantity') }}</span>
          <span class="text-sm text-right">{{ rci.quantity }}x <span v-if="rci.unit"> {{ rci.unit }}</span></span>
        </div>
        <div class="w-full flex items-center justify-between gap-2">
          <span class="text-xs font-semibold text-secondary-600">{{ $t('company.pes.recurringChargeItems.taxRate') }}</span>
          <span class="text-sm text-right">{{ (rci.taxRate * 100).toFixed(0) }} %</span>
        </div>
        <div class="w-full flex items-center justify-between gap-2">
          <span class="text-xs font-semibold text-secondary-600">{{ $t('company.pes.recurringChargeItems.startAt') }}</span>
          <span class="text-sm text-right">{{ formatDate(rci.startAt) }}</span>
        </div>
        <div v-if="rci.nextAt" class="w-full flex items-center justify-between gap-2">
          <span class="text-xs font-semibold text-secondary-600">{{ $t('company.pes.recurringChargeItems.nextAt') }}</span>
          <span class="text-sm text-right">{{ formatDate(rci.nextAt) }}</span>
        </div>
      </div>
    </div>

    <!-- Charge Items tab -->
    <div v-if="activeTab === 'chargeItems'" class="flex flex-col py-2">
      <div
        v-if="chargeItems.length === 0"
        class="w-full flex items-center justify-center h-20">
        <p class="text-center text-secondary-700 text-sm">{{ $t('general.noItemsFound') }}</p>
      </div>
      <div
        v-for="ci in chargeItems"
        :key="ci.id"
        class="flex flex-col gap-2 px-4 py-3 border-b border-b-secondary-200 last:border-b-0">
        <div class="flex items-center justify-between gap-2">
          <span
            v-if="!ci.chargeId"
            class="text-xs font-medium text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
            {{ $t('company.pes.chargeItems.unassigned') }}
          </span>
          <span v-else class="text-xs font-medium text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
            {{ $t('company.pes.chargeItems.assigned') }}
          </span>
          <div v-if="hasPesInteractRight || hasPesDeleteRight" class="flex gap-1">
            <atom-button
              v-if="hasPesInteractRight"
              type="button"
              icon="pencil"
              :title="$t('company.pes.chargeItems.edit')"
              :outline="true"
              @click="openEditCi(ci)">
            </atom-button>
            <atom-button
              v-if="hasPesDeleteRight"
              type="button"
              icon="trash"
              :title="$t('general.delete')"
              :outline="true"
              @click="ciToDelete = ci">
            </atom-button>
          </div>
        </div>
        <div class="w-full flex items-center justify-between gap-2">
          <span class="text-xs font-semibold text-secondary-600">{{ $t('company.pes.chargeItems.title') }}</span>
          <span class="text-sm text-right">{{ ci.title }}</span>
        </div>
        <div v-if="ci.description" class="w-full flex items-center justify-between gap-2">
          <span class="text-xs font-semibold text-secondary-600">{{ $t('company.pes.chargeItems.description') }}</span>
          <span class="text-sm text-right">{{ ci.description }}</span>
        </div>
        <div class="w-full flex items-center justify-between gap-2">
          <span class="text-xs font-semibold text-secondary-600">{{ $t('company.pes.chargeItems.serviceDate') }}</span>
          <span class="text-sm text-right">
            {{ formatDate(ci.serviceDate) }}<span v-if="ci.serviceDateTo"> – {{ formatDate(ci.serviceDateTo) }}</span>
          </span>
        </div>
        <div class="w-full flex items-center justify-between gap-2">
          <span class="text-xs font-semibold text-secondary-600">{{ $t('company.pes.chargeItems.quantity') }}</span>
          <span class="text-sm text-right">{{ ci.quantity }}x <span v-if="ci.unit"> {{ ci.unit }}</span></span>
        </div>
        <div class="w-full flex items-center justify-between gap-2">
          <span class="text-xs font-semibold text-secondary-600">{{ $t('company.pes.chargeItems.price') }}</span>
          <span class="text-sm text-right">{{ formatCurrency(ci.price) }}</span>
        </div>
        <div class="w-full flex items-center justify-between gap-2">
          <span class="text-xs font-semibold text-secondary-600">{{ $t('company.pes.chargeItems.taxRate') }}</span>
          <span class="text-sm text-right">{{ (ci.taxRate * 100).toFixed(0) }} %</span>
        </div>
        <div class="w-full flex items-center justify-between gap-2">
          <span class="text-xs font-semibold text-secondary-600">{{ $t('company.pes.chargeItems.total') }}</span>
          <span class="text-sm text-right font-medium">{{ formatCurrency(ci.total) }}</span>
        </div>
      </div>
    </div>

    <!-- Charges tab -->
    <div v-if="activeTab === 'charges'" class="flex flex-col py-2">
      <div
        v-if="charges.length === 0"
        class="w-full flex items-center justify-center h-20">
        <p class="text-center text-secondary-700 text-sm">{{ $t('general.noItemsFound') }}</p>
      </div>
      <div
        v-for="charge in charges"
        :key="charge.id"
        class="flex flex-col gap-2 px-4 py-3 border-b border-b-secondary-200 last:border-b-0">
        <div class="flex items-center justify-between gap-2">
          <div class="flex items-center gap-2">
            <span
              v-if="charge.manuallyPaidAt"
              class="text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
              {{ $t('company.pes.charges.paid') }}
            </span>
            <span v-else class="text-xs font-medium text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
              {{ $t('company.pes.charges.unpaid') }}
            </span>
            <span class="text-xs font-medium text-secondary-600 bg-secondary-100 px-2 py-0.5 rounded-full">
              {{ charge.type === 'INVOICE' ? $t('company.pes.charges.typeInvoice') : $t('company.pes.charges.typeCreditNote') }}
            </span>
          </div>
          <div class="flex gap-1">
            <a
              v-if="charge.url"
              :href="charge.url"
              target="_blank"
              class="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium border border-secondary-300 rounded text-secondary-600 hover:text-secondary-900 hover:border-secondary-400 transition-colors">
              {{ $t('company.pes.charges.pdf') }}
            </a>
            <atom-button
              v-if="hasPesInteractRight && !charge.manuallyPaidAt"
              type="button"
              icon="circle-check"
              :title="$t('company.pes.charges.setPaidDialog.title')"
              :outline="true"
              @click="openSetPaid(charge)">
            </atom-button>
          </div>
        </div>
        <div class="w-full flex items-center justify-between gap-2">
          <span class="text-xs font-semibold text-secondary-600">{{ $t('company.pes.charges.chargeNumber') }}</span>
          <span class="text-sm text-right font-medium">{{ charge.chargeNumber }}</span>
        </div>
        <div v-if="charge.serviceDate" class="w-full flex items-center justify-between gap-2">
          <span class="text-xs font-semibold text-secondary-600">{{ $t('company.pes.charges.serviceDate') }}</span>
          <span class="text-sm text-right">
            {{ formatDate(charge.serviceDate) }}<span v-if="charge.serviceDateTo"> – {{ formatDate(charge.serviceDateTo) }}</span>
          </span>
        </div>
        <div class="w-full flex items-center justify-between gap-2">
          <span class="text-xs font-semibold text-secondary-600">{{ $t('company.pes.charges.subtotal') }}</span>
          <span class="text-sm text-right">{{ formatCurrency(charge.subtotal) }}</span>
        </div>
        <div class="w-full flex items-center justify-between gap-2">
          <span class="text-xs font-semibold text-secondary-600">{{ $t('company.pes.charges.tax') }}</span>
          <span class="text-sm text-right">{{ formatCurrency(charge.tax) }}</span>
        </div>
        <div class="w-full flex items-center justify-between gap-2">
          <span class="text-xs font-semibold text-secondary-600">{{ $t('company.pes.charges.total') }}</span>
          <span class="text-sm text-right font-medium">{{ formatCurrency(charge.total) }}</span>
        </div>
        <div v-if="charge.manuallyPaidAt" class="w-full flex items-center justify-between gap-2">
          <span class="text-xs font-semibold text-secondary-600">{{ $t('company.pes.charges.manuallyPaidAt') }}</span>
          <span class="text-sm text-right">{{ formatDate(charge.manuallyPaidAt) }}</span>
        </div>
      </div>
    </div>

    <!-- Mandate revoke dialog -->
    <SimpleAlertDialog
      :open="mandateToRevoke !== null"
      :title="$t('company.pes.mandates.revokeDialog.title')"
      :description="$t('company.pes.mandates.revokeDialog.description')"
      :submitButtonTitle="$t('company.pes.mandates.revoke')"
      submitButtonIcon="ban"
      @submit="onRevoke"
      @cancel="mandateToRevoke = null"
      @update:open="mandateToRevoke = $event ? mandateToRevoke : null">
    </SimpleAlertDialog>

    <!-- Mandate create dialog -->
    <Dialog
      :open="showCreateDialog"
      @update:open="showCreateDialog = $event">
      <template #headerLeft>
        <p class="text-lg">{{ $t('company.pes.mandates.createDialog.title') }}</p>
      </template>
      <div class="flex flex-col gap-4 py-2">
        <atom-input
          type="text"
          :title="$t('company.pes.mandates.referenceID')"
          v-model="newReferenceID">
        </atom-input>
        <atom-input
          type="text"
          :title="$t('company.pes.mandates.payer')"
          v-model="newPayer">
        </atom-input>
        <atom-input
          type="text"
          :title="$t('general.iban')"
          v-model="newIban">
        </atom-input>
        <atom-input
          type="date"
          :title="$t('company.pes.mandates.grantedAt')"
          v-model="newGrantedAt">
        </atom-input>
        <atom-input
          type="text"
          :title="$t('company.pes.mandates.grantedByIp')"
          v-model="newGrantedByIp">
        </atom-input>
        <atom-textarea
          :title="$t('company.pes.mandates.agreement')"
          v-model="newAgreement">
        </atom-textarea>
      </div>
      <template #buttons>
        <atom-button
          type="button"
          icon="plus"
          :title="$t('company.pes.mandates.createDialog.submit')"
          @click="onCreate">
        </atom-button>
      </template>
    </Dialog>

    <!-- Recurring charge item create dialog -->
    <Dialog
      :open="showCreateRciDialog"
      @update:open="showCreateRciDialog = $event">
      <template #headerLeft>
        <p class="text-lg">{{ $t('company.pes.recurringChargeItems.createDialog.title') }}</p>
      </template>
      <div class="flex flex-col gap-4 py-2">
        <div class="flex flex-col gap-1">
          <atom-input
            type="text"
            :required="true"
            :title="$t('company.pes.recurringChargeItems.title')"
            v-model="newRciTitle">
          </atom-input>
          <p v-if="showRciCreateErrors && rciCreateErrors.title" class="text-xs text-red-500">{{ $t('general.validation.required') }}</p>
        </div>
        <atom-textarea
          :title="$t('company.pes.recurringChargeItems.description')"
          v-model="newRciDescription">
        </atom-textarea>
        <div class="grid grid-cols-2 gap-4">
          <atom-input
            type="date"
            :title="$t('company.pes.recurringChargeItems.startAt')"
            v-model="newRciStartAt">
          </atom-input>
          <atom-input
            type="date"
            :title="$t('company.pes.recurringChargeItems.endAt')"
            v-model="newRciEndAt">
          </atom-input>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div class="flex flex-col gap-1">
            <atom-input
              type="text"
              :required="true"
              :title="$t('company.pes.recurringChargeItems.quantity')"
              v-model="newRciPeriodQuantity">
            </atom-input>
            <p v-if="showRciCreateErrors && rciCreateErrors.periodQuantity" class="text-xs text-red-500">{{ $t('general.validation.mustBePositive') }}</p>
          </div>
          <atom-select
            :title="$t('company.pes.recurringChargeItems.period')"
            :items="periodUnitItems"
            v-model="newRciPeriodUnit">
          </atom-select>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div class="flex flex-col gap-1">
            <atom-input
              type="text"
              :required="true"
              :title="$t('company.pes.recurringChargeItems.price')"
              v-model="newRciPrice">
            </atom-input>
            <p v-if="showRciCreateErrors && rciCreateErrors.price" class="text-xs text-red-500">{{ $t('general.validation.invalidNumber') }}</p>
          </div>
          <molecular-select-tax-rate
            :title="$t('company.pes.recurringChargeItems.taxRate')"
            v-model="newRciTaxRate">
          </molecular-select-tax-rate>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div class="flex flex-col gap-1">
            <atom-input
              type="text"
              :required="true"
              :title="$t('company.pes.recurringChargeItems.quantity')"
              v-model="newRciQuantity">
            </atom-input>
            <p v-if="showRciCreateErrors && rciCreateErrors.quantity" class="text-xs text-red-500">{{ $t('general.validation.mustBePositive') }}</p>
          </div>
          <molecular-select-unit
            :title="$t('company.pes.recurringChargeItems.unit')"
            v-model="newRciUnit">
          </molecular-select-unit>
        </div>
        <div class="border-t border-secondary-200 pt-3 flex flex-col gap-1">
          <div class="w-full flex items-center justify-between gap-2">
            <span class="text-xs font-semibold text-secondary-600">{{ $t('company.pes.preview.subtotal') }}</span>
            <span class="text-sm text-right">{{ formatCurrency(rciCreatePreviewSubtotal) }}</span>
          </div>
          <div class="w-full flex items-center justify-between gap-2">
            <span class="text-xs font-semibold text-secondary-600">{{ $t('company.pes.preview.total') }}</span>
            <span class="text-sm text-right font-medium">{{ formatCurrency(rciCreatePreviewTotal) }}</span>
          </div>
        </div>
      </div>
      <template #buttons>
        <atom-button
          type="button"
          icon="plus"
          :title="$t('company.pes.recurringChargeItems.createDialog.submit')"
          @click="onCreateRci">
        </atom-button>
      </template>
    </Dialog>

    <!-- Recurring charge item edit dialog -->
    <Dialog
      :open="rciToEdit !== null"
      @update:open="rciToEdit = $event ? rciToEdit : null">
      <template #headerLeft>
        <p class="text-lg">{{ $t('company.pes.recurringChargeItems.editDialog.title') }}</p>
      </template>
      <div class="flex flex-col gap-4 py-2">
        <div class="flex flex-col gap-1">
          <atom-input
            type="text"
            :required="true"
            :title="$t('company.pes.recurringChargeItems.title')"
            v-model="editRciTitle">
          </atom-input>
          <p v-if="showRciEditErrors && rciEditErrors.title" class="text-xs text-red-500">{{ $t('general.validation.required') }}</p>
        </div>
        <atom-textarea
          :title="$t('company.pes.recurringChargeItems.description')"
          v-model="editRciDescription">
        </atom-textarea>
        <div class="grid grid-cols-2 gap-4">
          <div class="flex flex-col gap-1">
            <atom-input
              type="text"
              :required="true"
              :title="$t('company.pes.recurringChargeItems.price')"
              v-model="editRciPrice">
            </atom-input>
            <p v-if="showRciEditErrors && rciEditErrors.price" class="text-xs text-red-500">{{ $t('general.validation.invalidNumber') }}</p>
          </div>
          <molecular-select-tax-rate
            :title="$t('company.pes.recurringChargeItems.taxRate')"
            v-model="editRciTaxRate">
          </molecular-select-tax-rate>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div class="flex flex-col gap-1">
            <atom-input
              type="text"
              :required="true"
              :title="$t('company.pes.recurringChargeItems.quantity')"
              v-model="editRciQuantity">
            </atom-input>
            <p v-if="showRciEditErrors && rciEditErrors.quantity" class="text-xs text-red-500">{{ $t('general.validation.mustBePositive') }}</p>
          </div>
          <molecular-select-unit
            :title="$t('company.pes.recurringChargeItems.unit')"
            v-model="editRciUnit">
          </molecular-select-unit>
        </div>
        <div class="border-t border-secondary-200 pt-3 flex flex-col gap-1">
          <div class="w-full flex items-center justify-between gap-2">
            <span class="text-xs font-semibold text-secondary-600">{{ $t('company.pes.preview.subtotal') }}</span>
            <span class="text-sm text-right">{{ formatCurrency(rciEditPreviewSubtotal) }}</span>
          </div>
          <div class="w-full flex items-center justify-between gap-2">
            <span class="text-xs font-semibold text-secondary-600">{{ $t('company.pes.preview.total') }}</span>
            <span class="text-sm text-right font-medium">{{ formatCurrency(rciEditPreviewTotal) }}</span>
          </div>
        </div>
      </div>
      <template #buttons>
        <atom-button
          type="button"
          icon="save"
          :title="$t('company.pes.recurringChargeItems.editDialog.submit')"
          @click="onEditRci">
        </atom-button>
      </template>
    </Dialog>

    <!-- Recurring charge item end dialog -->
    <Dialog
      :open="rciToEnd !== null"
      @update:open="rciToEnd = $event ? rciToEnd : null">
      <template #headerLeft>
        <p class="text-lg">{{ $t('company.pes.recurringChargeItems.endDialog.title') }}</p>
      </template>
      <div class="flex flex-col gap-4 py-2">
        <p class="text-sm text-secondary-600">{{ $t('company.pes.recurringChargeItems.endDialog.description') }}</p>
        <atom-input
          type="date"
          :title="$t('company.pes.recurringChargeItems.endDialog.endAt')"
          v-model="newRciEndAtDate">
        </atom-input>
      </div>
      <template #buttons>
        <atom-button
          type="button"
          icon="save"
          :title="$t('company.pes.recurringChargeItems.endDialog.submit')"
          @click="onEndRci">
        </atom-button>
      </template>
    </Dialog>

    <!-- Charge item create dialog -->
    <Dialog
      :open="showCreateCiDialog"
      @update:open="showCreateCiDialog = $event">
      <template #headerLeft>
        <p class="text-lg">{{ $t('company.pes.chargeItems.createDialog.title') }}</p>
      </template>
      <div class="flex flex-col gap-4 py-2">
        <div class="flex flex-col gap-1">
          <atom-input
            type="text"
            :required="true"
            :title="$t('company.pes.chargeItems.title')"
            v-model="newCiTitle">
          </atom-input>
          <p v-if="showCiCreateErrors && ciCreateErrors.title" class="text-xs text-red-500">{{ $t('general.validation.required') }}</p>
        </div>
        <atom-textarea
          :title="$t('company.pes.chargeItems.description')"
          v-model="newCiDescription">
        </atom-textarea>
        <div class="grid grid-cols-2 gap-4">
          <div class="flex flex-col gap-1">
            <atom-input
              type="date"
              :required="true"
              :title="$t('company.pes.chargeItems.serviceDate')"
              v-model="newCiServiceDate">
            </atom-input>
            <p v-if="showCiCreateErrors && ciCreateErrors.serviceDate" class="text-xs text-red-500">{{ $t('general.validation.required') }}</p>
          </div>
          <atom-input
            type="date"
            :title="$t('company.pes.chargeItems.serviceDateTo')"
            v-model="newCiServiceDateTo">
          </atom-input>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div class="flex flex-col gap-1">
            <atom-input
              type="text"
              :required="true"
              :title="$t('company.pes.chargeItems.price')"
              v-model="newCiPrice">
            </atom-input>
            <p v-if="showCiCreateErrors && ciCreateErrors.price" class="text-xs text-red-500">{{ $t('general.validation.invalidNumber') }}</p>
          </div>
          <molecular-select-tax-rate
            :title="$t('company.pes.chargeItems.taxRate')"
            v-model="newCiTaxRate">
          </molecular-select-tax-rate>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div class="flex flex-col gap-1">
            <atom-input
              type="text"
              :required="true"
              :title="$t('company.pes.chargeItems.quantity')"
              v-model="newCiQuantity">
            </atom-input>
            <p v-if="showCiCreateErrors && ciCreateErrors.quantity" class="text-xs text-red-500">{{ $t('general.validation.mustBePositive') }}</p>
          </div>
          <molecular-select-unit
            :title="$t('company.pes.chargeItems.unit')"
            v-model="newCiUnit">
          </molecular-select-unit>
        </div>
        <div class="border-t border-secondary-200 pt-3 flex flex-col gap-1">
          <div class="w-full flex items-center justify-between gap-2">
            <span class="text-xs font-semibold text-secondary-600">{{ $t('company.pes.preview.subtotal') }}</span>
            <span class="text-sm text-right">{{ formatCurrency(ciCreatePreviewSubtotal) }}</span>
          </div>
          <div class="w-full flex items-center justify-between gap-2">
            <span class="text-xs font-semibold text-secondary-600">{{ $t('company.pes.preview.total') }}</span>
            <span class="text-sm text-right font-medium">{{ formatCurrency(ciCreatePreviewTotal) }}</span>
          </div>
        </div>
      </div>
      <template #buttons>
        <atom-button
          type="button"
          icon="plus"
          :title="$t('company.pes.chargeItems.createDialog.submit')"
          @click="onCreateCi">
        </atom-button>
      </template>
    </Dialog>

    <!-- Charge item edit dialog -->
    <Dialog
      :open="ciToEdit !== null"
      @update:open="ciToEdit = $event ? ciToEdit : null">
      <template #headerLeft>
        <p class="text-lg">{{ $t('company.pes.chargeItems.editDialog.title') }}</p>
      </template>
      <div class="flex flex-col gap-4 py-2">
        <div class="flex flex-col gap-1">
          <atom-input
            type="text"
            :required="true"
            :title="$t('company.pes.chargeItems.title')"
            v-model="editCiTitle">
          </atom-input>
          <p v-if="showCiEditErrors && ciEditErrors.title" class="text-xs text-red-500">{{ $t('general.validation.required') }}</p>
        </div>
        <atom-textarea
          :title="$t('company.pes.chargeItems.description')"
          v-model="editCiDescription">
        </atom-textarea>
        <div class="flex flex-col gap-1">
          <atom-input
            type="date"
            :required="true"
            :title="$t('company.pes.chargeItems.serviceDate')"
            v-model="editCiServiceDate">
          </atom-input>
          <p v-if="showCiEditErrors && ciEditErrors.serviceDate" class="text-xs text-red-500">{{ $t('general.validation.required') }}</p>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div class="flex flex-col gap-1">
            <atom-input
              type="text"
              :required="true"
              :title="$t('company.pes.chargeItems.price')"
              v-model="editCiPrice">
            </atom-input>
            <p v-if="showCiEditErrors && ciEditErrors.price" class="text-xs text-red-500">{{ $t('general.validation.invalidNumber') }}</p>
          </div>
          <molecular-select-tax-rate
            :title="$t('company.pes.chargeItems.taxRate')"
            v-model="editCiTaxRate">
          </molecular-select-tax-rate>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div class="flex flex-col gap-1">
            <atom-input
              type="text"
              :required="true"
              :title="$t('company.pes.chargeItems.quantity')"
              v-model="editCiQuantity">
            </atom-input>
            <p v-if="showCiEditErrors && ciEditErrors.quantity" class="text-xs text-red-500">{{ $t('general.validation.mustBePositive') }}</p>
          </div>
          <molecular-select-unit
            :title="$t('company.pes.chargeItems.unit')"
            v-model="editCiUnit">
          </molecular-select-unit>
        </div>
        <div class="border-t border-secondary-200 pt-3 flex flex-col gap-1">
          <div class="w-full flex items-center justify-between gap-2">
            <span class="text-xs font-semibold text-secondary-600">{{ $t('company.pes.preview.subtotal') }}</span>
            <span class="text-sm text-right">{{ formatCurrency(ciEditPreviewSubtotal) }}</span>
          </div>
          <div class="w-full flex items-center justify-between gap-2">
            <span class="text-xs font-semibold text-secondary-600">{{ $t('company.pes.preview.total') }}</span>
            <span class="text-sm text-right font-medium">{{ formatCurrency(ciEditPreviewTotal) }}</span>
          </div>
        </div>
      </div>
      <template #buttons>
        <atom-button
          type="button"
          icon="save"
          :title="$t('company.pes.chargeItems.editDialog.submit')"
          @click="onEditCi">
        </atom-button>
      </template>
    </Dialog>

    <!-- Charge item delete dialog -->
    <SimpleAlertDialog
      :open="ciToDelete !== null"
      :title="$t('company.pes.chargeItems.deleteDialog.title')"
      :description="$t('company.pes.chargeItems.deleteDialog.description')"
      :submitButtonTitle="$t('general.delete')"
      submitButtonIcon="trash"
      @submit="onDeleteCi"
      @cancel="ciToDelete = null"
      @update:open="ciToDelete = $event ? ciToDelete : null">
    </SimpleAlertDialog>

    <!-- Charge create dialog -->
    <SimpleAlertDialog
      :open="showCreateChargeDialog"
      :title="$t('company.pes.charges.createDialog.title')"
      :description="$t('company.pes.charges.createDialog.description')"
      :submitButtonTitle="$t('company.pes.charges.createDialog.submit')"
      submitButtonIcon="plus"
      @submit="onCreateCharge"
      @cancel="showCreateChargeDialog = false"
      @update:open="showCreateChargeDialog = $event">
    </SimpleAlertDialog>

    <!-- Charge set manually paid dialog -->
    <Dialog
      :open="chargeToSetPaid !== null"
      @update:open="chargeToSetPaid = $event ? chargeToSetPaid : null">
      <template #headerLeft>
        <p class="text-lg">{{ $t('company.pes.charges.setPaidDialog.title') }}</p>
      </template>
      <div class="flex flex-col gap-4 py-2">
        <p class="text-sm text-secondary-600">{{ $t('company.pes.charges.setPaidDialog.description') }}</p>
        <atom-input
          type="date"
          :title="$t('company.pes.charges.setPaidDialog.paidAt')"
          v-model="newChargeManuallyPaidAt">
        </atom-input>
      </div>
      <template #buttons>
        <atom-button
          type="button"
          icon="circle-check"
          :title="$t('company.pes.charges.setPaidDialog.submit')"
          @click="onSetManuallyPaid">
        </atom-button>
      </template>
    </Dialog>

  </page-section-box>

</template>

<script setup lang="ts">
import { DateTime } from 'luxon';
import { formatCurrency } from '~~/shared/utils/default';

type PesCustomer = { id: string };
type DirectDebitMandate = {
  id: string;
  referenceID: string;
  payer: string;
  iban: string;
  bic: string;
  bankName: string;
  grantedAt: string;
  revokedAt: string | null;
  customerId: string;
};
type RecurringChargeItem = {
  id: string;
  title: string;
  description: string | null;
  startAt: string;
  endAt: string | null;
  nextAt: string | null;
  periodQuantity: number;
  periodUnit: 'HOUR' | 'DAY' | 'WEEK' | 'MONTH' | 'YEAR';
  quantity: number;
  price: number;
  unit: string | null;
  taxRate: number;
  customerId: string;
};
type ChargeItem = {
  id: string;
  title: string;
  description: string | null;
  serviceDate: string;
  serviceDateTo: string | null;
  quantity: number;
  price: number;
  unit: string | null;
  taxRate: number;
  subtotal: number;
  tax: number;
  total: number;
  customerId: string;
  chargeId: string | null;
};
type Charge = {
  id: string;
  chargeNumber: string;
  type: 'INVOICE' | 'CREDIT_NOTE';
  serviceDate: string | null;
  serviceDateTo: string | null;
  subtotal: number;
  tax: number;
  total: number;
  url: string | null;
  manuallyPaidAt: string | null;
  documentGeneratedAt: string | null;
  customerId: string;
};

const props = defineProps<{ customerId: string | null }>();

const auth = useAuth();
const user = await auth.getUser();
const hasPesReadRight = user?.rights.includes('pes.read') ?? false;
const hasPesInteractRight = user?.rights.includes('pes.interact') ?? false;
const hasPesDeleteRight = user?.rights.includes('pes.delete') ?? false;

const toast = useToast();
const pesCustomer = ref<PesCustomer | null>(null);
const mandates = ref<DirectDebitMandate[]>([]);
const recurringChargeItems = ref<RecurringChargeItem[]>([]);
const chargeItems = ref<ChargeItem[]>([]);
const charges = ref<Charge[]>([]);

const { item: taxRatesOptionItem, loadItem: loadTaxRatesOption } = useOption('SYSTEM_TAX_RATES');
const { item: unitsOptionItem, loadItem: loadUnitsOption } = useOption('SYSTEM_UNITS');

const loadMandates = async () => {
  if (!pesCustomer.value) return;
  const result = await $fetch<{ items: DirectDebitMandate[] }>('/api/pes/direct-debit-mandate', {
    query: { customerId: pesCustomer.value.id },
  });
  mandates.value = result.items;
};

const loadRecurringChargeItems = async () => {
  if (!pesCustomer.value) return;
  const result = await $fetch<{ items: RecurringChargeItem[] }>('/api/pes/recurring-charge-item', {
    query: { customerId: pesCustomer.value.id },
  });
  recurringChargeItems.value = result.items;
};

const loadChargeItems = async () => {
  if (!pesCustomer.value) return;
  const result = await $fetch<{ items: ChargeItem[] }>('/api/pes/charge-item', {
    query: { customerId: pesCustomer.value.id },
  });
  chargeItems.value = result.items;
};

const loadCharges = async () => {
  if (!pesCustomer.value) return;
  const result = await $fetch<{ items: Charge[] }>('/api/pes/charge', {
    query: { customerId: pesCustomer.value.id },
  });
  charges.value = result.items;
};

if (hasPesReadRight && props.customerId) {
  try {
    const { enabled } = await $fetch<{ enabled: boolean }>('/api/pes/enabled');
    if (enabled) {
      const result = await $fetch<{ items: PesCustomer[] }>('/api/pes/customer', {
        query: { externalId: props.customerId },
      });
      pesCustomer.value = result.items.at(0) ?? null;
      if (pesCustomer.value) {
        await Promise.all([
          loadMandates(),
          loadRecurringChargeItems(),
          loadChargeItems(),
          loadCharges(),
          loadTaxRatesOption(),
          loadUnitsOption(),
        ]);
      }
    }
  } catch (e) {
    console.error('PES customer lookup failed:', e);
  }
}

const activeTab = ref<'mandates' | 'recurringChargeItems' | 'chargeItems' | 'charges'>('mandates');

// --- Mandate state ---
const mandateToRevoke = ref<DirectDebitMandate | null>(null);
const showCreateDialog = ref(false);
const newReferenceID = ref('');
const newPayer = ref('');
const newIban = ref('');
const newGrantedAt = ref(new Date().toISOString().split('T')[0]);
const newGrantedByIp = ref('');
const newAgreement = ref('');

// --- Recurring charge item state ---
const showCreateRciDialog = ref(false);
const rciToEdit = ref<RecurringChargeItem | null>(null);
const rciToEnd = ref<RecurringChargeItem | null>(null);
const newRciTitle = ref('');
const newRciDescription = ref('');
const newRciStartAt = ref(new Date().toISOString().split('T')[0]);
const newRciEndAt = ref('');
const newRciPeriodQuantity = ref('1');
const newRciPeriodUnit = ref('MONTH');
const newRciPrice = ref('');
const newRciQuantity = ref('1');
const newRciUnit = ref<string | undefined>(undefined);
const newRciTaxRate = ref<number | undefined>(undefined);
const editRciTitle = ref('');
const editRciDescription = ref('');
const editRciQuantity = ref('');
const editRciPrice = ref('');
const editRciUnit = ref<string | undefined>(undefined);
const editRciTaxRate = ref<number | undefined>(undefined);
const newRciEndAtDate = ref('');

// --- Charge item state ---
const showCreateCiDialog = ref(false);
const ciToEdit = ref<ChargeItem | null>(null);
const ciToDelete = ref<ChargeItem | null>(null);
const newCiTitle = ref('');
const newCiDescription = ref('');
const newCiServiceDate = ref(new Date().toISOString().split('T')[0]);
const newCiServiceDateTo = ref('');
const newCiQuantity = ref('1');
const newCiPrice = ref('');
const newCiUnit = ref<string | undefined>(undefined);
const newCiTaxRate = ref<number | undefined>(undefined);
const editCiTitle = ref('');
const editCiDescription = ref('');
const editCiServiceDate = ref('');
const editCiQuantity = ref('');
const editCiPrice = ref('');
const editCiUnit = ref<string | undefined>(undefined);
const editCiTaxRate = ref<number | undefined>(undefined);

// --- Charge state ---
const showCreateChargeDialog = ref(false);
const chargeToSetPaid = ref<Charge | null>(null);
const newChargeManuallyPaidAt = ref(new Date().toISOString().split('T')[0]);

const periodUnitItems = computed(() =>
  (['HOUR', 'DAY', 'WEEK', 'MONTH', 'YEAR'] as const).map(u => ({
    title: $t(`company.pes.recurringChargeItems.periodUnits.${u}`),
    value: u,
  }))
);

const defaultTaxRate = computed(() =>
  (taxRatesOptionItem.value?.value as { default?: number } | null | undefined)?.default
);
const defaultUnit = computed(() =>
  (unitsOptionItem.value?.value as { default?: string } | null | undefined)?.default ?? ''
);

// --- Validation ---
const showRciCreateErrors = ref(false);
const showRciEditErrors = ref(false);
const showCiCreateErrors = ref(false);
const showCiEditErrors = ref(false);

watch(showCreateRciDialog, (open) => { if (!open) showRciCreateErrors.value = false; });
watch(rciToEdit, (val) => { if (!val) showRciEditErrors.value = false; });
watch(showCreateCiDialog, (open) => { if (!open) showCiCreateErrors.value = false; });
watch(ciToEdit, (val) => { if (!val) showCiEditErrors.value = false; });

const rciCreateErrors = computed(() => ({
  title: !newRciTitle.value.trim(),
  periodQuantity: !Number.isFinite(parseInt(String(newRciPeriodQuantity.value))) || parseInt(String(newRciPeriodQuantity.value)) <= 0,
  price: !Number.isFinite(parseFloat(String(newRciPrice.value))),
  quantity: !Number.isFinite(parseFloat(String(newRciQuantity.value))) || parseFloat(String(newRciQuantity.value)) <= 0,
}));
const rciCreateIsValid = computed(() => !Object.values(rciCreateErrors.value).some(Boolean));

const rciEditErrors = computed(() => ({
  title: !editRciTitle.value.trim(),
  price: !Number.isFinite(parseFloat(String(editRciPrice.value))),
  quantity: !Number.isFinite(parseFloat(String(editRciQuantity.value))) || parseFloat(String(editRciQuantity.value)) <= 0,
}));
const rciEditIsValid = computed(() => !Object.values(rciEditErrors.value).some(Boolean));

const ciCreateErrors = computed(() => ({
  title: !newCiTitle.value.trim(),
  serviceDate: !newCiServiceDate.value,
  price: !Number.isFinite(parseFloat(String(newCiPrice.value))),
  quantity: !Number.isFinite(parseFloat(String(newCiQuantity.value))) || parseFloat(String(newCiQuantity.value)) <= 0,
}));
const ciCreateIsValid = computed(() => !Object.values(ciCreateErrors.value).some(Boolean));

const ciEditErrors = computed(() => ({
  title: !editCiTitle.value.trim(),
  serviceDate: !editCiServiceDate.value,
  price: !Number.isFinite(parseFloat(String(editCiPrice.value))),
  quantity: !Number.isFinite(parseFloat(String(editCiQuantity.value))) || parseFloat(String(editCiQuantity.value)) <= 0,
}));
const ciEditIsValid = computed(() => !Object.values(ciEditErrors.value).some(Boolean));

const rciCreatePreviewSubtotal = computed(() => {
  const qty = parseFloat(String(newRciQuantity.value)) || 0;
  const price = parseFloat(String(newRciPrice.value)) || 0;
  return qty * price;
});
const rciCreatePreviewTotal = computed(() =>
  rciCreatePreviewSubtotal.value * (1 + (newRciTaxRate.value ?? 0))
);
const rciEditPreviewSubtotal = computed(() => {
  const qty = parseFloat(String(editRciQuantity.value)) || 0;
  const price = parseFloat(String(editRciPrice.value)) || 0;
  return qty * price;
});
const rciEditPreviewTotal = computed(() =>
  rciEditPreviewSubtotal.value * (1 + (editRciTaxRate.value ?? 0))
);
const ciCreatePreviewSubtotal = computed(() => {
  const qty = parseFloat(String(newCiQuantity.value)) || 0;
  const price = parseFloat(String(newCiPrice.value)) || 0;
  return qty * price;
});
const ciCreatePreviewTotal = computed(() =>
  ciCreatePreviewSubtotal.value * (1 + (newCiTaxRate.value ?? 0))
);
const ciEditPreviewSubtotal = computed(() => {
  const qty = parseFloat(String(editCiQuantity.value)) || 0;
  const price = parseFloat(String(editCiPrice.value)) || 0;
  return qty * price;
});
const ciEditPreviewTotal = computed(() =>
  ciEditPreviewSubtotal.value * (1 + (editCiTaxRate.value ?? 0))
);

const formatIban = (iban: string) =>
  iban.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();

const formatDate = (isoStr: string) =>
  DateTime.fromISO(isoStr).toFormat($t('format.date'));

// --- Mandate handlers ---
const onRevoke = async () => {
  if (!mandateToRevoke.value) return;
  try {
    await $fetch(`/api/pes/direct-debit-mandate/${mandateToRevoke.value.id}/revoke`, {
      method: 'POST',
      body: {},
    });
    mandateToRevoke.value = null;
    await loadMandates();
    toast.add({ type: 'success', title: $t('company.pes.mandates.toast.revokeSuccess') });
  } catch {
    toast.add({ type: 'error', title: $t('company.pes.mandates.toast.revokeError') });
  }
};

const onCreate = async () => {
  if (!pesCustomer.value) return;
  try {
    await $fetch('/api/pes/direct-debit-mandate', {
      method: 'POST',
      body: {
        customerId: pesCustomer.value.id,
        type: 'BASIC',
        referenceID: newReferenceID.value || undefined,
        payer: newPayer.value,
        iban: newIban.value,
        grantedAt: newGrantedAt.value ? new Date(String(newGrantedAt.value)).toISOString() : undefined,
        grantedByIp: newGrantedByIp.value || undefined,
        agreement: newAgreement.value || undefined,
      },
    });
    showCreateDialog.value = false;
    newReferenceID.value = '';
    newPayer.value = '';
    newIban.value = '';
    newGrantedAt.value = new Date().toISOString().split('T')[0];
    newGrantedByIp.value = '';
    newAgreement.value = '';
    await loadMandates();
    toast.add({ type: 'success', title: $t('company.pes.mandates.toast.createSuccess') });
  } catch {
    toast.add({ type: 'error', title: $t('company.pes.mandates.toast.createError') });
  }
};

// --- Recurring charge item handlers ---
const openEditRci = (rci: RecurringChargeItem) => {
  editRciTitle.value = rci.title;
  editRciDescription.value = rci.description ?? '';
  editRciQuantity.value = String(rci.quantity);
  editRciPrice.value = String(rci.price);
  editRciUnit.value = rci.unit ?? undefined;
  editRciTaxRate.value = rci.taxRate;
  rciToEdit.value = rci;
};

const openEndRci = (rci: RecurringChargeItem) => {
  newRciEndAtDate.value = rci.endAt ? (rci.endAt.split('T')[0] ?? '') : '';
  rciToEnd.value = rci;
};

const onCreateRci = async () => {
  showRciCreateErrors.value = true;
  if (!rciCreateIsValid.value || !pesCustomer.value) return;
  try {
    await $fetch('/api/pes/recurring-charge-item', {
      method: 'POST',
      body: {
        customerId: pesCustomer.value.id,
        title: newRciTitle.value,
        description: newRciDescription.value || undefined,
        startAt: newRciStartAt.value ? new Date(String(newRciStartAt.value)).toISOString() : undefined,
        endAt: newRciEndAt.value ? new Date(String(newRciEndAt.value)).toISOString() : undefined,
        periodQuantity: parseInt(String(newRciPeriodQuantity.value), 10),
        periodUnit: newRciPeriodUnit.value,
        price: parseFloat(String(newRciPrice.value)),
        quantity: parseFloat(String(newRciQuantity.value)),
        unit: newRciUnit.value || undefined,
        taxRate: newRciTaxRate.value ?? 0,
      },
    });
    showCreateRciDialog.value = false;
    newRciTitle.value = '';
    newRciDescription.value = '';
    newRciStartAt.value = new Date().toISOString().split('T')[0];
    newRciEndAt.value = '';
    newRciPeriodQuantity.value = '1';
    newRciPeriodUnit.value = 'MONTH';
    newRciPrice.value = '';
    newRciQuantity.value = '1';
    newRciUnit.value = defaultUnit.value;
    newRciTaxRate.value = defaultTaxRate.value;
    await loadRecurringChargeItems();
    toast.add({ type: 'success', title: $t('company.pes.recurringChargeItems.toast.createSuccess') });
  } catch {
    toast.add({ type: 'error', title: $t('company.pes.recurringChargeItems.toast.createError') });
  }
};

const onEditRci = async () => {
  showRciEditErrors.value = true;
  if (!rciEditIsValid.value || !rciToEdit.value) return;
  try {
    await $fetch(`/api/pes/recurring-charge-item/${rciToEdit.value.id}`, {
      method: 'PATCH',
      body: {
        title: editRciTitle.value || undefined,
        description: editRciDescription.value || undefined,
        quantity: parseFloat(String(editRciQuantity.value)),
        price: parseFloat(String(editRciPrice.value)),
        unit: editRciUnit.value || undefined,
        taxRate: editRciTaxRate.value ?? 0,
      },
    });
    rciToEdit.value = null;
    await loadRecurringChargeItems();
    toast.add({ type: 'success', title: $t('company.pes.recurringChargeItems.toast.editSuccess') });
  } catch {
    toast.add({ type: 'error', title: $t('company.pes.recurringChargeItems.toast.editError') });
  }
};

const onEndRci = async () => {
  if (!rciToEnd.value) return;
  try {
    await $fetch(`/api/pes/recurring-charge-item/${rciToEnd.value.id}/end`, {
      method: 'POST',
      body: {
        endAt: newRciEndAtDate.value ? new Date(String(newRciEndAtDate.value)).toISOString() : null,
      },
    });
    rciToEnd.value = null;
    newRciEndAtDate.value = '';
    await loadRecurringChargeItems();
    toast.add({ type: 'success', title: $t('company.pes.recurringChargeItems.toast.endSuccess') });
  } catch {
    toast.add({ type: 'error', title: $t('company.pes.recurringChargeItems.toast.endError') });
  }
};

// --- Charge item handlers ---
const openEditCi = (ci: ChargeItem) => {
  editCiTitle.value = ci.title;
  editCiDescription.value = ci.description ?? '';
  editCiServiceDate.value = ci.serviceDate.split('T')[0] ?? '';
  editCiQuantity.value = String(ci.quantity);
  editCiPrice.value = String(ci.price);
  editCiUnit.value = ci.unit ?? undefined;
  editCiTaxRate.value = ci.taxRate;
  ciToEdit.value = ci;
};

const onCreateCi = async () => {
  showCiCreateErrors.value = true;
  if (!ciCreateIsValid.value || !pesCustomer.value) return;
  try {
    await $fetch('/api/pes/charge-item', {
      method: 'POST',
      body: {
        customerId: pesCustomer.value.id,
        title: newCiTitle.value,
        description: newCiDescription.value || undefined,
        serviceDate: newCiServiceDate.value ? new Date(String(newCiServiceDate.value)).toISOString() : undefined,
        serviceDateTo: newCiServiceDateTo.value ? new Date(String(newCiServiceDateTo.value)).toISOString() : undefined,
        quantity: parseFloat(String(newCiQuantity.value)),
        price: parseFloat(String(newCiPrice.value)),
        unit: newCiUnit.value || undefined,
        taxRate: newCiTaxRate.value ?? 0,
      },
    });
    showCreateCiDialog.value = false;
    newCiTitle.value = '';
    newCiDescription.value = '';
    newCiServiceDate.value = new Date().toISOString().split('T')[0];
    newCiServiceDateTo.value = '';
    newCiQuantity.value = '1';
    newCiPrice.value = '';
    newCiUnit.value = defaultUnit.value;
    newCiTaxRate.value = defaultTaxRate.value;
    await loadChargeItems();
    toast.add({ type: 'success', title: $t('company.pes.chargeItems.toast.createSuccess') });
  } catch {
    toast.add({ type: 'error', title: $t('company.pes.chargeItems.toast.createError') });
  }
};

const onEditCi = async () => {
  showCiEditErrors.value = true;
  if (!ciEditIsValid.value || !ciToEdit.value) return;
  try {
    await $fetch(`/api/pes/charge-item/${ciToEdit.value.id}`, {
      method: 'PATCH',
      body: {
        title: editCiTitle.value || undefined,
        description: editCiDescription.value || undefined,
        serviceDate: editCiServiceDate.value ? new Date(String(editCiServiceDate.value)).toISOString() : undefined,
        quantity: parseFloat(String(editCiQuantity.value)),
        price: parseFloat(String(editCiPrice.value)),
        unit: editCiUnit.value || undefined,
        taxRate: editCiTaxRate.value ?? 0,
      },
    });
    ciToEdit.value = null;
    await loadChargeItems();
    toast.add({ type: 'success', title: $t('company.pes.chargeItems.toast.editSuccess') });
  } catch {
    toast.add({ type: 'error', title: $t('company.pes.chargeItems.toast.editError') });
  }
};

const onDeleteCi = async () => {
  if (!ciToDelete.value) return;
  try {
    await $fetch(`/api/pes/charge-item/${ciToDelete.value.id}`, {
      method: 'DELETE',
    });
    ciToDelete.value = null;
    await loadChargeItems();
    toast.add({ type: 'success', title: $t('company.pes.chargeItems.toast.deleteSuccess') });
  } catch {
    toast.add({ type: 'error', title: $t('company.pes.chargeItems.toast.deleteError') });
  }
};

// --- Charge handlers ---
const openSetPaid = (charge: Charge) => {
  newChargeManuallyPaidAt.value = new Date().toISOString().split('T')[0];
  chargeToSetPaid.value = charge;
};

const onCreateCharge = async () => {
  if (!pesCustomer.value) return;
  try {
    await $fetch('/api/pes/charge', {
      method: 'POST',
      body: {
        customerId: pesCustomer.value.id,
        assignUnassignedItems: true,
      },
    });
    showCreateChargeDialog.value = false;
    await Promise.all([loadChargeItems(), loadCharges()]);
    toast.add({ type: 'success', title: $t('company.pes.charges.toast.createSuccess') });
  } catch {
    toast.add({ type: 'error', title: $t('company.pes.charges.toast.createError') });
  }
};

const onSetManuallyPaid = async () => {
  if (!chargeToSetPaid.value) return;
  try {
    await $fetch(`/api/pes/charge/${chargeToSetPaid.value.id}`, {
      method: 'PATCH',
      body: {
        manuallyPaidAt: newChargeManuallyPaidAt.value
          ? new Date(String(newChargeManuallyPaidAt.value)).toISOString()
          : new Date().toISOString(),
      },
    });
    chargeToSetPaid.value = null;
    await loadCharges();
    toast.add({ type: 'success', title: $t('company.pes.charges.toast.setPaidSuccess') });
  } catch {
    toast.add({ type: 'error', title: $t('company.pes.charges.toast.setPaidError') });
  }
};
</script>
