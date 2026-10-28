import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { onLogout } from './authStore'

/**
 * Công thức toán học chống gian lận chỉnh giờ máy trạm (Anti-Cheat Clock Offset):
 * Δt = T_serverNow - T_clientNow
 * T_estimatedServer = Date.now() + Δt
 * remainingSeconds = max(0, floor((T_endsAt - T_estimatedServer) / 1000))
 */
export function computeRemainingSecondsFromClockOffset(
  endsAtMs: number,
  clockOffsetMs: number,
  clientNowMs: number = Date.now()
): number {
  const estimatedServerNowMs = clientNowMs + clockOffsetMs
  return Math.max(0, Math.floor((endsAtMs - estimatedServerNowMs) / 1000))
}

export interface ExamSessionState {
  activeAttemptId: number | null
  activeRoomCode: string | null
  currentIndex: number
  answers: Record<number, number> // questionId -> selectedOptionId
  flaggedQuestionIds: number[]
  remainingSeconds: number
  endsAtMs: number | null
  clockOffsetMs: number

  startSession: (params: {
    attemptId: number
    roomCode?: string | null
    durationSeconds: number
    endsAt?: string | null
    serverNow?: string | null
    initialAnswers?: Record<number, number>
  }) => void
  syncServerClock: (params: {
    endsAt?: string | null
    serverNow?: string | null
    clientNowMs?: number
  }) => void
  selectAnswer: (questionId: number, optionId: number) => void
  toggleFlag: (questionId: number) => void
  setCurrentIndex: (index: number) => void
  decrementTimer: (clientNowMs?: number) => void
  clearSession: () => void
}

export const useExamStore = create<ExamSessionState>()(
  persist(
    (set) => ({
      activeAttemptId: null,
      activeRoomCode: null,
      currentIndex: 0,
      answers: {},
      flaggedQuestionIds: [],
      remainingSeconds: 0,
      endsAtMs: null,
      clockOffsetMs: 0,

      startSession: ({
        attemptId,
        roomCode = null,
        durationSeconds,
        endsAt = null,
        serverNow = null,
        initialAnswers = {},
      }) => {
        const nowMs = Date.now()
        const parsedEndsAt = endsAt ? Date.parse(endsAt) : Number.NaN
        const parsedServerNow = serverNow ? Date.parse(serverNow) : Number.NaN
        const hasValidEndsAt = Number.isFinite(parsedEndsAt)
        const clockOffsetMs = Number.isFinite(parsedServerNow) ? parsedServerNow - nowMs : 0
        const remainingSeconds = hasValidEndsAt
          ? computeRemainingSecondsFromClockOffset(parsedEndsAt, clockOffsetMs, nowMs)
          : durationSeconds

        set({
          activeAttemptId: attemptId,
          activeRoomCode: roomCode,
          currentIndex: 0,
          answers: initialAnswers,
          flaggedQuestionIds: [],
          remainingSeconds,
          endsAtMs: hasValidEndsAt ? parsedEndsAt : null,
          clockOffsetMs,
        })
      },

      syncServerClock: ({ endsAt = null, serverNow = null, clientNowMs = Date.now() }) =>
        set((state) => {
          const parsedEndsAt = endsAt ? Date.parse(endsAt) : Number.NaN
          if (!Number.isFinite(parsedEndsAt)) {
            return state
          }
          const parsedServerNow = serverNow ? Date.parse(serverNow) : Number.NaN
          const clockOffsetMs = Number.isFinite(parsedServerNow)
            ? parsedServerNow - clientNowMs
            : state.clockOffsetMs
          const remainingSeconds = computeRemainingSecondsFromClockOffset(
            parsedEndsAt,
            clockOffsetMs,
            clientNowMs
          )
          return {
            endsAtMs: parsedEndsAt,
            clockOffsetMs,
            remainingSeconds,
          }
        }),

      selectAnswer: (questionId, optionId) =>
        set((state) => ({
          answers: { ...state.answers, [questionId]: optionId },
        })),

      toggleFlag: (questionId) =>
        set((state) => ({
          flaggedQuestionIds: state.flaggedQuestionIds.includes(questionId)
            ? state.flaggedQuestionIds.filter((id) => id !== questionId)
            : [...state.flaggedQuestionIds, questionId],
        })),

      setCurrentIndex: (index) => set({ currentIndex: index }),

      decrementTimer: (clientNowMs = Date.now()) =>
        set((state) => {
          if (state.endsAtMs !== null) {
            return {
              remainingSeconds: computeRemainingSecondsFromClockOffset(
                state.endsAtMs,
                state.clockOffsetMs,
                clientNowMs
              ),
            }
          }
          return {
            remainingSeconds: Math.max(0, state.remainingSeconds - 1),
          }
        }),

      clearSession: () => {
        try {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('mooc_exam_active_session')
            sessionStorage.removeItem('mooc_exam_active_session')
          }
        } catch (error) {
          void error
        }
        set({
          activeAttemptId: null,
          activeRoomCode: null,
          currentIndex: 0,
          answers: {},
          flaggedQuestionIds: [],
          remainingSeconds: 0,
          endsAtMs: null,
          clockOffsetMs: 0,
        })
      },
    }),
    {
      name: 'mooc_exam_active_session',
    }
  )
)

onLogout(() => {
  useExamStore.getState().clearSession()
})
