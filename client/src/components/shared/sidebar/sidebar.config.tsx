import {
  LayoutDashboard,
  BookOpen,
  HelpCircle,
  BarChart2,
  Sparkles,
  Settings,
} from 'lucide-react'
import type { NavSection } from './sidebar.types'

export function getMoocNavSections(): NavSection[] {
  return [
    {
      label: 'Thi trực tuyến',
      items: [
        {
          label: 'Phòng thi trực tuyến',
          to: '/dashboard',
          icon: <LayoutDashboard size={20} />,
        },
        {
          label: 'Chế độ luyện tập',
          to: '/practice',
          icon: <BookOpen size={20} />,
        },
        {
          label: 'Ngân hàng câu hỏi',
          to: '/questions',
          icon: <HelpCircle size={20} />,
        },
        {
          label: 'Lịch sử & Thống kê',
          to: '/history',
          icon: <BarChart2 size={20} />,
        },
      ],
    },
    {
      label: 'Công cụ & Phát triển',
      items: [
        {
          label: 'UI Design Showcase',
          to: '/showcase',
          icon: <Sparkles size={20} />,
        },
        {
          label: 'Cài đặt tài khoản',
          to: '/settings',
          icon: <Settings size={20} />,
        },
      ],
    },
  ]
}

export const getSQBNavSections = getMoocNavSections
