import { useState, computed } from "#imports";
import type { Toast } from "~~/shared/types/base";

export const useToast = () => {
  const state = useState<(Toast & { id: string, createdAt: number })[]>('toastState', () => []);
  const toasts = computed(() => state.value.sort((a, b) => a.createdAt - b.createdAt));
  const add = (toast: Toast) => {
    const id = Math.random().toString(36).substring(2, 10);
    state.value.push({ ...toast, id, createdAt: (new Date()).getTime() });
    setTimeout(
      () => state.value = state.value.filter(o => o.id !== id),
      ((toast.ttl ?? 10) * 1000)
    );
  };
  const getIconForToast = (toast: Toast): string => { 
    if (toast.icon)
      return toast.icon;
    return (toast.type === 'success')
      ? 'lucide:circle-check'
      : (toast.type === 'error')
        ? 'lucide:circle-x'
        : (toast.type === 'warning')
          ? 'lucide:triangle-alert'
          : 'lucide:info';
  };
  return { toasts, getIconForToast, add };
};
