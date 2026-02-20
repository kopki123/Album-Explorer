export interface Album {
  id: number;
  slug: string;
  title: string;
  artistName: string;
  releaseDate: string;
  description: string | null;
  durationMs: number | null;
  coverUrl: string | null;
  wikiUrl: string | null;
  spotifyId: string | null;
  genres: Genre[];
  tracks: Track[];
}

export type AlbumPublic = Omit<Album, 'genres' | 'tracks'>;

export interface AlbumSummary {
  id: number;
  slug: string;
  title: string;
  artistName: string;
  coverUrl: string | null;
}

export interface Genre {
  id: number;
  name: string;
  slug: string;
}

export interface Track {
  id: number;
  trackNo: number;
  title: string;
  durationMs?: number | null;
}

export interface User {
  id: string;
  email?: string | null;
  name?: string | null;
  avatarUrl?: string | null;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
}

export interface PaginatedData<T> {
  items: T[];
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationMeta;
}

export interface FavoriteItem {
  album: AlbumPublic;
  createdAt: string;
}

export interface FavoriteById {
  albumId: number;
  isFavorited: boolean;
  favoritedAt: string | null;
  album: AlbumSummary | null;
}

export interface RatingItem {
  album: AlbumPublic;
  score: number;
  review?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RatingById {
  albumId: number;
  isRated: boolean;
  rating: {
    score: number;
    review: string | null;
    createdAt: string;
    updatedAt: string;
  } | null;
  album: AlbumSummary | null;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface ApiResponse<T = unknown, M = unknown> {
  success: boolean;
  code: number;
  message: string;
  data: T;
  meta?: M;
}
