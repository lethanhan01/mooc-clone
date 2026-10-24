/* rogym-convention-exempt: NO_SERVER_STATE_IN_ZUSTAND [Interactive mock exam store — localStorage seed until API] */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  type Difficulty,
  type MockExamSession,
  type MockPracticeAttempt,
  type MockQuestion,
  type MockRoom,
  type MockSubmission,
  type MockSystemLog,
  createSeedLogs,
  createSeedPracticeHistory,
  createSeedQuestionsByRoom,
  createSeedRooms,
  createSeedSubmissions,
  generatePin,
  generateRoomCode,
  SEED_QUESTION_BANK,
} from '@/services/mockData'

interface CreateRoomInput {
  name: string
  subject: string
  topic: string
  durationMinutes: number
  opensAt: string
  mode: MockRoom['mode']
  difficultyConfig: MockRoom['difficultyConfig']
  topics: string[]
  options: MockRoom['options']
  members?: MockRoom['members']
  teacherId: string
  teacherName: string
}

interface MockExamState {
  rooms: MockRoom[]
  questionsByRoom: Record<string, MockQuestion[]>
  activeExamSession: MockExamSession | null
  practiceSession: MockExamSession | null
  submissions: MockSubmission[]
  systemLogs: MockSystemLog[]
  practiceHistory: MockPracticeAttempt[]

  resetMockData: () => void
  createRoom: (input: CreateRoomInput) => MockRoom
  updateRoom: (id: string, patch: Partial<MockRoom>) => void
  deleteRoom: (id: string) => void
  cloneRoom: (id: string) => MockRoom | null
  addQuestion: (roomId: string, question: MockQuestion) => void
  updateQuestion: (roomId: string, questionId: string, question: MockQuestion) => void
  deleteQuestion: (roomId: string, questionId: string) => void
  importQuestions: (roomId: string, questions: MockQuestion[]) => void
  startRoomByTeacher: (roomId: string) => void
  closeRoomByTeacher: (roomId: string) => void
  joinRoomByPin: (pin: string, userId: string, studentId: string, fullName: string, email: string) => MockRoom | null
  startExam: (roomId: string, userId: string) => MockExamSession | null
  selectAnswer: (questionId: string, optionId: string) => void
  toggleFlag: (questionId: string) => void
  setCurrentIndex: (index: number) => void
  submitExam: (userId: string, fullName: string, studentId: string) => MockSubmission | null
  startPractice: (params: {
    userId: string
    topic: string
    difficulty: Difficulty | 'MIXED'
    count: number
  }) => MockExamSession
  selectPracticeAnswer: (questionId: string, optionId: string) => void
  submitPractice: (userId: string, topic: string, difficulty: Difficulty | 'MIXED') => MockPracticeAttempt | null
  appendLog: (log: Omit<MockSystemLog, 'id' | 'at'> & { at?: string }) => void
}

function scoreFromAnswers(questions: MockQuestion[], answers: Record<string, string>) {
  let correct = 0
  let wrong = 0
  let unanswered = 0
  questions.forEach((q) => {
    const selected = answers[q.id]
    if (!selected) {
      unanswered += 1
      return
    }
    const opt = q.options.find((o) => o.id === selected)
    if (opt?.isCorrect) correct += 1
    else wrong += 1
  })
  const total = questions.length || 1
  const score = Math.round((correct / total) * 1000) / 100
  return { correct, wrong, unanswered, score, total }
}

function pickQuestions(config: MockRoom['difficultyConfig'], topics: string[]): MockQuestion[] {
  const pool = SEED_QUESTION_BANK.filter(
    (q) => topics.length === 0 || topics.includes(q.topic)
  )
  const picked: MockQuestion[] = []
  ;(['EASY', 'MEDIUM', 'HARD'] as Difficulty[]).forEach((d) => {
    const need = config[d]
    const available = pool.filter((q) => q.difficulty === d && !picked.includes(q))
    picked.push(...available.slice(0, need))
  })
  if (picked.length === 0) return SEED_QUESTION_BANK.slice(0, 8)
  return picked
}

const initialState = () => ({
  rooms: createSeedRooms(),
  questionsByRoom: createSeedQuestionsByRoom(),
  activeExamSession: null as MockExamSession | null,
  practiceSession: null as MockExamSession | null,
  submissions: createSeedSubmissions(),
  systemLogs: createSeedLogs(),
  practiceHistory: createSeedPracticeHistory(),
})

export const useMockExamStore = create<MockExamState>()(
  persist(
    (set, get) => ({
      ...initialState(),

      resetMockData: () => set(initialState()),

      createRoom: (input) => {
        const rooms = get().rooms
        const room: MockRoom = {
          id: `room_${Date.now()}`,
          code: generateRoomCode(rooms.map((r) => r.code)),
          pin: generatePin(),
          name: input.name,
          subject: input.subject,
          topic: input.topic,
          mode: input.mode,
          status: 'waiting',
          durationMinutes: input.durationMinutes,
          opensAt: input.opensAt,
          endsAt: null,
          teacherName: input.teacherName,
          teacherId: input.teacherId,
          questionCount:
            input.difficultyConfig.EASY + input.difficultyConfig.MEDIUM + input.difficultyConfig.HARD,
          difficultyConfig: input.difficultyConfig,
          topics: input.topics,
          options: input.options,
          members: input.members ?? [],
          createdAt: new Date().toISOString(),
        }
        const questions = pickQuestions(input.difficultyConfig, input.topics)
        set((s) => ({
          rooms: [room, ...s.rooms],
          questionsByRoom: { ...s.questionsByRoom, [room.id]: questions },
          systemLogs: [
            {
              id: `log_${Date.now()}`,
              at: new Date().toISOString(),
              actor: input.teacherName,
              action: 'TẠO PHÒNG THI',
              detail: `Tạo phòng ${room.code} · PIN ${room.pin}`,
              level: 'info',
              roomId: room.id,
              ip: '10.0.0.2',
            },
            ...s.systemLogs,
          ],
        }))
        return room
      },

      updateRoom: (id, patch) =>
        set((s) => ({
          rooms: s.rooms.map((r) => (r.id === id ? { ...r, ...patch } : r)),
        })),

      deleteRoom: (id) =>
        set((s) => {
          const nextQ = { ...s.questionsByRoom }
          delete nextQ[id]
          return {
            rooms: s.rooms.filter((r) => r.id !== id),
            questionsByRoom: nextQ,
          }
        }),

      cloneRoom: (id) => {
        const source = get().rooms.find((r) => r.id === id)
        if (!source) return null
        const rooms = get().rooms
        const clone: MockRoom = {
          ...source,
          id: `room_${Date.now()}`,
          code: generateRoomCode(rooms.map((r) => r.code)),
          pin: generatePin(),
          name: `${source.name} (Bản sao Clone)`,
          status: 'waiting',
          endsAt: null,
          members: [],
          createdAt: new Date().toISOString(),
        }
        const questions = [...(get().questionsByRoom[id] ?? [])]
        set((s) => ({
          rooms: [clone, ...s.rooms],
          questionsByRoom: { ...s.questionsByRoom, [clone.id]: questions },
        }))
        return clone
      },

      addQuestion: (roomId, question) =>
        set((s) => {
          const list = [...(s.questionsByRoom[roomId] ?? []), question]
          return {
            questionsByRoom: { ...s.questionsByRoom, [roomId]: list },
            rooms: s.rooms.map((r) =>
              r.id === roomId ? { ...r, questionCount: list.length } : r
            ),
          }
        }),

      updateQuestion: (roomId, questionId, question) =>
        set((s) => ({
          questionsByRoom: {
            ...s.questionsByRoom,
            [roomId]: (s.questionsByRoom[roomId] ?? []).map((q) =>
              q.id === questionId ? question : q
            ),
          },
        })),

      deleteQuestion: (roomId, questionId) =>
        set((s) => {
          const list = (s.questionsByRoom[roomId] ?? []).filter((q) => q.id !== questionId)
          return {
            questionsByRoom: { ...s.questionsByRoom, [roomId]: list },
            rooms: s.rooms.map((r) =>
              r.id === roomId ? { ...r, questionCount: list.length } : r
            ),
          }
        }),

      importQuestions: (roomId, questions) =>
        set((s) => {
          const list = [...(s.questionsByRoom[roomId] ?? []), ...questions]
          return {
            questionsByRoom: { ...s.questionsByRoom, [roomId]: list },
            rooms: s.rooms.map((r) =>
              r.id === roomId ? { ...r, questionCount: list.length } : r
            ),
          }
        }),

      startRoomByTeacher: (roomId) => {
        const room = get().rooms.find((r) => r.id === roomId)
        if (!room) return
        const endsAt = new Date(Date.now() + room.durationMinutes * 60_000).toISOString()
        set((s) => ({
          rooms: s.rooms.map((r) =>
            r.id === roomId
              ? { ...r, status: 'in_progress', opensAt: new Date().toISOString(), endsAt }
              : r
          ),
          systemLogs: [
            {
              id: `log_${Date.now()}`,
              at: new Date().toISOString(),
              actor: room.teacherName,
              action: 'BẮT ĐẦU PHÒNG THI',
              detail: `Phòng ${room.code} chuyển sang Đang thi`,
              level: 'info',
              roomId,
              ip: '10.0.0.2',
            },
            ...s.systemLogs,
          ],
        }))
      },

      closeRoomByTeacher: (roomId) => {
        const room = get().rooms.find((r) => r.id === roomId)
        if (!room) return
        set((s) => ({
          rooms: s.rooms.map((r) =>
            r.id === roomId
              ? { ...r, status: 'finished', endsAt: new Date().toISOString() }
              : r
          ),
          activeExamSession:
            s.activeExamSession?.roomId === roomId ? null : s.activeExamSession,
          systemLogs: [
            {
              id: `log_${Date.now()}`,
              at: new Date().toISOString(),
              actor: room.teacherName,
              action: 'CƯỠNG CHẾ ĐÓNG PHÒNG',
              detail: `Phòng ${room.code} đã kết thúc`,
              level: 'warning',
              roomId,
              ip: '10.0.0.2',
            },
            ...s.systemLogs,
          ],
        }))
      },

      joinRoomByPin: (pin, userId, studentId, fullName, email) => {
        const room = get().rooms.find((r) => r.pin === pin.trim())
        if (!room || room.status === 'finished' || room.status === 'cancelled') return null
        const exists = room.members.some((m) => m.userId === userId)
        if (!exists) {
          set((s) => ({
            rooms: s.rooms.map((r) =>
              r.id === room.id
                ? {
                    ...r,
                    members: [
                      ...r.members,
                      { userId, studentId, fullName, email, online: true, answeredCount: 0, currentQuestion: 1 },
                    ],
                  }
                : r
            ),
          }))
        }
        return get().rooms.find((r) => r.id === room.id) ?? room
      },

      startExam: (roomId, userId) => {
        const room = get().rooms.find((r) => r.id === roomId)
        const questions = get().questionsByRoom[roomId] ?? []
        if (!room || questions.length === 0) return null
        const endsAt =
          room.endsAt ??
          new Date(Date.now() + room.durationMinutes * 60_000).toISOString()
        const session: MockExamSession = {
          roomId,
          userId,
          questionIds: questions.map((q) => q.id),
          answers: {},
          flagged: [],
          startedAt: new Date().toISOString(),
          endsAt,
          currentIndex: 0,
        }
        if (room.status === 'waiting') {
          get().startRoomByTeacher(roomId)
        }
        set({ activeExamSession: session })
        return session
      },

      selectAnswer: (questionId, optionId) =>
        set((s) => {
          if (!s.activeExamSession) return s
          return {
            activeExamSession: {
              ...s.activeExamSession,
              answers: { ...s.activeExamSession.answers, [questionId]: optionId },
            },
          }
        }),

      toggleFlag: (questionId) =>
        set((s) => {
          if (!s.activeExamSession) return s
          const flagged = s.activeExamSession.flagged.includes(questionId)
            ? s.activeExamSession.flagged.filter((id) => id !== questionId)
            : [...s.activeExamSession.flagged, questionId]
          return { activeExamSession: { ...s.activeExamSession, flagged } }
        }),

      setCurrentIndex: (index) =>
        set((s) =>
          s.activeExamSession
            ? { activeExamSession: { ...s.activeExamSession, currentIndex: index } }
            : s
        ),

      submitExam: (userId, fullName, studentId) => {
        const session = get().activeExamSession
        if (!session) return null
        const questions = get().questionsByRoom[session.roomId] ?? []
        const { correct, wrong, unanswered, score, total } = scoreFromAnswers(
          questions,
          session.answers
        )
        const durationSeconds = Math.max(
          1,
          Math.round((Date.now() - new Date(session.startedAt).getTime()) / 1000)
        )
        const submission: MockSubmission = {
          id: `sub_${Date.now()}`,
          roomId: session.roomId,
          userId,
          studentId,
          fullName,
          score,
          correctCount: correct,
          wrongCount: wrong,
          unansweredCount: unanswered,
          totalQuestions: total,
          durationSeconds,
          submittedAt: new Date().toISOString(),
          early: true,
          answers: session.answers,
          flagged: session.flagged,
        }
        set((s) => ({
          submissions: [submission, ...s.submissions.filter((x) => !(x.roomId === session.roomId && x.userId === userId))],
          activeExamSession: null,
          systemLogs: [
            {
              id: `log_${Date.now()}`,
              at: new Date().toISOString(),
              actor: `${studentId} - ${fullName}`,
              studentId,
              action: 'NỘP BÀI THÀNH CÔNG',
              detail: `Nộp bài · ${score}/10 · ${correct}/${total} đúng`,
              level: 'success',
              roomId: session.roomId,
              ip: '10.0.0.31',
            },
            ...s.systemLogs,
          ],
        }))
        return submission
      },

      startPractice: ({ userId, topic, difficulty, count }) => {
        let pool = SEED_QUESTION_BANK.filter((q) => q.topic === topic || topic === 'Tất cả')
        if (difficulty !== 'MIXED') pool = pool.filter((q) => q.difficulty === difficulty)
        if (pool.length === 0) pool = SEED_QUESTION_BANK
        const questions = pool.slice(0, Math.min(count, pool.length))
        const practiceId = `practice_${Date.now()}`
        set((s) => ({
          questionsByRoom: { ...s.questionsByRoom, [practiceId]: questions },
        }))
        const session: MockExamSession = {
          roomId: practiceId,
          userId,
          questionIds: questions.map((q) => q.id),
          answers: {},
          flagged: [],
          startedAt: new Date().toISOString(),
          endsAt: new Date(Date.now() + 30 * 60_000).toISOString(),
          currentIndex: 0,
        }
        set({ practiceSession: session })
        return session
      },

      selectPracticeAnswer: (questionId, optionId) =>
        set((s) => {
          if (!s.practiceSession) return s
          return {
            practiceSession: {
              ...s.practiceSession,
              answers: { ...s.practiceSession.answers, [questionId]: optionId },
            },
          }
        }),

      submitPractice: (_userId, topic, difficulty) => {
        const session = get().practiceSession
        if (!session) return null
        const questions = get().questionsByRoom[session.roomId] ?? []
        const { correct, score, total } = scoreFromAnswers(questions, session.answers)
        const attempt: MockPracticeAttempt = {
          id: `prac_${Date.now()}`,
          topic,
          difficulty,
          score,
          correctCount: correct,
          totalQuestions: total,
          submittedAt: new Date().toISOString(),
        }
        set((s) => ({
          practiceHistory: [attempt, ...s.practiceHistory],
          practiceSession: null,
        }))
        return attempt
      },

      appendLog: (log) =>
        set((s) => ({
          systemLogs: [
            {
              id: `log_${Date.now()}`,
              at: log.at ?? new Date().toISOString(),
              actor: log.actor,
              studentId: log.studentId,
              action: log.action,
              detail: log.detail,
              level: log.level,
              roomId: log.roomId,
              ip: log.ip ?? '10.0.0.1',
            },
            ...s.systemLogs,
          ],
        })),
    }),
    {
      name: 'mooc-mock-exam-storage',
      partialize: (state) => ({
        rooms: state.rooms,
        questionsByRoom: state.questionsByRoom,
        activeExamSession: state.activeExamSession,
        practiceSession: state.practiceSession,
        submissions: state.submissions,
        systemLogs: state.systemLogs,
        practiceHistory: state.practiceHistory,
      }),
    }
  )
)

export function getHomePathForRoles(roles: string[]): string {
  if (roles.includes('teacher') || roles.includes('admin')) return '/teacher/dashboard'
  return '/student/dashboard'
}
