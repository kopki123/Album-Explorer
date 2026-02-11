import type { User } from '../types/api';
import { getGoogleAuthUrl, logoutAuth, refreshAuth } from '../service/api';

export const useAuth = () => {
  const user = useState<User | null>('auth-user', () => null);
  const accessToken = useState<string | null>('auth-access-token', () => null);

  const isAuthed = computed(() => Boolean(accessToken.value && user.value));

  function startGoogleLogin() {
    if (!process.client) return;

    window.location.href = getGoogleAuthUrl();
  }

  function setSession(token: string | null, userData: User | null) {
    accessToken.value = token;
    user.value = userData;
  }

  function clearSession() {
    setSession(null, null);
  }

  async function refreshSession() {
    try {
      const { accessToken: token, user: userData } = await refreshAuth();
      setSession(token, userData);
      return token;
    } catch {
      clearSession();
      return null;
    }
  }

  async function logout() {
    try {
      await logoutAuth();
    } finally {
      clearSession();
    }
  }

  return {
    user,
    accessToken,
    isAuthed,
    startGoogleLogin,
    setSession,
    clearSession,
    refreshSession,
    logout,
  };
};
