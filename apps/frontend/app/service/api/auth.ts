import type { ApiResponse, AuthResponse } from '../../types/api';
import { unwrapApiResponse } from '../../utils/api-response';

export const refreshAuth = async () => {
  const config = useRuntimeConfig();
  const response = await $fetch<ApiResponse<AuthResponse> | AuthResponse>('/auth/refresh', {
    baseURL: config.public.apiBase,
    method: 'POST',
    credentials: 'include'
  });
  return unwrapApiResponse(response);
};

export const logoutAuth = async () => {
  const config = useRuntimeConfig();
  const response = await $fetch<ApiResponse<{ ok: boolean }> | { ok: boolean }>('/auth/logout', {
    baseURL: config.public.apiBase,
    method: 'POST',
    credentials: 'include'
  });
  return unwrapApiResponse(response);
};

export const getGoogleAuthUrl = () => {
  const config = useRuntimeConfig();
  return `${config.public.apiBase}/auth/google`;
};
