import { describe, expect, it } from 'vitest';

import {
  addCandidate,
  CANDIDATE_STORAGE_KEY,
  deduplicateCandidates,
  removeCandidate,
  restoreCandidates,
  serializeCandidates,
} from '../../../src/features/season-picker/candidate-storage';
import type { CandidateAnime } from '../../../src/features/season-picker/types';

const candidate = (
  overrides: Partial<CandidateAnime> & Pick<CandidateAnime, 'id' | 'title'>,
): CandidateAnime => {
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
    year: 2026,
    season: 'SPRING',
    ...rest,
  };
};

const first = candidate({ id: 1, title: '作品A' });
const second = candidate({ id: 2, title: '作品B' });

describe('候補の純粋関数', () => {
  it('AniList IDが同じ候補を重複追加しない', () => {
    const sameId = candidate({ id: 1, title: '別のスナップショット' });

    expect(addCandidate([first], sameId)).toEqual([first]);
    expect(deduplicateCandidates([first, sameId, second])).toEqual([
      first,
      second,
    ]);
  });

  it('未追加の候補を末尾に追加する', () => {
    expect(addCandidate([first], second)).toEqual([first, second]);
  });

  it('AniList IDを指定して1件削除する', () => {
    expect(removeCandidate([first, second], first.id)).toEqual([second]);
  });

  it('候補操作で元の配列を変更しない', () => {
    const source = [first];

    addCandidate(source, second);
    removeCandidate(source, first.id);
    deduplicateCandidates([...source, first]);

    expect(source).toEqual([first]);
  });
});

describe('候補の永続化形式', () => {
  it('固定のlocalStorageキーを公開する', () => {
    expect(CANDIDATE_STORAGE_KEY).toBe('season-anime-picker:candidates:v1');
  });

  it('version 1の保存形式へシリアライズし、同じ候補を復元する', () => {
    const serialized = serializeCandidates([first, second]);

    expect(JSON.parse(serialized)).toEqual({
      version: 1,
      items: [first, second],
    });
    expect(restoreCandidates(serialized)).toEqual([first, second]);
  });

  it.each([
    ['不正JSON', '{broken-json'],
    ['未知バージョン', JSON.stringify({ version: 2, items: [first] })],
    ['itemsが配列ではない', JSON.stringify({ version: 1, items: first })],
    [
      '不正な候補項目',
      JSON.stringify({
        version: 1,
        items: [{ ...first, id: '1' }],
      }),
    ],
    ['未保存', null],
  ])('%sは例外にせず空配列へ復旧する', (_case, storedValue) => {
    expect(restoreCandidates(storedValue)).toEqual([]);
  });

  it('復元時に同じAniList IDの項目を重複排除する', () => {
    const storedValue = JSON.stringify({
      version: 1,
      items: [first, { ...first, title: '後から現れた重複' }, second],
    });

    expect(restoreCandidates(storedValue)).toEqual([first, second]);
  });
});
