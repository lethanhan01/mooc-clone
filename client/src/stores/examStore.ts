import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { onLogout } from './authStore'

export interface ExamSessionState {
  activeAttemptId: number | null
  activeRoomCode: string | null
  currentIndex: number
  answers: Record<number, number> // questionId -> selectedOptionId
  flaggedQuestionIds: number[]
  remainingSeconds: number

  startSession: (params: {
    attemptId: number
    roomCode?: string | null
    durationSeconds: number
    initialAnswers?: Record<number, number>
  }) => void
  selectAnswer: (questionId: number, optionId: number) => void
  toggleFlag: (questionId: number) => void
  setCurrentIndex: (index: number) => void
  decrementTimer: () => void
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

      startSession: ({ attemptId, roomCode = null, durationSeconds, initialAnswers = {} }) =>
        set({
          activeAttemptId: attemptId,
          activeRoomCode: roomCode,
          currentIndex: 0,
          answers: initialAnswers,
          flaggedQuestionIds: [],
          remainingSeconds: durationSeconds,
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

      decrementTimer: () =>
        set((state) => ({
          remainingSeconds: Math.max(0, state.remainingSeconds - 1),
        })),

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
