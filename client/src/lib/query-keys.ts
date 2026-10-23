/**
 * query-keys.ts - Centralized TanStack Query Key Factory Pattern.
 * Nguồn chân lý duy nhất quản lý toàn bộ cache keys cho TanStack Query v5 trong mooc-clone.
 */

export const queryKeys = {
  rooms: {
    all: ['rooms'] as const,
    list: (params?: Record<string, unknown>) => ['rooms', 'list', params] as const,
    detail: (id: string) => ['rooms', 'detail', id] as const,
    participants: (id: string) => ['rooms', id, 'participants'] as const,
  },
  exams: {
    all: ['exams'] as const,
    list: (params?: Record<string, unknown>) => ['exams', 'list', params] as const,
    detail: (id: string) => ['exams', 'detail', id] as const,
    practice: (params?: Record<string, unknown>) => ['exams', 'practice', params] as const,
  },
  questions: {
    all: ['questions'] as const,
    list: (params?: Record<string, unknown>) => ['questions', 'list', params] as const,
    detail: (id: string) => ['questions', 'detail', id] as const,
    byDifficulty: (level: string) => ['questions', 'byDifficulty', level] as const,
    byTopic: (topic: string) => ['questions', 'byTopic', topic] as const,
  },
  attempts: {
    all: ['attempts'] as const,
    list: (params?: Record<string, unknown>) => ['attempts', 'list', params] as const,
    detail: (id: string) => ['attempts', 'detail', id] as const,
    stats: (userId?: string) => ['attempts', 'stats', userId] as const,
  },
  users: {
    all: ['users'] as const,
    profile: (id?: string) => ['users', 'profile', id] as const,
    search: (query: string) => ['users', 'search', query] as const,
  },
  notifications: {
    all: ['notifications'] as const,
    unread: () => ['notifications', 'unread'] as const,
    list: (params?: Record<string, unknown>) => ['notifications', 'list', params] as const,
  },
} as const
