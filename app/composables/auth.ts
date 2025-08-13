import type { UserViewModel } from "~~/shared/types/user";
import { useState, navigateTo } from "#imports";

export const useAuth = () => {

  const user = useState<UserViewModel | null>('authUser', () => null);

  const getUser = async (): Promise<UserViewModel | null> => {
    if (user.value)
      return user.value;
    try {
      const requestedUser = await $fetch<UserViewModel>('/api/user/me');
      user.value = requestedUser;
      return requestedUser;
    } catch (e) {
      return null;
    }
  };

  const login = (path: string = '/') => {
    if (!import.meta.client)
      return;
    return navigateTo(`/auth/login?r=${path}`, { external: true });
  };

  const logout = (path: string = '/') => {
    if (!import.meta.client)
      return;
    return navigateTo(`/auth/logout?r=${path}`, { external: true });
  };

  return {
    getUser,
    login,
    logout,
  };
};
