import { describe, expect, it } from 'vitest';

import {
  formatAverageScore,
  formatEpisodes,
  formatPopularity,
  getStatusLabel,
  selectAnimeTitle,
} from '../../../src/features/season-picker/anime-display';

describe('selectAnimeTitle', () => {
  it('3種類すべてのタイトルがある場合はnativeを選ぶ', () => {
    expect(
      selectAnimeTitle({
        native: '葬送のフリーレン',
        romaji: 'Sousou no Frieren',
        english: "Frieren: Beyond Journey's End",
      }),
    ).toBe('葬送のフリーレン');
  });

  it.each([
    {
      title: { native: null, romaji: 'Sousou no Frieren', english: 'Frieren' },
      expected: 'Sousou no Frieren',
    },
    {
      title: { native: null, romaji: null, english: 'Frieren' },
      expected: 'Frieren',
    },
    {
      title: { native: null, romaji: null, english: null },
      expected: 'タイトル未登録',
    },
    {
      title: { native: '   ', romaji: '', english: null },
      expected: 'タイトル未登録',
    },
  ])('タイトルを段階的にフォールバックする', ({ title, expected }) => {
    expect(selectAnimeTitle(title)).toBe(expected);
  });
});

describe('getStatusLabel', () => {
  it.each([
    ['RELEASING', '放送中'],
    ['FINISHED', '放送終了'],
    ['NOT_YET_RELEASED', '放送前'],
    ['CANCELLED', '放送中止'],
    ['HIATUS', '休止中'],
    [null, '不明'],
    ['UNKNOWN', '不明'],
  ] as const)('%sを%sと表示する', (status, label) => {
    expect(getStatusLabel(status)).toBe(label);
  });
});

describe('表示フォーマッター', () => {
  it('話数を表示用文字列に変換する', () => {
    expect(formatEpisodes(12)).toBe('12話');
    expect(formatEpisodes(null)).toBe('話数未定');
  });

  it('評価を表示用文字列に変換する', () => {
    expect(formatAverageScore(85)).toBe('85点');
    expect(formatAverageScore(null)).toBe('未評価');
  });

  it('人気度を3桁区切りで表示する', () => {
    expect(formatPopularity(123_456)).toBe('123,456');
  });
});
