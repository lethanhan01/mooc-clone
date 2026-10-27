import {
  LayoutDashboard,
  BookOpen,
  BarChart2,
  Sparkles,
  Settings,
  DoorOpen,
  ScrollText,
  LineChart,
  UserCircle,
} from 'lucide-react'
import type { NavSection } from './sidebar.types'
import type { Role } from '@/stores/authStore'

export function getMoocNavSections(roles: Role[] = ['student']): NavSection[] {
  const isTeacher = roles.includes('teacher')

  if (isTeacher) {
    return [
      {
        label: 'Giáo viên',
        items: [
          {
            label: 'Tổng quan',
            to: '/teacher/dashboard',
            icon: <LayoutDashboard size={16} />,
          },
          {
            label: 'Quản lý phòng thi',
            to: '/teacher/rooms',
            icon: <DoorOpen size={16} />,
          },
          {
            label: 'Báo cáo thống kê',
            to: '/teacher/reports',
            icon: <BarChart2 size={16} />,
          },
          {
            label: 'Nhật ký hệ thống',
            to: '/teacher/logs',
            icon: <ScrollText size={16} />,
          },
        ],
      },
      {
        label: 'Tài khoản',
        items: [
          {
            label: 'Hồ sơ & Bảo mật',
            to: '/profile',
            icon: <UserCircle size={16} />,
          },
          {
            label: 'UI Showcase',
            to: '/showcase',
            icon: <Sparkles size={16} />,
          },
          {
            label: 'Cài đặt',
            to: '/settings',
            icon: <Settings size={16} />,
          },
        ],
      },
    ]
  }

  return [
    {
      label: 'Học sinh',
      items: [
        {
          label: 'Trang chủ',
          to: '/student/dashboard',
          icon: <LayoutDashboard size={16} />,
        },
        {
          label: 'Phòng thi của bạn',
          to: '/student/rooms',
          icon: <DoorOpen size={16} />,
        },
        {
          label: 'Luyện tập',
          to: '/student/practice',
          icon: <BookOpen size={16} />,
        },
        {
          label: 'Lịch sử & Biểu đồ',
          to: '/student/history',
          icon: <LineChart size={16} />,
        },
      ],
    },
    {
      label: 'Tài khoản',
      items: [
        {
          label: 'Hồ sơ & Bảo mật',
          to: '/profile',
          icon: <UserCircle size={16} />,
        },
        {
          label: 'UI Showcase',
          to: '/showcase',
          icon: <Sparkles size={16} />,
        },
        {
          label: 'Cài đặt',
          to: '/settings',
          icon: <Settings size={16} />,
        },
      ],
    },
  ]
}

/** @deprecated dùng getMoocNavSections(roles) */
export function getSQBNavSections(): NavSection[] {
  return getMoocNavSections(['student'])
}

export function getNavSectionsForRoles(roles: Role[]): NavSection[] {
  return getMoocNavSections(roles)
}
