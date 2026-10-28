import { describe, it, expect, beforeEach } from 'vitest'
import {
  useExamStore,
  computeRemainingSecondsFromClockOffset,
} from './examStore'
import { computeAdaptiveRoomPollingInterval } from '@/hooks/queries/useRoomsQuery'

describe('HTTP Short Polling & Server Authoritative Timestamp (Clock-Offset Engine)', () => {
  beforeEach(() => {
    useExamStore.getState().clearSession()
  })

  describe('computeAdaptiveRoomPollingInterval', () => {
    it('returns 2000ms when room is WAITING to quickly catch exam start', () => {
      expect(computeAdaptiveRoomPollingInterval('WAITING')).toBe(2000)
      expect(computeAdaptiveRoomPollingInterval('waiting')).toBe(2000)
    })

    it('returns 3000ms when room is RUNNING to sync status alongside local clock-offset timer', () => {
      expect(computeAdaptiveRoomPollingInterval('RUNNING')).toBe(3000)
      expect(computeAdaptiveRoomPollingInterval('in_progress')).toBe(3000)
    })

    it('returns false when room is ENDED, CANCELLED, or undefined to stop polling', () => {
      expect(computeAdaptiveRoomPollingInterval('ENDED')).toBe(false)
      expect(computeAdaptiveRoomPollingInterval('CANCELLED')).toBe(false)
      expect(computeAdaptiveRoomPollingInterval('finished')).toBe(false)
      expect(computeAdaptiveRoomPollingInterval('cancelled')).toBe(false)
      expect(computeAdaptiveRoomPollingInterval(undefined)).toBe(false)
      expect(computeAdaptiveRoomPollingInterval(null)).toBe(false)
    })
  })

  describe('Anti-Cheat Clock Offset & Background Tab Drift Recovery', () => {
    it('cancels out client clock tampering (+1 hour or -1 hour skew)', () => {
      const trueServerNowMs = Date.parse('2026-10-28T06:00:00.000Z')
      const endsAtMs = Date.parse('2026-10-28T06:15:00.000Z') // 900 seconds remaining on server

      // Case 1: Student sets system clock 1 hour behind to try to gain extra time
      const tamperedClientBackMs = trueServerNowMs - 3600_000
      const offsetBack = trueServerNowMs - tamperedClientBackMs
      expect(
        computeRemainingSecondsFromClockOffset(endsAtMs, offsetBack, tamperedClientBackMs)
      ).toBe(900)

      // Case 2: Student system clock is 1 hour ahead
      const tamperedClientAheadMs = trueServerNowMs + 3600_000
      const offsetAhead = trueServerNowMs - tamperedClientAheadMs
      expect(
        computeRemainingSecondsFromClockOffset(endsAtMs, offsetAhead, tamperedClientAheadMs)
      ).toBe(900)
    })

    it('recovers immediately from background tab throttling when decrementTimer ticks', () => {
      const serverNowIso = '2026-10-28T06:00:00.000Z'
      const endsAtIso = '2026-10-28T06:10:00.000Z' // 600s
      const initialClientMs = Date.parse('2026-10-28T06:00:00.000Z')

      useExamStore.getState().startSession({
        attemptId: 101,
        roomCode: 'ROOM01',
        durationSeconds: 600,
      })
      useExamStore.getState().syncServerClock({
        serverNow: serverNowIso,
        endsAt: endsAtIso,
        clientNowMs: initialClientMs,
      })

      expect(useExamStore.getState().remainingSeconds).toBe(600)

      // Simulate browser background tab freezing setInterval for 45 seconds, then firing once
      const afterBackgroundWakeMs = initialClientMs + 45_000
      useExamStore.getState().decrementTimer(afterBackgroundWakeMs)

      expect(useExamStore.getState().remainingSeconds).toBe(555)
    })

    it('falls back to standard 1-second decrement in standalone Practice mode (no endsAt)', () => {
      useExamStore.getState().startSession({
        attemptId: 202,
        roomCode: null,
        durationSeconds: 120,
      })
      expect(useExamStore.getState().remainingSeconds).toBe(120)

      useExamStore.getState().decrementTimer()
      expect(useExamStore.getState().remainingSeconds).toBe(119)
    })
  })
})

