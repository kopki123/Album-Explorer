import type { GoogleProfileUser } from '../modules/auth/google.strategy';

declare global {
  namespace Express {
    interface User extends GoogleProfileUser {}
  }
}