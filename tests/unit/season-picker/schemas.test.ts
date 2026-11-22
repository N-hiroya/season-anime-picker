import { describe, expect, it } from 'vitest';

import {
  anilistResponseSchema,
  candidateStorageV1Schema,
} from '../../../src/features/season-picker/schemas';

const validMedia = {
  id: 1,
  title: {
    native: '葬送のフリーレン',
    romaji: 'Sousou no Frieren',
    english: "Frieren: Beyond Journey's End",
  },
  coverImage: {
    extraLarge:
      'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/example.jpg',
  },
  episodes: 28,
  averageScore: 92,
  popularity: 500_000,
  genres: ['Adventure', 'Drama', 'Fantasy'],
  status: 'FINISHED',
  format: 'TV',
  isAdult: false,
};

const validCandidate = {
  id: 1,
  title: '葬送のフリーレン',
  coverImageUrl: null,
  episodes: 28,
  averageScore: 92,
  popularity: 500_000,
  genres: ['Adventure', 'Drama', 'Fantasy'],
  status: 'FINISHED',
  format: 'TV',
  year: 2023,
  season: 'FALL',
};

describe('anilistResponseSchema', () => {
  it('正常なAniListページレスポンスを受け入れる', () => {
    const response = {
      data: {
        Page: {
          pageInfo: {
            currentPage: 1,
            hasNextPage: false,
          },
          media: [validMedia],
        },
      },
    };

    expect(anilistResponseSchema.safeParse(response).success).toBe(true);
  });

  it('欠損するメディア項目を許容する', () => {
    const response = {
      data: {
        Page: {
          pageInfo: {
            currentPage: 1,
            hasNextPage: false,
          },
          media: [
            {
              ...validMedia,
              title: { native: null, romaji: null, english: null },
              coverImage: null,
              episodes: null,
              averageScore: null,
              popularity: null,
              status: null,
              format: null,
            },
          ],
        },
      },
    };

    expect(anilistResponseSchema.safeParse(response).success).toBe(true);
  });

  it.each([
    ['idが整数ではない', { ...validMedia, id: 1.5 }],
    ['averageScoreが範囲外', { ...validMedia, averageScore: 101 }],
    ['genresが文字列配列ではない', { ...validMedia, genres: [1] }],
    ['isAdultがbooleanではない', { ...validMedia, isAdult: 'false' }],
  ])('%sレスポンスを拒否する', (_case, media) => {
    const response = {
      data: {
        Page: {
          pageInfo: { currentPage: 1, hasNextPage: false },
          media: [media],
        },
      },
    };

    expect(anilistResponseSchema.safeParse(response).success).toBe(false);
  });
});

describe('candidateStorageV1Schema', () => {
  it('version 1の正常な候補ストレージを受け入れる', () => {
    expect(
      candidateStorageV1Schema.safeParse({
        version: 1,
        items: [validCandidate],
      }).success,
    ).toBe(true);
  });

  it.each([
    ['未知バージョン', { version: 2, items: [validCandidate] }],
    ['itemsの型違い', { version: 1, items: validCandidate }],
    ['候補IDの型違い', { version: 1, items: [{ ...validCandidate, id: '1' }] }],
    [
      '季節の列挙外',
      { version: 1, items: [{ ...validCandidate, season: 'AUTUMN' }] },
    ],
  ])('%sを拒否する', (_case, storedValue) => {
    expect(candidateStorageV1Schema.safeParse(storedValue).success).toBe(false);
  });
});
