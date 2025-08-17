<template>

  <PageSectionBox>
    <template #headerLeft>
      <InputSearch
        class="w-[260px]"
        @update:modelValue="onUpdateSearch"/>
    </template>
    <template #headerRight>
      <Button 
        type="button"
        icon="lucide:plus"
        :title="$t('user.add')"
        @click="emit('action', addActionKey ?? 'add')">
      </Button>
    </template>

    <div class="block relative w-full">
      <div class="block relative w-full">
        <table class="w-full">
          <thead>
            <tr
              class="border-b border-b-secondary-200 bg-secondary-50 text-sm text-secondary-700">
              <th
                class="text-left px-4 py-2"
                v-for="field in fields">
                {{ field.title }}
              </th>
              <th class="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody v-if="items.length > 0">
            <tr
              class="text-sm text-primary-950 border-b border-b-secondary-200 transition-color hover:bg-secondary-50"
              v-for="item in items">
              <td 
                class="text-left px-4 py-3 cursor-pointer"
                v-for="field in fields"
                @click.prevent="emit('action', itemClickActionKey ?? 'itemClick', item )">
                {{ (field.transform ? field.transform(item[field.fieldName], item) : item[field.fieldName]) ?? '-' }}
              </td>
              <td class="px-4 py-3">
                <div class="flex justify-end items-center">
                  <DropdownMenuRoot>
                    <DropdownMenuTrigger
                      class="transition-colors hover:bg-secondary-100 px-1 rounded">
                      <Icon icon="lucide:ellipsis" class="text-lg"/>
                    </DropdownMenuTrigger>
                    <DropdownMenuPortal>
                      <DropdownMenuContent
                        :align="'end'"
                        class="bg-white border border-secondary-200 rounded-lg shadow-lg py-1 shadow-secondary-100">
                        <DropdownMenuItem
                          class="flex justify-start items-center gap-2 px-3 py-1 cursor-pointer text-sm text-left rounded-lg transition-colors hover:bg-secondary-100"
                          v-for="action in (actions ?? [])"
                          @select="emit('action', action.key, item )">
                          <Icon v-if="action.icon" :icon="action.icon"/>
                          <span>{{ action.title }}</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenuPortal>
                  </DropdownMenuRoot>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <div 
          v-if="items.length <= 0"
          class="w-full flex items-center justify-center h-20">
          <p class="text-center text-secondary-700 text-sm">{{ $t('general.noItemsFound') }}</p>
        </div>
        <div
          class="px-4 py-2">
          <Pagination
            :isFirst="paginationIsFirst"
            :isLast="paginationIsLast"
            :state="paginationState ?? { take: 100, page: 1 }"
            @update:isFirst="emit('update:paginationIsFirst', $event)"
            @update:isLast="emit('update:paginationIsLast', $event)"
            @update:state="emit('update:paginationState', $event)">
          </Pagination>
        </div>
      </div>
    </div>

  </PageSectionBox>

</template>

<script setup lang="ts">

const props = defineProps<{
  items: { [key: string]: any }[],
  addActionKey?: string,
  itemClickActionKey?: string,
  fields: {
    title: string,
    fieldName: string,
    transform?: ((value: any, item?: any) => (string | null)),
  }[],
  actions: {
    title: string,
    icon?: string,
    key: string,
  }[],
  paginationIsFirst?: boolean,
  paginationIsLast?: boolean,
  paginationState?: { take: number, page: number },
}>();

const emit = defineEmits<{
  (event: 'action', key: string, item?: any ): void,
  (event: 'updateSearch', value: string | null): void,
  (event: 'update:paginationIsFirst', value: boolean): void,
  (event: 'update:paginationIsLast', value: boolean): void,
  (event: 'update:paginationState', value: { take: number, page: number }): void,
}>();

const onUpdateSearch = (value?: string) => 
  emit('updateSearch', (!value || value.length <= 2) ? null : value);

</script>
