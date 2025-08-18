import { computed, useState, useRoute } from "#imports";
import { z } from "zod";
import type { BaseViewModel } from "~~/shared/types/base";

export const useCrud = <T extends BaseViewModel>(opts: {
  apiPath: string
}) => {

  const route = useRoute();

  const itemState = useState<T | null>(`crudItem${opts.apiPath}`, () => null);
  const item = computed(() => itemState.value);

  const loadItem = async (id?: string) => {
    try {
      const params = z.object({
        id: z.preprocess(
          (v) => {
            if (v === '+' || v === undefined) return undefined;
            if (v === null) return null;
            return String(v).trim().toLowerCase();
          },
          z.union([ z.string().uuid(), z.null() ]).optional()
        )
      }).parse(route?.params ?? {});   
      const pId = id ?? params.id ?? null;
      if (!pId)
        throw new Error('No id');
      itemState.value = (await $fetch(`${opts.apiPath}/${pId}`, {
        method: 'GET'
      }));
    } catch (e) {
      itemState.value = null;
    }
  };

  const itemsState = useState<T[]>(`crudItems${opts.apiPath}`, () => []);
  const filterAndSearchState = useState<{
    take: number,
    page: number,
    search: string | null,
  }>(`crudFilerAndSearchState${opts.apiPath}`, () => ({
    take: 100,
    page: 1,
    search: null
  }));

  const items = computed(() => itemsState.value);

  const pagination = computed<{ take: number, page: number }>(() => ({
    take: filterAndSearchState.value.take,
    page: filterAndSearchState.value.page,
  }));
  const paginationIsFirst = computed(() => pagination.value.page <= 1);
  const paginationIsLast = computed(() => items.value.length < pagination.value.take);
  const paginationNext = () => {
    filterAndSearchState.value = {
      ...filterAndSearchState.value,
      page: (filterAndSearchState.value.page + 1)
    };
    loadItems();
  };
  const paginationPrev = () => {
    filterAndSearchState.value = {
      ...filterAndSearchState.value,
      page: (filterAndSearchState.value.page <= 0) ? 0 : (filterAndSearchState.value.page - 1)
    };
    loadItems();
  };
  const paginationSetTake = (take: number) => {
    filterAndSearchState.value = {
      ...filterAndSearchState.value,
      take: (take >= 1) ? take : 1,
    };
    loadItems();
  };
  const paginationSetPage = (page: number) => {
    filterAndSearchState.value = {
      ...filterAndSearchState.value,
      page: (page >= 1) ? page : 1,
    };
    loadItems();
  };
  const paginationSet = (v: { take: number, page: number }) => {
    filterAndSearchState.value = {
      ...filterAndSearchState.value,
      take: (v.take >= 1) ? v.take : 1,
      page: (v.page >= 1) ? v.page : 1,
    };
    loadItems();
  };

  const search = computed<{ search: string | null }>(() => ({
    search: filterAndSearchState.value.search
  }));
  const searchSet = (search: string | null) => {
    filterAndSearchState.value = {
      ...filterAndSearchState.value, search
    };
    loadItems();
  };

  const loadItems = async () => {
    try {
      itemsState.value = (await $fetch<T[]>(opts.apiPath, {
        method: 'GET',
        query: {
          ...filterAndSearchState.value,
        },
      }));
    } catch (e) { }
  };

  const upsert = async (item: T): Promise<T | null> => {
    try {
      return ((item.id)
        ? (await updateById(item.id, item))
        : (await create(item)));
    } catch (e) {
      return null;
    }
  }

  const create = async (item: T): Promise<T | null> => {
    try {
      return (await $fetch<any>(`${opts.apiPath}`, {
        method: 'POST',
        body: item
      }));
    } catch (e) {
      return null;
    }
  }

  const updateById = async (id: string, item: T): Promise<T | null> => {
    try {
      return (await $fetch<any>(`${opts.apiPath}/${id}`, {
        method: 'PATCH',
        body: item
      }));
    } catch (e) {
      return null;
    }
  }

  const deleteById = async (id: string): Promise<boolean> => {
    try {
      await $fetch(`${opts.apiPath}/${id}`, {
        method: 'DELETE'
      });
      return true;
    } catch (e) {
      return false;
    }
  }

  return {
    item,
    loadItem,
    items,
    pagination,
    paginationIsFirst,
    paginationIsLast,
    paginationNext,
    paginationPrev,
    paginationSetTake,
    paginationSetPage,
    paginationSet,
    search,
    searchSet,
    loadItems,
    upsert,
    create,
    updateById,
    deleteById,
  };
};
