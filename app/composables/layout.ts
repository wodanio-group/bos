import { useRuntimeConfig, useState, computed } from "#imports";

export const useGlobalLayout = () => {
  const config = useRuntimeConfig();
  return {
    siteUrl: config.public.siteUrl,
    siteTitle: config.public.siteTitle,
    logoUrl: config.public.logoUrl,
  };
};

export const useLayoutMenu = () => {
  const state = useState<{ open: boolean }>('layoutMenuState', () => ({
    open: false
  }));
  const open = computed(() => state.value.open === true);
  const toggle = () => state.value = {
    ...state.value,
    open: !state.value.open
  };
  const setOpen = (value: boolean) => state.value = {
    ...state.value,
    open: value
  };
  return { open, toggle, setOpen };
};
