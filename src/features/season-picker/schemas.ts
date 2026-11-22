import type {
  AnimeFormat,
  AnimeSeason,
  AnimeStatus,
  AnimeTitle,
  CandidateAnime,
  CandidateStorageV1,
} from './types';

type SafeParseResult<T> =
  { success: true; data: T } | { success: false; error: { message: string } };

const createSchema = <T>(guard: (value: unknown) => value is T) => ({
  safeParse(input: unknown): SafeParseResult<T> {
    return guard(input)
      ? { success: true, data: input }
      : { success: false, error: { message: 'Invalid input' } };
  },
});

const animeSeasons = new Set<AnimeSeason>([
  'WINTER',
  'SPRING',
  'SUMMER',
  'FALL',
]);
const animeStatuses = new Set<AnimeStatus>([
  'RELEASING',
  'FINISHED',
  'NOT_YET_RELEASED',
  'CANCELLED',
  'HIATUS',
]);
const animeFormats = new Set<AnimeFormat>([
  'TV',
  'TV_SHORT',
  'MOVIE',
  'SPECIAL',
  'OVA',
  'ONA',
  'MUSIC',
]);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isNullableString = (value: unknown): value is string | null =>
  value === null || typeof value === 'string';

const isNullableInteger = (value: unknown): value is number | null =>
  value === null || Number.isInteger(value);

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === 'string');

const isEnumValue = <T extends string>(
  value: unknown,
  values: ReadonlySet<T>,
): value is T => typeof value === 'string' && values.has(value as T);

const isNullableEnumValue = <T extends string>(
  value: unknown,
  values: ReadonlySet<T>,
): value is T | null => value === null || isEnumValue(value, values);

const isAnimeTitle = (value: unknown): value is AnimeTitle =>
  isRecord(value) &&
  isNullableString(value.native) &&
  isNullableString(value.romaji) &&
  isNullableString(value.english);

interface AniListMedia {
  id: number;
  title: AnimeTitle;
  coverImage: { extraLarge: string | null } | null;
  episodes: number | null;
  averageScore: number | null;
  popularity: number | null;
  genres: string[];
  status: AnimeStatus | null;
  format: AnimeFormat | null;
  isAdult: boolean;
}

export interface AniListResponse {
  data: {
    Page: {
      pageInfo: {
        currentPage: number;
        hasNextPage: boolean;
      };
      media: AniListMedia[];
    };
  };
}

const isCoverImage = (value: unknown): value is AniListMedia['coverImage'] =>
  value === null || (isRecord(value) && isNullableString(value.extraLarge));

const isAniListMedia = (value: unknown): value is AniListMedia =>
  isRecord(value) &&
  Number.isInteger(value.id) &&
  (value.id as number) > 0 &&
  isAnimeTitle(value.title) &&
  isCoverImage(value.coverImage) &&
  isNullableInteger(value.episodes) &&
  (value.episodes === null || value.episodes > 0) &&
  isNullableInteger(value.averageScore) &&
  (value.averageScore === null ||
    (value.averageScore >= 0 && value.averageScore <= 100)) &&
  isNullableInteger(value.popularity) &&
  (value.popularity === null || value.popularity >= 0) &&
  isStringArray(value.genres) &&
  isNullableEnumValue(value.status, animeStatuses) &&
  isNullableEnumValue(value.format, animeFormats) &&
  typeof value.isAdult === 'boolean';

const isAniListResponse = (value: unknown): value is AniListResponse => {
  if (!isRecord(value) || !isRecord(value.data)) return false;
  const page = value.data.Page;
  if (!isRecord(page) || !isRecord(page.pageInfo)) return false;

  return (
    Number.isInteger(page.pageInfo.currentPage) &&
    (page.pageInfo.currentPage as number) > 0 &&
    typeof page.pageInfo.hasNextPage === 'boolean' &&
    Array.isArray(page.media) &&
    page.media.every(isAniListMedia)
  );
};

const isCandidateAnime = (value: unknown): value is CandidateAnime =>
  isRecord(value) &&
  Number.isInteger(value.id) &&
  (value.id as number) > 0 &&
  typeof value.title === 'string' &&
  value.title.trim().length > 0 &&
  isNullableString(value.coverImageUrl) &&
  isNullableInteger(value.episodes) &&
  (value.episodes === null || value.episodes > 0) &&
  isNullableInteger(value.averageScore) &&
  (value.averageScore === null ||
    (value.averageScore >= 0 && value.averageScore <= 100)) &&
  isNullableInteger(value.popularity) &&
  (value.popularity === null || value.popularity >= 0) &&
  isStringArray(value.genres) &&
  isNullableEnumValue(value.status, animeStatuses) &&
  isNullableEnumValue(value.format, animeFormats) &&
  Number.isInteger(value.year) &&
  isEnumValue(value.season, animeSeasons);

const isCandidateStorageV1 = (value: unknown): value is CandidateStorageV1 =>
  isRecord(value) &&
  value.version === 1 &&
  Array.isArray(value.items) &&
  value.items.every(isCandidateAnime);

export const anilistResponseSchema = createSchema(isAniListResponse);
export const candidateStorageV1Schema = createSchema(isCandidateStorageV1);
