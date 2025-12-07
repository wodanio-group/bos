import { userToViewModel } from "#imports";
import { authMiddleware } from "~~/server/utils/auth";

export default defineEventHandler(async (event) => {
  return userToViewModel(await authMiddleware(event));
});
