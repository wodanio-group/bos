import { authMiddleware, userToViewModel } from "#imports";

export default defineEventHandler(async (event) => {
  return userToViewModel(await authMiddleware(event));
});
