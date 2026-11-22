import { candidateStorageV1Schema } from './schemas';
import type { CandidateAnime, CandidateStorageV1 } from './types';

export const CANDIDATE_STORAGE_KEY =
  'season-anime-picker:candidates:v1' as const;

export const deduplicateCandidates = (
  candidates: readonly CandidateAnime[],
): CandidateAnime[] => {
  const seenIds = new Set<number>();

  return candidates.filter(({ id }) => {
    if (seenIds.has(id)) return false;
    seenIds.add(id);
    return true;
  });
};

export const addCandidate = (
  candidates: readonly CandidateAnime[],
  candidate: CandidateAnime,
): CandidateAnime[] =>
  candidates.some(({ id }) => id === candidate.id)
    ? [...candidates]
    : [...candidates, candidate];

export const removeCandidate = (
  candidates: readonly CandidateAnime[],
  id: number,
): CandidateAnime[] => candidates.filter((candidate) => candidate.id !== id);

export const serializeCandidates = (
  candidates: readonly CandidateAnime[],
): string => {
  const storage: CandidateStorageV1 = {
    version: 1,
    items: deduplicateCandidates(candidates),
  };

  return JSON.stringify(storage);
};

export const restoreCandidates = (
  storedValue: string | null,
): CandidateAnime[] => {
  if (storedValue === null) return [];

  try {
    const result = candidateStorageV1Schema.safeParse(JSON.parse(storedValue));

    return result.success ? deduplicateCandidates(result.data.items) : [];
  } catch {
    return [];
  }
};
