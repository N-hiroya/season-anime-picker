import type { AnimeStatus, AnimeTitle } from './types';

const FALLBACK_TITLE = 'タイトル未登録';

export const selectAnimeTitle = (title: AnimeTitle): string => {
  for (const candidate of [title.native, title.romaji, title.english]) {
    if (candidate?.trim()) {
      return candidate.trim();
    }
  }

  return FALLBACK_TITLE;
};

const statusLabels: Record<AnimeStatus, string> = {
  RELEASING: '放送中',
  FINISHED: '放送終了',
  NOT_YET_RELEASED: '放送前',
  CANCELLED: '放送中止',
  HIATUS: '休止中',
};

export const getStatusLabel = (status: string | null | undefined): string =>
  status && status in statusLabels
    ? statusLabels[status as AnimeStatus]
    : '不明';

export const formatEpisodes = (episodes: number | null): string =>
  episodes === null ? '話数未定' : `${episodes}話`;

export const formatAverageScore = (averageScore: number | null): string =>
  averageScore === null ? '未評価' : `${averageScore}点`;

const integerFormatter = new Intl.NumberFormat('ja-JP', {
  maximumFractionDigits: 0,
});

export const formatPopularity = (popularity: number): string =>
  integerFormatter.format(popularity);
