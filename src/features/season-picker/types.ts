export type AnimeSeason = 'WINTER' | 'SPRING' | 'SUMMER' | 'FALL';

export type AnimeStatus =
  'RELEASING' | 'FINISHED' | 'NOT_YET_RELEASED' | 'CANCELLED' | 'HIATUS';

export type AnimeFormat =
  'TV' | 'TV_SHORT' | 'MOVIE' | 'SPECIAL' | 'OVA' | 'ONA' | 'MUSIC';

export interface AnimeTitle {
  native: string | null;
  romaji: string | null;
  english: string | null;
}

export interface AnimeSummary {
  id: number;
  title: string;
  coverImageUrl: string | null;
  episodes: number | null;
  averageScore: number | null;
  popularity: number | null;
  genres: string[];
  status: AnimeStatus | null;
  format: AnimeFormat | null;
}

export interface AnimeSearchResponse {
  items: AnimeSummary[];
  fetchedAt: string;
}

export type ApiErrorCode =
  'INVALID_REQUEST' | 'RATE_LIMITED' | 'UPSTREAM_ERROR' | 'TIMEOUT';

export interface ApiErrorResponse {
  code: ApiErrorCode;
  message: string;
  retryAfterSeconds?: number;
}

export interface CandidateAnime extends AnimeSummary {
  year: number;
  season: AnimeSeason;
}

export interface CandidateStorageV1 {
  version: 1;
  items: CandidateAnime[];
}

export interface AnimeFilter {
  minAverageScore: number | null;
  maxEpisodes: number | null;
  genre: string | null;
  tvOnly: boolean;
}
