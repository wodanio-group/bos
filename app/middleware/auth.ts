import { useAuth } from "#imports";

export default defineNuxtRouteMiddleware(async (to, from) => {
  const { getUser, login } = useAuth();
  const user = await getUser();
  if (!user && to.path !== '/auth/login')
    return login(to.path);
});
