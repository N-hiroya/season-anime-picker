import type { AnimeFilter, AnimeSummary } from './types';

const titleCollator = new Intl.Collator('ja');

export const filterAnime = (
  anime: readonly AnimeSummary[],
  filter: AnimeFilter,
): AnimeSummary[] =>
  anime.filter((item) => {
    if (
      filter.minAverageScore !== null &&
      (item.averageScore === null || item.averageScore < filter.minAverageScore)
    ) {
      return false;
    }

    if (
      filter.maxEpisodes !== null &&
      (item.episodes === null || item.episodes > filter.maxEpisodes)
    ) {
      return false;
    }

    if (filter.genre !== null && !item.genres.includes(filter.genre)) {
      return false;
    }

    return !filter.tvOnly || item.format === 'TV';
  });

const compareNullableNumber = (
  left: AnimeSummary,
  right: AnimeSummary,
  key: 'averageScore' | 'popularity' | 'episodes',
  direction: 'ascending' | 'descending',
): number => {
  const leftValue = left[key];
  const rightValue = right[key];

  if (leftValue === null && rightValue !== null) return 1;
  if (leftValue !== null && rightValue === null) return -1;

  if (leftValue !== null && rightValue !== null && leftValue !== rightValue) {
    return direction === 'ascending'
      ? leftValue - rightValue
      : rightValue - leftValue;
  }

  return titleCollator.compare(left.title, right.title);
};

export const compareByAverageScore = (
  left: AnimeSummary,
  right: AnimeSummary,
): number => compareNullableNumber(left, right, 'averageScore', 'descending');

export const compareByPopularity = (
  left: AnimeSummary,
  right: AnimeSummary,
): number => compareNullableNumber(left, right, 'popularity', 'descending');

export const compareByEpisodes = (
  left: AnimeSummary,
  right: AnimeSummary,
): number => compareNullableNumber(left, right, 'episodes', 'ascending');

export const extractGenres = (anime: readonly AnimeSummary[]): string[] =>
  [...new Set(anime.flatMap(({ genres }) => genres))].sort((left, right) =>
    titleCollator.compare(left, right),
  );
