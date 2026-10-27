import { lazy } from 'react'
import { Route } from 'react-router-dom'

const ProfilePage = lazy(() => import('@/pages/profile/ProfilePage'))

export const profileRoutes = (
  <>
    <Route path="/profile" element={<ProfilePage />} />
    <Route path="/settings" element={<ProfilePage />} />
  </>
)
