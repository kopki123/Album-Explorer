import type { Album, PaginatedData, PaginatedResponse, PaginationMeta } from '~/types/api';
import { useApi } from '~/composables/useApi';

export interface AlbumsQuery {
  q?: string;
  sort?: string;
  page?: number;
  pageSize?: number;
}

export const fetchAlbums = async (query: AlbumsQuery): Promise<PaginatedResponse<Album>> => {
  const { apiFetchWithMeta } = useApi();
  const { data, meta } = await apiFetchWithMeta<
    PaginatedData<Album>,
    { pagination: PaginationMeta }
  >('/albums', {
    auth: false,
    query
  });

  return {
    items: data.items,
    pagination: meta?.pagination ?? {
      page: query.page ?? 1,
      pageSize: query.pageSize ?? 10,
      total: data.items.length
    }
  };
};

export const fetchAlbumBySlug = (slug: string) => {
  const { apiFetch } = useApi();
  return apiFetch<Album>(`/albums/${slug}`, { auth: false });
};

export const fetchRandomAlbum = () => {
  const { apiFetch } = useApi();
  return apiFetch<Album>('/albums/random', { auth: false });
};
