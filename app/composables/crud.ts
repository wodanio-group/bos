import { computed, useState, useRoute } from "#imports";
import { z } from "zod";
import type { BaseViewModel } from "~~/shared/types/base";

export const useCrud = <T extends BaseViewModel>(opts: {
  apiPath: string,
  query?: any,
  key?: string,
}) => {

  const route = useRoute();

  const itemState = useState<T | null>(`crudItem${opts.key ?? ''}${opts.apiPath}`, () => null);
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
      itemState.value = (await $fetch<any>(`${opts.apiPath}/${pId}`, {
        method: 'GET'
      }));
    } catch (e) {
      itemState.value = null;
    }
  };

  const itemsState = useState<T[]>(`crudItems${opts.key ?? ''}${opts.apiPath}`, () => []);
  const filterAndSearchState = useState<{
    take: number,
    page: number,
    search: string | null,
    sortBy: string | null,
    sortOrder: 'asc' | 'desc' | null,
  }>(`crudFilerAndSearchState${opts.key ?? ''}${opts.apiPath}`, () => ({
    take: 100,
    page: 1,
    search: null,
    sortBy: null,
    sortOrder: null,
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

  const sort = computed<{ sortBy: string | null, sortOrder: 'asc' | 'desc' | null }>(() => ({
    sortBy: filterAndSearchState.value.sortBy,
    sortOrder: filterAndSearchState.value.sortOrder
  }));
  const sortSet = (sortBy: string | null, sortOrder: 'asc' | 'desc' | null = 'asc') => {
    filterAndSearchState.value = {
      ...filterAndSearchState.value,
      sortBy,
      sortOrder
    };
    loadItems();
  };
  const sortToggle = (sortBy: string) => {
    const currentSortBy = filterAndSearchState.value.sortBy;
    const currentSortOrder = filterAndSearchState.value.sortOrder;

    if (currentSortBy === sortBy) {
      // Toggle between asc, desc, and null
      if (currentSortOrder === 'asc') {
        filterAndSearchState.value = {
          ...filterAndSearchState.value,
          sortOrder: 'desc'
        };
      } else if (currentSortOrder === 'desc') {
        filterAndSearchState.value = {
          ...filterAndSearchState.value,
          sortBy: null,
          sortOrder: null
        };
      } else {
        filterAndSearchState.value = {
          ...filterAndSearchState.value,
          sortBy,
          sortOrder: 'asc'
        };
      }
    } else {
      // Set new sort field with asc order
      filterAndSearchState.value = {
        ...filterAndSearchState.value,
        sortBy,
        sortOrder: 'asc'
      };
    }
    loadItems();
  };

  /* const filter = computed<Record<string, string | number | null>>(() => ({}));
  const filterSet = (filter: Record<string, string | number | null>) => {
    filterAndSearchState.value = {
      ...filterAndSearchState.value, filter
    };
    loadItems();
  }; */

  const loadItems = async () => {
    try {
      const queryParams: any = {
        ...(opts.query ?? {}),
        ...filterAndSearchState.value,
      };

      // Remove null sort values from query
      if (queryParams.sortBy === null) {
        delete queryParams.sortBy;
      }
      if (queryParams.sortOrder === null) {
        delete queryParams.sortOrder;
      }

      itemsState.value = (await $fetch<T[]>(opts.apiPath, {
        method: 'GET',
        query: queryParams,
      }));
    } catch (e) { }
  };

  const upsert = async (item: T): Promise<T> => {
    return ((item.id)
      ? (await updateById(item.id, item))
      : (await create(item)));
  }

  const create = async (item: T): Promise<T> => {
    return (await $fetch<any>(`${opts.apiPath}`, {
      method: 'POST',
      body: item
    }));
  }

  const updateById = async (id: string, item: T): Promise<T> => {
    return (await $fetch<any>(`${opts.apiPath}/${id}`, {
      method: 'PATCH',
      body: item
    }));
  }

  const deleteById = async (id: string): Promise<void> => {
    await $fetch(`${opts.apiPath}/${id}`, {
      method: 'DELETE'
    });
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
    sort,
    sortSet,
    sortToggle,
    loadItems,
    upsert,
    create,
    updateById,
    deleteById,
  };
};
