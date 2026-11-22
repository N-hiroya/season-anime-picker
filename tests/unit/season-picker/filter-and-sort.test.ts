import { describe, expect, it } from 'vitest';

import {
  compareByAverageScore,
  compareByEpisodes,
  compareByPopularity,
  extractGenres,
  filterAnime,
} from '../../../src/features/season-picker/filter-and-sort';
import type { AnimeSummary } from '../../../src/features/season-picker/types';

const anime = (
  overrides: Partial<AnimeSummary> & Pick<AnimeSummary, 'id' | 'title'>,
): AnimeSummary => {
  const { id, title, ...rest } = overrides;

  return {
    id,
    title,
    coverImageUrl: null,
    episodes: 12,
    averageScore: 80,
    popularity: 1_000,
    genres: ['アクション'],
    status: 'FINISHED',
    format: 'TV',
    ...rest,
  };
};

const items = [
  anime({ id: 1, title: 'アルファ', averageScore: 90, episodes: 24 }),
  anime({
    id: 2,
    title: 'ベータ',
    averageScore: 75,
    episodes: 12,
    genres: ['コメディ', 'ドラマ'],
  }),
  anime({
    id: 3,
    title: 'ガンマ',
    averageScore: null,
    episodes: null,
    format: 'TV_SHORT',
    genres: ['ドラマ'],
  }),
  anime({
    id: 4,
    title: 'デルタ',
    averageScore: 85,
    episodes: 10,
    format: 'MOVIE',
    genres: ['ドラマ'],
  }),
];

describe('filterAnime', () => {
  it('最低評価を単独で適用し、評価不明を除外する', () => {
    const result = filterAnime(items, {
      minAverageScore: 80,
      maxEpisodes: null,
      genre: null,
      tvOnly: false,
    });

    expect(result.map(({ id }) => id)).toEqual([1, 4]);
  });

  it('最大話数を単独で適用し、話数不明を除外する', () => {
    const result = filterAnime(items, {
      minAverageScore: null,
      maxEpisodes: 12,
      genre: null,
      tvOnly: false,
    });

    expect(result.map(({ id }) => id)).toEqual([2, 4]);
  });

  it('下限・上限が未指定なら評価・話数不明の作品を残す', () => {
    const result = filterAnime(items, {
      minAverageScore: null,
      maxEpisodes: null,
      genre: null,
      tvOnly: false,
    });

    expect(result.map(({ id }) => id)).toEqual([1, 2, 3, 4]);
  });

  it('ジャンルを単独で適用する', () => {
    const result = filterAnime(items, {
      minAverageScore: null,
      maxEpisodes: null,
      genre: 'ドラマ',
      tvOnly: false,
    });

    expect(result.map(({ id }) => id)).toEqual([2, 3, 4]);
  });

  it('TVのみを単独で適用し、TV_SHORTとその他形式を除外する', () => {
    const result = filterAnime(items, {
      minAverageScore: null,
      maxEpisodes: null,
      genre: null,
      tvOnly: true,
    });

    expect(result.map(({ id }) => id)).toEqual([1, 2]);
  });

  it('4条件をANDで適用する', () => {
    const result = filterAnime(items, {
      minAverageScore: 70,
      maxEpisodes: 12,
      genre: 'ドラマ',
      tvOnly: true,
    });

    expect(result.map(({ id }) => id)).toEqual([2]);
  });

  it('元の配列を変更しない', () => {
    const original = [...items];

    filterAnime(items, {
      minAverageScore: 80,
      maxEpisodes: null,
      genre: null,
      tvOnly: false,
    });

    expect(items).toEqual(original);
  });
});

describe('比較関数', () => {
  it('評価の降順、欠損値の末尾、同値時の日本語タイトル順を保証する', () => {
    const source = [
      anime({ id: 1, title: 'いぬ', averageScore: 80 }),
      anime({ id: 2, title: 'あさ', averageScore: null }),
      anime({ id: 3, title: 'あい', averageScore: 80 }),
      anime({ id: 4, title: 'かぜ', averageScore: 90 }),
      anime({ id: 5, title: 'いろ', averageScore: null }),
    ];

    expect(source.toSorted(compareByAverageScore).map(({ id }) => id)).toEqual([
      4, 3, 1, 2, 5,
    ]);
  });

  it('人気度の降順、欠損値の末尾、同値時の日本語タイトル順を保証する', () => {
    const source = [
      anime({ id: 1, title: 'いぬ', popularity: 5_000 }),
      anime({ id: 2, title: 'あさ', popularity: null }),
      anime({ id: 3, title: 'あい', popularity: 5_000 }),
      anime({ id: 4, title: 'かぜ', popularity: 10_000 }),
      anime({ id: 5, title: 'いろ', popularity: null }),
    ];

    expect(source.toSorted(compareByPopularity).map(({ id }) => id)).toEqual([
      4, 3, 1, 2, 5,
    ]);
  });

  it('話数の昇順、欠損値の末尾、同値時の日本語タイトル順を保証する', () => {
    const source = [
      anime({ id: 1, title: 'いぬ', episodes: 12 }),
      anime({ id: 2, title: 'あさ', episodes: null }),
      anime({ id: 3, title: 'あい', episodes: 12 }),
      anime({ id: 4, title: 'かぜ', episodes: 6 }),
      anime({ id: 5, title: 'いろ', episodes: null }),
    ];

    expect(source.toSorted(compareByEpisodes).map(({ id }) => id)).toEqual([
      4, 3, 1, 2, 5,
    ]);
  });

  it('比較時に元の配列を変更しない', () => {
    const source = [
      anime({ id: 1, title: 'いぬ', averageScore: 70 }),
      anime({ id: 2, title: 'あい', averageScore: 90 }),
    ];

    source.toSorted(compareByAverageScore);

    expect(source.map(({ id }) => id)).toEqual([1, 2]);
  });
});

describe('extractGenres', () => {
  it('ジャンル候補の重複を除き、日本語ロケールの安定した順序にする', () => {
    const source = [
      anime({ id: 1, title: 'A', genres: ['ドラマ', 'アクション'] }),
      anime({ id: 2, title: 'B', genres: ['コメディ', 'ドラマ'] }),
      anime({ id: 3, title: 'C', genres: [] }),
    ];

    expect(extractGenres(source)).toEqual(['アクション', 'コメディ', 'ドラマ']);
    expect(extractGenres(source.toReversed())).toEqual([
      'アクション',
      'コメディ',
      'ドラマ',
    ]);
  });
});
