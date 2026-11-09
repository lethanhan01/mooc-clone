export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD'
export type QuestionType = 'SINGLE' | 'MULTI' | 'FILL'
export type RoomMode = 'EXAM' | 'PRACTICE'
export type RoomLifecycle = 'DRAFT' | 'OPEN' | 'RUNNING' | 'CLOSED'

export interface MockSubject {
  id: string
  code: string
  name: string
  semesterId: string
  department: string
}

export interface MockSemester {
  id: string
  label: string
  current: boolean
}

export interface MockQuestionOption {
  id: string
  label: string
  content: string
  isCorrect: boolean
}

export interface MockQuestion {
  id: string
  bankId: string
  type: QuestionType
  content: string
  difficulty: Difficulty
  topic: string
  options: MockQuestionOption[]
}

export interface MockQuestionBank {
  id: string
  name: string
  subjectId: string
  description: string
  tags: string[]
  questionCount: number
  updatedAt: string
}

export interface MockExamPaper {
  id: string
  bankId: string
  title: string
  variantIndex: number
  durationMinutes: number
  questionIds: string[]
  easyRatio: number
  mediumRatio: number
  hardRatio: number
}

export interface MockRoom {
  id: string
  name: string
  subjectId: string
  classCode: string
  examPaperIds: string[]
  mode: RoomMode
  status: RoomLifecycle
  capacity: number
  openAt: string
  closeAt: string
  durationMinutes: number
  assigneeIds: string[]
}

export interface MockStudentAccount {
  id: string
  username: string
  fullName: string
  email: string
  tempPassword: string
  mustChangePassword: boolean
}

export interface MockRoomLog {
  id: string
  roomId: string
  at: string
  event: 'JOIN' | 'START' | 'ANSWER_CHANGE' | 'SUBMIT' | 'LEAVE' | 'TIMEOUT'
  actorName: string
  detail: string
}

export const MOCK_SEMESTERS: MockSemester[] = [
  { id: 'sem-20252', label: '2025-2', current: true },
  { id: 'sem-20251', label: '2025-1', current: false },
  { id: 'sem-20242', label: '2024-2', current: false },
]

export const MOCK_SUBJECTS: MockSubject[] = [
  {
    id: 'sub-it4549',
    code: 'IT4549',
    name: 'Phát triển phần mềm theo chuẩn kỹ năng ITSS',
    semesterId: 'sem-20252',
    department: 'SoICT',
  },
  {
    id: 'sub-it4441',
    code: 'IT4441',
    name: 'Giao diện và trải nghiệm người dùng',
    semesterId: 'sem-20252',
    department: 'SoICT',
  },
  {
    id: 'sub-it4785',
    code: 'IT4785E',
    name: 'Mobile Programming',
    semesterId: 'sem-20251',
    department: 'SoICT',
  },
]

export const MOCK_BANKS: MockQuestionBank[] = [
  {
    id: 'bank-1',
    name: 'Ngân hàng IT4549 — Cuối kỳ',
    subjectId: 'sub-it4549',
    description: 'Bộ câu hỏi trắc nghiệm cuối kỳ 2025-2',
    tags: ['cuối kỳ', 'ITSS'],
    questionCount: 4,
    updatedAt: '2026-11-01T10:00:00+07:00',
  },
  {
    id: 'bank-2',
    name: 'Ngân hàng IT4441 — Ôn tập',
    subjectId: 'sub-it4441',
    description: 'Câu hỏi luyện tập UX/UI',
    tags: ['luyện tập', 'UX'],
    questionCount: 2,
    updatedAt: '2026-10-20T08:30:00+07:00',
  },
]

export const MOCK_QUESTIONS: MockQuestion[] = [
  {
    id: 'q1',
    bankId: 'bank-1',
    type: 'SINGLE',
    content: 'Mô hình nào phù hợp nhất cho phát triển phần mềm theo chuẩn ITSS?',
    difficulty: 'EASY',
    topic: 'Quy trình',
    options: [
      { id: 'q1a', label: 'A', content: 'Thác nước thuần túy', isCorrect: false },
      { id: 'q1b', label: 'B', content: 'Lặp / tăng dần có kiểm soát chất lượng', isCorrect: true },
      { id: 'q1c', label: 'C', content: 'Không cần quy trình', isCorrect: false },
      { id: 'q1d', label: 'D', content: 'Chỉ coding ad-hoc', isCorrect: false },
    ],
  },
  {
    id: 'q2',
    bankId: 'bank-1',
    type: 'SINGLE',
    content: 'Mục đích chính của kiểm thử hồi quy là gì?',
    difficulty: 'MEDIUM',
    topic: 'Kiểm thử',
    options: [
      { id: 'q2a', label: 'A', content: 'Tăng tốc độ coding', isCorrect: false },
      { id: 'q2b', label: 'B', content: 'Đảm bảo thay đổi không phá chức năng cũ', isCorrect: true },
      { id: 'q2c', label: 'C', content: 'Thay thế review code', isCorrect: false },
      { id: 'q2d', label: 'D', content: 'Chỉ kiểm UI', isCorrect: false },
    ],
  },
  {
    id: 'q3',
    bankId: 'bank-1',
    type: 'SINGLE',
    content: 'Trong quản lý rủi ro dự án, bước nào nên làm sớm?',
    difficulty: 'HARD',
    topic: 'Quản lý dự án',
    options: [
      { id: 'q3a', label: 'A', content: 'Chỉ xử lý khi sự cố xảy ra', isCorrect: false },
      { id: 'q3b', label: 'B', content: 'Nhận diện và đánh giá rủi ro từ đầu', isCorrect: true },
      { id: 'q3c', label: 'C', content: 'Bỏ qua rủi ro nhỏ', isCorrect: false },
      { id: 'q3d', label: 'D', content: 'Chỉ ghi nhận rủi ro kỹ thuật', isCorrect: false },
    ],
  },
  {
    id: 'q4',
    bankId: 'bank-1',
    type: 'MULTI',
    content: 'Những thành phần nào thuộc Definition of Done? (chọn nhiều)',
    difficulty: 'MEDIUM',
    topic: 'Agile',
    options: [
      { id: 'q4a', label: 'A', content: 'Code đã review', isCorrect: true },
      { id: 'q4b', label: 'B', content: 'Test tự động xanh', isCorrect: true },
      { id: 'q4c', label: 'C', content: 'Không cần tài liệu', isCorrect: false },
      { id: 'q4d', label: 'D', content: 'Đã merge vào nhánh chính theo quy ước', isCorrect: true },
    ],
  },
  {
    id: 'q5',
    bankId: 'bank-2',
    type: 'SINGLE',
    content: 'Nguyên tắc nào giúp giảm tải nhận thức trên form?',
    difficulty: 'EASY',
    topic: 'UX',
    options: [
      { id: 'q5a', label: 'A', content: 'Nhóm trường liên quan, label rõ', isCorrect: true },
      { id: 'q5b', label: 'B', content: 'Ẩn toàn bộ helper text', isCorrect: false },
      { id: 'q5c', label: 'C', content: 'Dùng nhiều màu tùy ý', isCorrect: false },
      { id: 'q5d', label: 'D', content: 'Bỏ validation', isCorrect: false },
    ],
  },
  {
    id: 'q6',
    bankId: 'bank-2',
    type: 'FILL',
    content: 'Touch target tối thiểu theo WCAG gợi ý thường là ____ px.',
    difficulty: 'MEDIUM',
    topic: 'A11y',
    options: [{ id: 'q6a', label: 'Đáp án', content: '44', isCorrect: true }],
  },
]

export const MOCK_EXAMS: MockExamPaper[] = [
  {
    id: 'exam-1',
    bankId: 'bank-1',
    title: 'Đề IT4549 — Mã A',
    variantIndex: 1,
    durationMinutes: 60,
    questionIds: ['q1', 'q2', 'q3'],
    easyRatio: 40,
    mediumRatio: 40,
    hardRatio: 20,
  },
  {
    id: 'exam-2',
    bankId: 'bank-1',
    title: 'Đề IT4549 — Mã B',
    variantIndex: 2,
    durationMinutes: 60,
    questionIds: ['q2', 'q3', 'q4'],
    easyRatio: 40,
    mediumRatio: 40,
    hardRatio: 20,
  },
]

export const MOCK_ROOMS: MockRoom[] = [
  {
    id: 'room-1',
    name: 'Thi cuối kỳ 2025-2 ngày 10.7 kíp 5',
    subjectId: 'sub-it4549',
    classCode: '148123',
    examPaperIds: ['exam-1', 'exam-2'],
    mode: 'EXAM',
    status: 'OPEN',
    capacity: 100,
    openAt: '2026-07-10T17:00:00+07:00',
    closeAt: '2026-07-10T19:00:00+07:00',
    durationMinutes: 60,
    assigneeIds: ['stu-1', 'stu-2'],
  },
  {
    id: 'room-2',
    name: 'Luyện tập IT4441',
    subjectId: 'sub-it4441',
    classCode: 'PUBLIC',
    examPaperIds: ['exam-1'],
    mode: 'PRACTICE',
    status: 'OPEN',
    capacity: 200,
    openAt: '2026-11-01T00:00:00+07:00',
    closeAt: '2026-12-31T23:59:00+07:00',
    durationMinutes: 45,
    assigneeIds: [],
  },
]

export const MOCK_STUDENTS: MockStudentAccount[] = [
  {
    id: 'stu-1',
    username: '20235760',
    fullName: 'Nguyễn Văn A',
    email: 'a.nv235760@sis.hust.edu.vn',
    tempPassword: 'Temp@1234',
    mustChangePassword: true,
  },
  {
    id: 'stu-2',
    username: '20235761',
    fullName: 'Trần Thị B',
    email: 'b.tt235761@sis.hust.edu.vn',
    tempPassword: 'Temp@5678',
    mustChangePassword: true,
  },
]

export const MOCK_ROOM_LOGS: MockRoomLog[] = [
  {
    id: 'log-1',
    roomId: 'room-1',
    at: '2026-07-10T17:05:12+07:00',
    event: 'JOIN',
    actorName: 'Nguyễn Văn A',
    detail: 'Vào phòng thi',
  },
  {
    id: 'log-2',
    roomId: 'room-1',
    at: '2026-07-10T17:06:01+07:00',
    event: 'START',
    actorName: 'Nguyễn Văn A',
    detail: 'Bắt đầu làm bài — nhận đề Mã A',
  },
  {
    id: 'log-3',
    roomId: 'room-1',
    at: '2026-07-10T17:12:44+07:00',
    event: 'ANSWER_CHANGE',
    actorName: 'Nguyễn Văn A',
    detail: 'Đổi đáp án câu 2',
  },
  {
    id: 'log-4',
    roomId: 'room-1',
    at: '2026-07-10T18:01:00+07:00',
    event: 'SUBMIT',
    actorName: 'Nguyễn Văn A',
    detail: 'Nộp bài thành công',
  },
]

export const MOCK_STUDENT_COURSES = [
  {
    id: 'course-1',
    title: 'Thi cuối kỳ 2025-2: IT4549 - Phát triển phần mềm theo chuẩn kỹ năng ITSS',
    department: 'SoICT',
    code: 'IT4549',
    statusLabel: 'Đã Bắt đầu - 01/01/2024',
    ended: false,
    roomId: 'room-1',
    href: '/student/rooms/room-1/waiting',
  },
  {
    id: 'course-2',
    title: 'Thi cuối kỳ 2025-2: IT4441 - Giao diện và trải nghiệm người dùng',
    department: 'SoICT',
    code: 'IT4441',
    statusLabel: 'Đã Kết thúc - 31/07/2026',
    ended: true,
    roomId: 'room-2',
    href: '/student/rooms/room-2/summary',
  },
  {
    id: 'course-3',
    title: '20241_Mobile Programming',
    department: 'SoICT',
    code: 'IT4785E',
    statusLabel: 'Đã Bắt đầu - 01/01/2024',
    ended: false,
    roomId: 'room-2',
    href: '/student/practice',
  },
]
