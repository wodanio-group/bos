import { authMiddleware } from '../../utils/auth';
import { getPesCredentials } from '../../utils/pes';

export default defineEventHandler(async (event) => {
  await authMiddleware(event);
  return { enabled: getPesCredentials() !== null };
});
