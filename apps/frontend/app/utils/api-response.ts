import type { ApiResponse } from '~/types/api';

export const isApiResponse = (value: unknown): value is ApiResponse<unknown, unknown> => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as { success?: unknown; data?: unknown };

  return typeof candidate.success === 'boolean' && 'data' in candidate;
};

export const unwrapApiResponse = <T>(value: ApiResponse<T> | T): T => {
  return isApiResponse(value) ? value.data : value;
};

export const unwrapApiResponseWithMeta = <T, M>(
  value: ApiResponse<T, M> | T,
): { data: T; meta?: M } => {
  return isApiResponse(value) ? { data: value.data, meta: value.meta } : { data: value };
};
