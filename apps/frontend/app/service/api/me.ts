import type {
  FavoriteById,
  FavoriteItem,
  PaginatedData,
  PaginatedResponse,
  PaginationMeta,
  RatingById,
  RatingItem,
  User
} from '../../types/api';
import { useApi } from '../../composables/useApi';

export interface MeListQuery {
  page: number;
  pageSize: number;
  sort?: string;
}

export interface RatingPayload {
  score: number;
  review: string | null;
}

export const fetchMe = () => {
  const { apiFetch } = useApi();
  return apiFetch<User>('/me', { auth: true });
};

export const fetchFavorites = async (
  query: MeListQuery,
): Promise<PaginatedResponse<FavoriteItem>> => {
  const { apiFetchWithMeta } = useApi();
  const { data, meta } = await apiFetchWithMeta<
    PaginatedData<FavoriteItem>,
    { pagination: PaginationMeta }
  >('/me/favorites', {
    auth: true,
    query
  });

  return {
    items: data.items,
    pagination: meta?.pagination ?? {
      page: query.page,
      pageSize: query.pageSize,
      total: data.items.length
    }
  };
};

export const fetchFavoriteById = (albumId: number): Promise<FavoriteById> => {
  const { apiFetch } = useApi();
  return apiFetch<FavoriteById>(`/me/favorites/${albumId}`, { auth: true });
};

export const fetchRatings = async (
  query: MeListQuery,
): Promise<PaginatedResponse<RatingItem>> => {
  const { apiFetchWithMeta } = useApi();
  const { data, meta } = await apiFetchWithMeta<
    PaginatedData<RatingItem>,
    { pagination: PaginationMeta }
  >('/me/ratings', {
    auth: true,
    query
  });

  return {
    items: data.items,
    pagination: meta?.pagination ?? {
      page: query.page,
      pageSize: query.pageSize,
      total: data.items.length
    }
  };
};

export const fetchRatingById = (albumId: number): Promise<RatingById> => {
  const { apiFetch } = useApi();
  return apiFetch<RatingById>(`/me/ratings/${albumId}`, { auth: true });
};

export const addFavorite = (albumId: number) => {
  const { apiFetch } = useApi();
  return apiFetch('/me/favorites', {
    method: 'POST',
    auth: true,
    body: { albumId }
  });
};

export const removeFavorite = (albumId: number) => {
  const { apiFetch } = useApi();
  return apiFetch(`/me/favorites/${albumId}`, {
    method: 'DELETE',
    auth: true
  });
};

export const saveRating = (albumId: number, payload: RatingPayload) => {
  const { apiFetch } = useApi();
  return apiFetch(`/me/ratings/${albumId}`, {
    method: 'PUT',
    auth: true,
    body: payload
  });
};
