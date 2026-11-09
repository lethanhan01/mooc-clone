import { create } from 'zustand'
import {
  MOCK_BANKS,
  MOCK_EXAMS,
  MOCK_QUESTIONS,
  MOCK_ROOMS,
  MOCK_ROOM_LOGS,
  MOCK_SEMESTERS,
  MOCK_STUDENTS,
  MOCK_SUBJECTS,
  type Difficulty,
  type MockExamPaper,
  type MockQuestion,
  type MockQuestionBank,
  type MockRoom,
  type MockStudentAccount,
  type QuestionType,
  type RoomMode,
} from '@/mocks/teacher-workflow.fixtures'

interface CreateBankInput {
  name: string
  subjectId: string
  description: string
  tags: string[]
}

interface CreateQuestionInput {
  bankId: string
  type: QuestionType
  content: string
  difficulty: Difficulty
  topic: string
  options: { content: string; isCorrect: boolean }[]
}

interface GenerateExamsInput {
  bankId: string
  count: number
  durationMinutes: number
  easyRatio: number
  mediumRatio: number
  hardRatio: number
}

interface MockTeacherState {
  semesters: typeof MOCK_SEMESTERS
  selectedSemesterId: string
  subjects: typeof MOCK_SUBJECTS
  banks: MockQuestionBank[]
  questions: MockQuestion[]
  exams: MockExamPaper[]
  rooms: MockRoom[]
  students: MockStudentAccount[]
  roomLogs: typeof MOCK_ROOM_LOGS
  setSemester: (id: string) => void
  createBank: (input: CreateBankInput) => MockQuestionBank
  cloneBank: (bankId: string) => MockQuestionBank | null
  addQuestion: (input: CreateQuestionInput) => MockQuestion
  importQuestionsCsv: (bankId: string, rows: { content: string; difficulty: Difficulty; topic: string; answer: string; options: string[] }[]) => number
  generateExams: (input: GenerateExamsInput) => MockExamPaper[]
  updateExamTitle: (examId: string, title: string) => void
  addQuestionToExam: (examId: string, questionId: string) => void
  removeQuestionFromExam: (examId: string, questionId: string) => void
  moveExamQuestion: (examId: string, questionId: string, direction: -1 | 1) => void
  setRoomAssignees: (roomId: string, studentIds: string[]) => void
  importRoomAssignees: (
    roomId: string,
    rows: { username: string; fullName: string; email: string }[]
  ) => { assigned: number; created: number }
  assignStudentsToRoom: (roomId: string, studentIds: string[]) => void
  importStudents: (rows: Omit<MockStudentAccount, 'id' | 'mustChangePassword' | 'tempPassword'>[]) => MockStudentAccount[]
  createRoom: (input: Omit<MockRoom, 'id' | 'assigneeIds' | 'status'> & { status?: MockRoom['status'] }) => MockRoom
  demoPasswordReminder: boolean
  clearPasswordReminder: (identity?: { email?: string | null; studentId?: string | null }) => void
}

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`
}

export const useMockTeacherStore = create<MockTeacherState>((set, get) => ({
  semesters: MOCK_SEMESTERS,
  selectedSemesterId: MOCK_SEMESTERS.find((s) => s.current)?.id ?? MOCK_SEMESTERS[0].id,
  subjects: MOCK_SUBJECTS,
  banks: [...MOCK_BANKS],
  questions: [...MOCK_QUESTIONS],
  exams: [...MOCK_EXAMS],
  rooms: [...MOCK_ROOMS],
  students: [...MOCK_STUDENTS],
  roomLogs: [...MOCK_ROOM_LOGS],
  demoPasswordReminder: true,

  setSemester: (id) => set({ selectedSemesterId: id }),

  createBank: (input) => {
    const bank: MockQuestionBank = {
      id: uid('bank'),
      name: input.name,
      subjectId: input.subjectId,
      description: input.description,
      tags: input.tags,
      questionCount: 0,
      updatedAt: new Date().toISOString(),
    }
    set((s) => ({ banks: [bank, ...s.banks] }))
    return bank
  },

  cloneBank: (bankId) => {
    const source = get().banks.find((b) => b.id === bankId)
    if (!source) return null
    const newBankId = uid('bank')
    const clonedQuestions = get()
      .questions.filter((q) => q.bankId === bankId)
      .map((q) => ({
        ...q,
        id: uid('q'),
        bankId: newBankId,
        options: q.options.map((o) => ({ ...o, id: uid('opt') })),
      }))
    const bank: MockQuestionBank = {
      ...source,
      id: newBankId,
      name: `${source.name} (bản sao)`,
      questionCount: clonedQuestions.length,
      updatedAt: new Date().toISOString(),
    }
    set((s) => ({
      banks: [bank, ...s.banks],
      questions: [...clonedQuestions, ...s.questions],
    }))
    return bank
  },

  addQuestion: (input) => {
    const question: MockQuestion = {
      id: uid('q'),
      bankId: input.bankId,
      type: input.type,
      content: input.content,
      difficulty: input.difficulty,
      topic: input.topic,
      options: input.options.map((o, i) => ({
        id: uid('opt'),
        label: String.fromCodePoint(65 + i),
        content: o.content,
        isCorrect: o.isCorrect,
      })),
    }
    set((s) => ({
      questions: [question, ...s.questions],
      banks: s.banks.map((b) =>
        b.id === input.bankId
          ? { ...b, questionCount: b.questionCount + 1, updatedAt: new Date().toISOString() }
          : b
      ),
    }))
    return question
  },

  importQuestionsCsv: (bankId, rows) => {
    const created = rows.map((row) => {
      const options = row.options.map((content, i) => ({
        id: uid('opt'),
        label: String.fromCodePoint(65 + i),
        content,
        isCorrect: content.trim() === row.answer.trim() || String.fromCodePoint(65 + i) === row.answer.trim().toUpperCase(),
      }))
      const question: MockQuestion = {
        id: uid('q'),
        bankId,
        type: 'SINGLE',
        content: row.content,
        difficulty: row.difficulty,
        topic: row.topic,
        options,
      }
      return question
    })
    set((s) => ({
      questions: [...created, ...s.questions],
      banks: s.banks.map((b) =>
        b.id === bankId
          ? { ...b, questionCount: b.questionCount + created.length, updatedAt: new Date().toISOString() }
          : b
      ),
    }))
    return created.length
  },

  generateExams: (input) => {
    const pool = get().questions.filter((q) => q.bankId === input.bankId)
    const papers: MockExamPaper[] = Array.from({ length: input.count }, (_, i) => {
      const shuffled = [...pool].sort(() => Math.random() - 0.5)
      const pick = shuffled.slice(0, Math.min(3, shuffled.length)).map((q) => q.id)
      return {
        id: uid('exam'),
        bankId: input.bankId,
        title: `Đề tự sinh #${i + 1}`,
        variantIndex: i + 1,
        durationMinutes: input.durationMinutes,
        questionIds: pick,
        easyRatio: input.easyRatio,
        mediumRatio: input.mediumRatio,
        hardRatio: input.hardRatio,
      }
    })
    set((s) => ({ exams: [...papers, ...s.exams] }))
    return papers
  },

  updateExamTitle: (examId, title) => {
    set((s) => ({
      exams: s.exams.map((e) => (e.id === examId ? { ...e, title } : e)),
    }))
  },

  addQuestionToExam: (examId, questionId) => {
    set((s) => ({
      exams: s.exams.map((e) =>
        e.id === examId && !e.questionIds.includes(questionId)
          ? { ...e, questionIds: [...e.questionIds, questionId] }
          : e
      ),
    }))
  },

  removeQuestionFromExam: (examId, questionId) => {
    set((s) => ({
      exams: s.exams.map((e) =>
        e.id === examId ? { ...e, questionIds: e.questionIds.filter((id) => id !== questionId) } : e
      ),
    }))
  },

  moveExamQuestion: (examId, questionId, direction) => {
    set((s) => ({
      exams: s.exams.map((e) => {
        if (e.id !== examId) return e
        const index = e.questionIds.indexOf(questionId)
        const next = index + direction
        if (index < 0 || next < 0 || next >= e.questionIds.length) return e
        const questionIds = [...e.questionIds]
        const [item] = questionIds.splice(index, 1)
        if (!item) return e
        questionIds.splice(next, 0, item)
        return { ...e, questionIds }
      }),
    }))
  },

  setRoomAssignees: (roomId, studentIds) => {
    set((s) => ({
      rooms: s.rooms.map((r) => (r.id === roomId ? { ...r, assigneeIds: [...new Set(studentIds)] } : r)),
    }))
  },

  importRoomAssignees: (roomId, rows) => {
    const state = get()
    const createdAccounts: MockStudentAccount[] = []
    const ids: string[] = []
    for (const row of rows) {
      const username = row.username.trim()
      const email = row.email.trim()
      if (!username && !email) continue
      const existing = state.students.find(
        (stu) =>
          (username && stu.username.toLowerCase() === username.toLowerCase()) ||
          (email && stu.email.toLowerCase() === email.toLowerCase())
      )
      if (existing) {
        ids.push(existing.id)
        continue
      }
      const account: MockStudentAccount = {
        id: uid('stu'),
        username: username || email.split('@')[0] || uid('sv'),
        fullName: row.fullName.trim() || username || email,
        email: email || `${username}@sis.hust.edu.vn`,
        tempPassword: `Temp@${Math.random().toString(36).slice(2, 8)}`,
        mustChangePassword: true,
      }
      createdAccounts.push(account)
      ids.push(account.id)
    }
    set((s) => ({
      students: [...createdAccounts, ...s.students],
      rooms: s.rooms.map((r) =>
        r.id === roomId ? { ...r, assigneeIds: [...new Set([...r.assigneeIds, ...ids])] } : r
      ),
    }))
    return { assigned: ids.length, created: createdAccounts.length }
  },

  assignStudentsToRoom: (roomId, studentIds) => {
    set((s) => ({
      rooms: s.rooms.map((r) =>
        r.id === roomId ? { ...r, assigneeIds: [...new Set([...r.assigneeIds, ...studentIds])] } : r
      ),
    }))
  },

  importStudents: (rows) => {
    const created = rows.map((row) => ({
      ...row,
      id: uid('stu'),
      tempPassword: `Temp@${Math.random().toString(36).slice(2, 8)}`,
      mustChangePassword: true,
    }))
    set((s) => ({ students: [...created, ...s.students] }))
    return created
  },

  createRoom: (input) => {
    const room: MockRoom = {
      ...input,
      id: uid('room'),
      status: input.status ?? 'DRAFT',
      assigneeIds: [],
    }
    set((s) => ({ rooms: [room, ...s.rooms] }))
    return room
  },

  clearPasswordReminder: (identity) => {
    const email = identity?.email?.toLowerCase() ?? ''
    const local = email.split('@')[0]
    const studentId = identity?.studentId?.toLowerCase() ?? ''
    set((s) => ({
      demoPasswordReminder: false,
      students: s.students.map((stu) => {
        const hit =
          (email && (stu.email.toLowerCase() === email || stu.username.toLowerCase() === local)) ||
          (studentId && stu.username.toLowerCase() === studentId)
        return hit ? { ...stu, mustChangePassword: false } : stu
      }),
    }))
  },
}))

export function selectSubjectsForSemester(semesterId: string) {
  return useMockTeacherStore.getState().subjects.filter((s) => s.semesterId === semesterId)
}

export type { RoomMode }
