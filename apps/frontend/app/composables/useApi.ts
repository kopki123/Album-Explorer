import type { FetchOptions } from 'ofetch';
import { FetchError } from 'ofetch';
import type { ApiResponse } from '../types/api';
import { unwrapApiResponse, unwrapApiResponseWithMeta } from '../utils/api-response';

interface ApiFetchOptions<T> extends Omit<FetchOptions<any>, 'baseURL'> {
  /**
   * Attach Authorization header and enable automatic refresh retry.
   */
  auth?: boolean;
  /**
   * Whether to retry once after a refresh when a 401 is received.
   */
  retryOn401?: boolean;
}

export const useApi = () => {
  const config = useRuntimeConfig();
  const { accessToken, refreshSession, clearSession } = useAuth();

  const apiFetchBase = async <T>(
    path: string,
    options: ApiFetchOptions<T> = {},
  ): Promise<ApiResponse<T> | T> => {
    const { auth = false, retryOn401 = true, credentials = true, ...rest } = options;
    const headers = new Headers((rest.headers || {}) as HeadersInit);

    if (auth && accessToken.value) {
      headers.set('Authorization', `Bearer ${accessToken.value}`);
    }

    const request = () =>
      $fetch(path, {
        ...(rest as any),
        baseURL: config.public.apiBase,
        headers: Object.fromEntries(headers.entries()),
        credentials: rest.credentials ?? (auth ? 'include' : 'same-origin')
      }) as Promise<ApiResponse<T> | T>;

    try {
      return await request();
    } catch (error) {
      const fetchError = error as FetchError;
      const status = fetchError?.response?.status;

      if (auth && retryOn401 && status === 401) {
        const refreshedToken = await refreshSession();

        if (refreshedToken) {
          headers.set('Authorization', `Bearer ${refreshedToken}`);
          return await request();
        }

        clearSession();
      }

      throw error;
    }
  };

  const apiFetch = async <T>(path: string, options: ApiFetchOptions<T> = {}): Promise<T> => {
    return unwrapApiResponse(await apiFetchBase<T>(path, options));
  };

  const apiFetchWithMeta = async <T, M>(
    path: string,
    options: ApiFetchOptions<T> = {},
  ): Promise<{ data: T; meta?: M }> => {
    return unwrapApiResponseWithMeta<T, M>(
      (await apiFetchBase<T>(path, options)) as ApiResponse<T, M> | T,
    );
  };

  return { apiFetch, apiFetchWithMeta };
};
