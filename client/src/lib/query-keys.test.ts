import { describe, it, expect } from 'vitest'
import { queryKeys } from './query-keys'

describe('query-keys.ts - Centralized TanStack Query Key Factory Pattern', () => {
  it('defines all mooc-clone core domains', () => {
    const domains = [
      'rooms',
      'exams',
      'questions',
      'attempts',
      'users',
      'notifications',
    ] as const

    for (const domain of domains) {
      expect(queryKeys, `Domain "${domain}" must be defined`).toHaveProperty(domain)
    }
  })

  it('produces correct query key tuples for rooms', () => {
    expect(queryKeys.rooms.all).toEqual(['rooms'])
    expect(queryKeys.rooms.list({ status: 'open' })).toEqual(['rooms', 'list', { status: 'open' }])
    expect(queryKeys.rooms.detail('room-123')).toEqual(['rooms', 'detail', 'room-123'])
    expect(queryKeys.rooms.participants('room-123')).toEqual(['rooms', 'room-123', 'participants'])
  })

  it('produces correct query key tuples for exams', () => {
    expect(queryKeys.exams.all).toEqual(['exams'])
    expect(queryKeys.exams.list()).toEqual(['exams', 'list', undefined])
    expect(queryKeys.exams.detail('ex-456')).toEqual(['exams', 'detail', 'ex-456'])
    expect(queryKeys.exams.practice({ difficulty: 'hard' })).toEqual([
      'exams',
      'practice',
      { difficulty: 'hard' },
    ])
  })

  it('produces correct query key tuples for questions', () => {
    expect(queryKeys.questions.all).toEqual(['questions'])
    expect(queryKeys.questions.list({ page: 1 })).toEqual(['questions', 'list', { page: 1 }])
    expect(queryKeys.questions.detail('q-1')).toEqual(['questions', 'detail', 'q-1'])
    expect(queryKeys.questions.byDifficulty('medium')).toEqual(['questions', 'byDifficulty', 'medium'])
    expect(queryKeys.questions.byTopic('networks')).toEqual(['questions', 'byTopic', 'networks'])
  })

  it('produces correct query key tuples for attempts and stats', () => {
    expect(queryKeys.attempts.all).toEqual(['attempts'])
    expect(queryKeys.attempts.list({ userId: 'u-1' })).toEqual(['attempts', 'list', { userId: 'u-1' }])
    expect(queryKeys.attempts.detail('att-789')).toEqual(['attempts', 'detail', 'att-789'])
    expect(queryKeys.attempts.stats('u-1')).toEqual(['attempts', 'stats', 'u-1'])
  })

  it('produces correct query key tuples for users and notifications', () => {
    expect(queryKeys.users.all).toEqual(['users'])
    expect(queryKeys.users.profile('u-1')).toEqual(['users', 'profile', 'u-1'])
    expect(queryKeys.users.search('An')).toEqual(['users', 'search', 'An'])

    expect(queryKeys.notifications.all).toEqual(['notifications'])
    expect(queryKeys.notifications.unread()).toEqual(['notifications', 'unread'])
    expect(queryKeys.notifications.list({ unreadOnly: true })).toEqual([
      'notifications',
      'list',
      { unreadOnly: true },
    ])
  })
})
