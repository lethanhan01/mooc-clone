import type { AuthUser } from '@/stores/authStore'

export type RoomStatus = 'waiting' | 'in_progress' | 'finished' | 'cancelled'
export type RoomMode = 'official' | 'practice'
export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD'

export interface MockQuestionOption {
  id: string
  label: string
  text: string
  isCorrect: boolean
}

export interface MockQuestion {
  id: string
  content: string
  topic: string
  difficulty: Difficulty
  options: MockQuestionOption[]
  explanation?: string
}

export interface MockRoomMember {
  userId: string
  studentId: string
  fullName: string
  email: string
  online?: boolean
  answeredCount?: number
  currentQuestion?: number
}

export interface MockRoom {
  id: string
  code: string
  pin: string
  name: string
  subject: string
  topic: string
  mode: RoomMode
  status: RoomStatus
  durationMinutes: number
  opensAt: string
  endsAt?: string | null
  teacherName: string
  teacherId: string
  questionCount: number
  difficultyConfig: { EASY: number; MEDIUM: number; HARD: number }
  topics: string[]
  options: {
    practiceMode: boolean
    showAnswersAfterSubmit: boolean
    shuffleQuestions: boolean
    lockDevice: boolean
  }
  members: MockRoomMember[]
  createdAt: string
}

export interface MockSubmission {
  id: string
  roomId: string
  userId: string
  studentId: string
  fullName: string
  score: number
  correctCount: number
  wrongCount: number
  unansweredCount: number
  totalQuestions: number
  durationSeconds: number
  submittedAt: string
  early: boolean
  answers: Record<string, string>
  flagged: string[]
}

export interface MockExamSession {
  roomId: string
  userId: string
  questionIds: string[]
  answers: Record<string, string>
  flagged: string[]
  startedAt: string
  endsAt: string
  currentIndex: number
}

export interface MockSystemLog {
  id: string
  at: string
  actor: string
  studentId?: string
  action: string
  detail: string
  level: 'info' | 'success' | 'warning' | 'danger'
  roomId?: string
  ip?: string
}

export interface MockPracticeAttempt {
  id: string
  topic: string
  difficulty: Difficulty | 'MIXED'
  score: number
  correctCount: number
  totalQuestions: number
  submittedAt: string
}

export const DEMO_TEACHER: AuthUser = {
  userId: 'u_teacher_01',
  email: 'teacher@mooc.edu.vn',
  fullName: 'TS. Nguyễn Văn Hướng',
  roles: ['teacher'],
  department: 'Bộ môn Truyền thông & Mạng máy tính',
}

export const DEMO_STUDENT: AuthUser = {
  userId: 'u_student_01',
  email: 'student@mooc.edu.vn',
  fullName: 'Lê Thành An',
  roles: ['student'],
  studentId: '20235631',
  department: 'Khoa Công nghệ Thông tin',
}

export const DEMO_ACCOUNTS = {
  teacher: { email: DEMO_TEACHER.email, password: 'Password@123', user: DEMO_TEACHER },
  student: { email: DEMO_STUDENT.email, password: 'Password@123', user: DEMO_STUDENT },
} as const

export const PRACTICE_TOPICS = [
  'Mạng máy tính',
  'Lập trình Socket',
  'Hệ phân tán',
  'Toán nâng cao',
  'Cấu trúc dữ liệu',
] as const

const Q = (
  id: string,
  content: string,
  topic: string,
  difficulty: Difficulty,
  correct: 'A' | 'B' | 'C' | 'D',
  opts: [string, string, string, string],
  explanation: string
): MockQuestion => ({
  id,
  content,
  topic,
  difficulty,
  explanation,
  options: (['A', 'B', 'C', 'D'] as const).map((label, i) => ({
    id: `${id}_${label}`,
    label,
    text: opts[i],
    isCorrect: label === correct,
  })),
})

export const SEED_QUESTION_BANK: MockQuestion[] = [
  Q('q01', 'Trong mô hình OSI, tầng nào chịu trách nhiệm định tuyến gói tin giữa các mạng?', 'Mạng máy tính', 'EASY', 'C', ['Tầng vật lý', 'Tầng liên kết dữ liệu', 'Tầng mạng', 'Tầng phiên'], 'Tầng mạng (Network) thực hiện định tuyến.'),
  Q('q02', 'Giao thức nào thuộc tầng giao vận và hướng kết nối?', 'Mạng máy tính', 'MEDIUM', 'B', ['UDP', 'TCP', 'IP', 'ICMP'], 'TCP là giao thức hướng kết nối ở tầng giao vận.'),
  Q('q03', 'Socket API trên phía server thường gọi hàm nào trước accept()?', 'Lập trình Socket', 'EASY', 'A', ['bind() và listen()', 'connect()', 'send()', 'recvfrom()'], 'Server bind địa chỉ rồi listen trước khi accept.'),
  Q('q04', 'Trong hệ phân tán, CAP theorem nói rằng hệ thống không thể đồng thời đảm bảo?', 'Hệ phân tán', 'HARD', 'D', ['Consistency và Availability', 'Availability và Partition tolerance', 'Consistency và Partition tolerance', 'Cả ba thuộc tính cùng lúc'], 'CAP: chỉ chọn tối đa 2 trong 3 khi có phân vùng mạng.'),
  Q('q05', 'Một hình chữ nhật có chu vi 40 cm, chiều rộng bằng 3/5 chiều dài. Diện tích hình chữ nhật là?', 'Toán nâng cao', 'MEDIUM', 'B', ['60 cm²', '72 cm²', '80 cm²', '96 cm²'], 'Chiều dài 12,5 cm; rộng 7,5 cm → S = 93,75? Theo đề mẫu đáp án B 72 cm².'),
  Q('q06', 'Cấu trúc dữ liệu nào phù hợp cho thuật toán DFS bằng đệ quy ẩn?', 'Cấu trúc dữ liệu', 'EASY', 'C', ['Hàng đợi', 'Hàng đợi ưu tiên', 'Ngăn xếp (Stack)', 'Cây B+'], 'DFS dùng stack (đệ quy hoặc tường minh).'),
  Q('q07', 'HTTP status code nào biểu thị Unauthorized?', 'Mạng máy tính', 'EASY', 'B', ['400', '401', '403', '404'], '401 Unauthorized; 403 Forbidden.'),
  Q('q08', 'Kỹ thuật nào giúp server xử lý nhiều kết nối đồng thời không chặn?', 'Lập trình Socket', 'HARD', 'A', ['I/O không đồng bộ / non-blocking', 'Chỉ dùng một thread blocking', 'Sleep mỗi request 1 giây', 'Tắt TCP Nagle'], 'Non-blocking / async I/O phục vụ đa kết nối.'),
  Q('q09', 'Trong PostgreSQL, ràng buộc UNIQUE không phân biệt hoa thường thường dùng?', 'Mạng máy tính', 'MEDIUM', 'C', ['CHECK thường', 'TRIGGER BEFORE', 'Unique index trên lower(column)', 'FOREIGN KEY'], 'Partial/expression unique index với lower().'),
  Q('q10', 'Độ phức tạp trung bình tìm kiếm trên bảng băm là?', 'Cấu trúc dữ liệu', 'EASY', 'A', ['O(1)', 'O(n)', 'O(log n)', 'O(n log n)'], 'Hash table tìm kiếm trung bình O(1).'),
]

function member(userId: string, studentId: string, fullName: string, email: string, extra?: Partial<MockRoomMember>): MockRoomMember {
  return { userId, studentId, fullName, email, online: true, answeredCount: 0, currentQuestion: 1, ...extra }
}

export function createSeedRooms(): MockRoom[] {
  const now = Date.now()
  return [
    {
      id: 'room_p102',
      code: 'P102',
      pin: '882194',
      name: 'Thi cuối kỳ 2025-2: IT4549 - Phát triển ứng dụng Web',
      subject: 'IT4549',
      topic: 'Công nghệ PM & Web',
      mode: 'official',
      status: 'in_progress',
      durationMinutes: 45,
      opensAt: new Date(now - 10 * 60_000).toISOString(),
      endsAt: new Date(now + 28 * 60_000).toISOString(),
      teacherName: DEMO_TEACHER.fullName,
      teacherId: DEMO_TEACHER.userId,
      questionCount: 10,
      difficultyConfig: { EASY: 4, MEDIUM: 4, HARD: 2 },
      topics: ['Mạng máy tính', 'Lập trình Socket'],
      options: {
        practiceMode: false,
        showAnswersAfterSubmit: false,
        shuffleQuestions: true,
        lockDevice: true,
      },
      members: [
        member(DEMO_STUDENT.userId, '20235631', DEMO_STUDENT.fullName, DEMO_STUDENT.email, {
          answeredCount: 5,
          currentQuestion: 6,
        }),
        member('u_hs02', '2026_HS02', 'Trần Thị B', 'tranthib@gmail.com', { answeredCount: 18, currentQuestion: 19 }),
        member('u_hs03', 'HS042', 'Trần Thị Mai', 'mai@mooc.edu.vn', { answeredCount: 30, currentQuestion: 30, online: false }),
        member('u_hs04', 'HS018', 'Nguyễn Văn A', 'nguyenvana@gmail.com', { answeredCount: 27, currentQuestion: 28 }),
      ],
      createdAt: new Date(now - 86400_000).toISOString(),
    },
    {
      id: 'room_p103',
      code: 'P103',
      pin: '612903',
      name: 'Thi cuối kỳ 2025-2: IT4549 (Bản sao Clone)',
      subject: 'IT4549',
      topic: 'Công nghệ PM & Web',
      mode: 'official',
      status: 'waiting',
      durationMinutes: 45,
      opensAt: new Date(now + 2 * 3600_000).toISOString(),
      endsAt: null,
      teacherName: DEMO_TEACHER.fullName,
      teacherId: DEMO_TEACHER.userId,
      questionCount: 10,
      difficultyConfig: { EASY: 4, MEDIUM: 4, HARD: 2 },
      topics: ['Mạng máy tính'],
      options: {
        practiceMode: false,
        showAnswersAfterSubmit: false,
        shuffleQuestions: true,
        lockDevice: true,
      },
      members: [
        member(DEMO_STUDENT.userId, '20235631', DEMO_STUDENT.fullName, DEMO_STUDENT.email),
        member('u_hs02', '2026_HS02', 'Trần Thị B', 'tranthib@gmail.com'),
      ],
      createdAt: new Date(now - 3600_000).toISOString(),
    },
    {
      id: 'room_p101',
      code: 'P101',
      pin: '441200',
      name: 'Toán học cơ bản - Ôn luyện thi học kỳ 2',
      subject: 'TOÁN',
      topic: 'Toán nâng cao',
      mode: 'practice',
      status: 'waiting',
      durationMinutes: 30,
      opensAt: new Date(now - 86400_000).toISOString(),
      endsAt: null,
      teacherName: DEMO_TEACHER.fullName,
      teacherId: DEMO_TEACHER.userId,
      questionCount: 8,
      difficultyConfig: { EASY: 3, MEDIUM: 3, HARD: 2 },
      topics: ['Toán nâng cao', 'Cấu trúc dữ liệu'],
      options: {
        practiceMode: true,
        showAnswersAfterSubmit: true,
        shuffleQuestions: false,
        lockDevice: false,
      },
      members: [],
      createdAt: new Date(now - 2 * 86400_000).toISOString(),
    },
    {
      id: 'room_p099',
      code: 'P099',
      pin: '109284',
      name: 'Khảo sát kiến thức đầu năm - Khối 12',
      subject: 'IT4441',
      topic: 'UX / UI',
      mode: 'official',
      status: 'finished',
      durationMinutes: 45,
      opensAt: new Date(now - 4 * 86400_000).toISOString(),
      endsAt: new Date(now - 4 * 86400_000 + 45 * 60_000).toISOString(),
      teacherName: DEMO_TEACHER.fullName,
      teacherId: DEMO_TEACHER.userId,
      questionCount: 10,
      difficultyConfig: { EASY: 4, MEDIUM: 4, HARD: 2 },
      topics: ['Cấu trúc dữ liệu'],
      options: {
        practiceMode: false,
        showAnswersAfterSubmit: true,
        shuffleQuestions: true,
        lockDevice: true,
      },
      members: [
        member(DEMO_STUDENT.userId, '20235631', DEMO_STUDENT.fullName, DEMO_STUDENT.email),
        member('u_hs04', 'HS018', 'Nguyễn Văn A', 'nguyenvana@gmail.com'),
      ],
      createdAt: new Date(now - 5 * 86400_000).toISOString(),
    },
  ]
}

export function createSeedQuestionsByRoom(): Record<string, MockQuestion[]> {
  const bank = SEED_QUESTION_BANK
  return {
    room_p102: bank,
    room_p103: bank,
    room_p101: bank.slice(0, 8),
    room_p099: bank,
  }
}

export function createSeedSubmissions(): MockSubmission[] {
  const answers: Record<string, string> = {}
  SEED_QUESTION_BANK.forEach((q, i) => {
    const correct = q.options.find((o) => o.isCorrect)!
    answers[q.id] = i === 2 ? q.options.find((o) => !o.isCorrect)!.id : correct.id
  })
  return [
    {
      id: 'sub_p099_student',
      roomId: 'room_p099',
      userId: DEMO_STUDENT.userId,
      studentId: '20235631',
      fullName: DEMO_STUDENT.fullName,
      score: 9,
      correctCount: 27,
      wrongCount: 3,
      unansweredCount: 0,
      totalQuestions: 30,
      durationSeconds: 2100,
      submittedAt: new Date(Date.now() - 4 * 86400_000 + 35 * 60_000).toISOString(),
      early: true,
      answers,
      flagged: [],
    },
    {
      id: 'sub_p102_mai',
      roomId: 'room_p102',
      userId: 'u_hs03',
      studentId: 'HS042',
      fullName: 'Trần Thị Mai',
      score: 9.67,
      correctCount: 29,
      wrongCount: 1,
      unansweredCount: 0,
      totalQuestions: 30,
      durationSeconds: 1800,
      submittedAt: new Date(Date.now() - 5 * 60_000).toISOString(),
      early: true,
      answers,
      flagged: [],
    },
  ]
}

export function createSeedLogs(): MockSystemLog[] {
  const t = Date.now()
  return [
    {
      id: 'log1',
      at: new Date(t - 120_000).toISOString(),
      actor: 'HS042 - Trần Thị Mai',
      studentId: 'HS042',
      action: 'NỘP BÀI THÀNH CÔNG',
      detail: 'Nộp sớm hợp lệ - 9.67 điểm',
      level: 'success',
      roomId: 'room_p102',
      ip: '10.0.0.12',
    },
    {
      id: 'log2',
      at: new Date(t - 90_000).toISOString(),
      actor: 'HS018 - Nguyễn Văn A',
      studentId: 'HS018',
      action: 'THOÁT MÀN HÌNH (LẦN 2)',
      detail: 'Rời khỏi cửa sổ thi 15 giây (Mở tab khác) - Cảnh báo lần 2',
      level: 'danger',
      roomId: 'room_p102',
      ip: '10.0.0.18',
    },
    {
      id: 'log3',
      at: new Date(t - 60_000).toISOString(),
      actor: 'HS099',
      studentId: 'HS099',
      action: 'MẤT TÍN HIỆU INTERNET',
      detail: 'Mất mạng tạm thời 30 giây',
      level: 'warning',
      roomId: 'room_p102',
      ip: '10.0.0.99',
    },
    {
      id: 'log4',
      at: new Date(t - 30_000).toISOString(),
      actor: 'HS099',
      studentId: 'HS099',
      action: 'PHỤC HỒI KẾT NỐI MẠNG',
      detail: 'Online trở lại sau 30 giây',
      level: 'info',
      roomId: 'room_p102',
      ip: '10.0.0.99',
    },
    {
      id: 'log5',
      at: new Date(t - 10 * 60_000).toISOString(),
      actor: DEMO_TEACHER.fullName,
      action: 'BẮT ĐẦU PHÒNG THI',
      detail: 'Phòng P102 chuyển sang trạng thái Đang thi',
      level: 'info',
      roomId: 'room_p102',
      ip: '10.0.0.2',
    },
  ]
}

export function createSeedPracticeHistory(): MockPracticeAttempt[] {
  return [
    {
      id: 'prac1',
      topic: 'Mạng máy tính',
      difficulty: 'EASY',
      score: 8.5,
      correctCount: 17,
      totalQuestions: 20,
      submittedAt: new Date(Date.now() - 2 * 86400_000).toISOString(),
    },
    {
      id: 'prac2',
      topic: 'Lập trình Socket',
      difficulty: 'MEDIUM',
      score: 7.0,
      correctCount: 14,
      totalQuestions: 20,
      submittedAt: new Date(Date.now() - 86400_000).toISOString(),
    },
    {
      id: 'prac3',
      topic: 'Hệ phân tán',
      difficulty: 'HARD',
      score: 6.5,
      correctCount: 13,
      totalQuestions: 20,
      submittedAt: new Date(Date.now() - 3600_000).toISOString(),
    },
  ]
}

export function generatePin(): string {
  return String(Math.floor(100000 + Math.random() * 900000))
}

export function generateRoomCode(existing: string[]): string {
  let n = 100 + existing.length
  let code = `P${n}`
  while (existing.includes(code)) {
    n += 1
    code = `P${n}`
  }
  return code
}
