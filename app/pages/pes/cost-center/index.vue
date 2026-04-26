<template>

  <PageSectionBox class="col-span-12">
    <template #headerRight>
      <atom-button
        v-if="hasPesInteractRight"
        type="button"
        icon="plus"
        :title="$t('pes.costCenters.add')"
        @click="openCreate(null)"/>
    </template>

    <div v-if="loading" class="w-full flex items-center justify-center h-20">
      <atom-icon icon="loader-circle" class="animate-spin text-secondary-400 !text-xl"/>
    </div>
    <div v-else-if="flatTree.length === 0" class="w-full flex items-center justify-center h-20">
      <p class="text-center text-secondary-700 text-sm">{{ $t('general.noItemsFound') }}</p>
    </div>

    <table v-else class="w-full text-sm">
      <thead>
        <tr class="border-b border-secondary-200">
          <th class="px-4 py-2 text-left text-xs font-semibold text-secondary-500">{{ $t('pes.costCenters.fields.name') }}</th>
          <th class="px-4 py-2 text-left text-xs font-semibold text-secondary-500">{{ $t('pes.costCenters.fields.alias') }}</th>
          <th class="px-4 py-2"></th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="node in flatTree"
          :key="node.id"
          class="border-b border-secondary-100 last:border-b-0 hover:bg-secondary-50">
          <td class="px-4 py-2">
            <div class="flex items-center gap-1.5" :style="{ paddingLeft: `${node.depth * 20}px` }">
              <atom-icon
                v-if="node.depth > 0"
                icon="corner-down-right"
                class="!text-sm text-secondary-300 shrink-0"/>
              <atom-icon icon="folder" class="!text-sm text-secondary-400 shrink-0"/>
              <span class="font-medium">{{ node.name }}</span>
            </div>
          </td>
          <td class="px-4 py-2">
            <span class="text-xs font-mono bg-secondary-100 text-secondary-600 px-2 py-0.5 rounded">{{ node.alias }}</span>
          </td>
          <td class="px-4 py-2">
            <div v-if="hasPesInteractRight" class="flex items-center justify-end gap-1">
              <atom-button
                type="button"
                icon="folder-plus"
                :title="$t('pes.costCenters.addChild')"
                :outline="true"
                @click="openCreate(node.id)"/>
              <atom-button
                type="button"
                icon="pencil"
                :title="$t('pes.costCenters.edit')"
                :outline="true"
                @click="openEdit(node)"/>
              <atom-button
                type="button"
                icon="trash"
                :title="$t('pes.costCenters.delete')"
                :outline="true"
                @click="nodeToDelete = node"/>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </PageSectionBox>

  <!-- Create / Edit dialog -->
  <Dialog
    :open="dialogOpen"
    @update:open="dialogOpen = $event ? dialogOpen : false">
    <template #headerLeft>
      <p class="text-lg">{{ editingNode ? $t('pes.costCenters.editDialog.title') : $t('pes.costCenters.createDialog.title') }}</p>
    </template>
    <div class="flex flex-col gap-4 py-2">
      <div v-if="editingNode" class="grid grid-cols-2 gap-3">
        <div class="flex flex-col gap-0.5">
          <span class="text-xs text-secondary-400 font-semibold uppercase tracking-wide">{{ $t('pes.costCenters.fields.id') }}</span>
          <div class="flex items-center gap-1">
            <span class="text-xs font-mono text-secondary-500 break-all">{{ editingNode.id }}</span>
            <button type="button" @click="copy(editingNode!.id)" class="shrink-0 text-secondary-300 hover:text-secondary-600 transition-colors">
              <atom-icon icon="copy" class="!text-xs"/>
            </button>
          </div>
        </div>
        <div class="flex flex-col gap-0.5">
          <span class="text-xs text-secondary-400 font-semibold uppercase tracking-wide">{{ $t('pes.costCenters.fields.alias') }}</span>
          <div class="flex items-center gap-1">
            <span class="text-xs font-mono text-secondary-500">{{ editingNode.alias }}</span>
            <button type="button" @click="copy(editingNode!.alias)" class="shrink-0 text-secondary-300 hover:text-secondary-600 transition-colors">
              <atom-icon icon="copy" class="!text-xs"/>
            </button>
          </div>
        </div>
      </div>
      <atom-input
        type="text"
        :title="$t('pes.costCenters.fields.name')"
        v-model="formName"/>
      <PesCostCenterSelect
        v-model="formParentId"
        :title="$t('pes.costCenters.fields.parent')"
        :null-label="$t('pes.costCenters.noParent')"
        :exclude-ids="excludeIdsForParentSelect"/>
    </div>
    <template #buttons>
      <atom-button
        type="button"
        :icon="editingNode ? 'save' : 'plus'"
        :title="editingNode ? $t('general.save') : $t('pes.costCenters.add')"
        :loading="saving"
        @click="onSave"/>
    </template>
  </Dialog>

  <!-- Delete confirmation -->
  <SimpleAlertDialog
    :open="nodeToDelete !== null"
    :title="$t('pes.costCenters.deleteDialog.title')"
    :description="$t('pes.costCenters.deleteDialog.description', { name: nodeToDelete?.name })"
    :submit-button-title="$t('pes.costCenters.delete')"
    submit-button-icon="trash"
    @cancel="nodeToDelete = null"
    @update:open="nodeToDelete = $event ? nodeToDelete : null"
    @submit="onDelete"/>

</template>

<script setup lang="ts">

type CostCenter = {
  id: string;
  name: string;
  alias: string;
  parentId: string | null;
};

type FlatNode = CostCenter & { depth: number };

const copy = async (text: string) => {
  await navigator.clipboard.writeText(text);
  toast.add({ type: 'success', title: $t('general.copied') });
};

const auth = useAuth();
const user = await auth.getUser();
const toast = useToast();

const hasPesInteractRight = computed(() => user?.rights.includes('pes.interact') === true);

const allItems = ref<CostCenter[]>([]);
const loading = ref(true);

const flatTree = computed<FlatNode[]>(() => {
  const byParent = new Map<string | null, CostCenter[]>();
  for (const item of allItems.value) {
    const key = item.parentId ?? null;
    if (!byParent.has(key)) byParent.set(key, []);
    byParent.get(key)!.push(item);
  }
  const result: FlatNode[] = [];
  function visit(parentId: string | null, depth: number) {
    for (const node of byParent.get(parentId) ?? []) {
      result.push({ ...node, depth });
      visit(node.id, depth + 1);
    }
  }
  visit(null, 0);
  return result;
});

const loadItems = async () => {
  loading.value = true;
  try {
    const result = await $fetch<{ items: CostCenter[] }>('/api/pes/cost-center', {
      query: { take: 999999, order: 'ASC' },
    });
    allItems.value = result.items;
  } catch {
    toast.add({ type: 'error', title: $t('general.loadError') });
  } finally {
    loading.value = false;
  }
};

// ── Create / Edit ────────────────────────────────────────────────────────────

const dialogOpen = ref(false);
const editingNode = ref<FlatNode | null>(null);
const formName = ref('');
const formParentId = ref<string | null>(null);
const saving = ref(false);

function getDescendantIds(id: string): Set<string> {
  const result = new Set<string>();
  function collect(parentId: string) {
    for (const node of flatTree.value) {
      if (node.parentId === parentId) {
        result.add(node.id);
        collect(node.id);
      }
    }
  }
  collect(id);
  return result;
}

const excludeIdsForParentSelect = computed<string[]>(() => {
  if (!editingNode.value) return [];
  return [editingNode.value.id, ...getDescendantIds(editingNode.value.id)];
});

const openCreate = (parentId: string | null) => {
  editingNode.value = null;
  formName.value = '';
  formParentId.value = parentId;
  dialogOpen.value = true;
};

const openEdit = (node: FlatNode) => {
  editingNode.value = node;
  formName.value = node.name;
  formParentId.value = node.parentId;
  dialogOpen.value = true;
};

const onSave = async () => {
  if (!formName.value.trim() || saving.value) return;
  saving.value = true;
  try {
    if (editingNode.value) {
      await $fetch(`/api/pes/cost-center/${editingNode.value.id}`, {
        method: 'PATCH',
        body: { name: formName.value.trim(), parentId: formParentId.value },
      });
      toast.add({ type: 'success', title: $t('pes.costCenters.toast.updateSuccess') });
    } else {
      await $fetch('/api/pes/cost-center', {
        method: 'POST',
        body: { name: formName.value.trim(), parentId: formParentId.value },
      });
      toast.add({ type: 'success', title: $t('pes.costCenters.toast.createSuccess') });
    }
    dialogOpen.value = false;
    await loadItems();
  } catch {
    toast.add({
      type: 'error',
      title: editingNode.value
        ? $t('pes.costCenters.toast.updateError')
        : $t('pes.costCenters.toast.createError'),
    });
  } finally {
    saving.value = false;
  }
};

// ── Delete ───────────────────────────────────────────────────────────────────

const nodeToDelete = ref<FlatNode | null>(null);

const onDelete = async () => {
  if (!nodeToDelete.value) return;
  const target = nodeToDelete.value;
  nodeToDelete.value = null;
  try {
    await $fetch(`/api/pes/cost-center/${target.id}`, { method: 'DELETE' });
    toast.add({ type: 'success', title: $t('pes.costCenters.toast.deleteSuccess') });
    await loadItems();
  } catch (e: any) {
    const status = e?.response?.status ?? e?.statusCode;
    toast.add({
      type: 'error',
      title: status === 409
        ? $t('pes.costCenters.toast.deleteHasChildren')
        : $t('pes.costCenters.toast.deleteError'),
    });
  }
};

onMounted(() => { loadItems(); });
</script>
