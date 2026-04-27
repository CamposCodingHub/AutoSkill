import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import UserOnlyRoute from './components/UserOnlyRoute'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import SettingsPage from './pages/SettingsPage'
import ModulePage from './pages/ModulePage'
import LessonPage from './pages/LessonPage'
import PublicProfilePage from './pages/PublicProfilePage'
import SyncToast from './components/SyncToast'
import { SkeletonModule } from './components/Skeleton'

// Code splitting para páginas pesadas
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'))
const AdvancedAnalyticsPage = lazy(() => import('./pages/AdvancedAnalyticsPage'))
const CertificationsPage = lazy(() => import('./pages/CertificationsPage'))

function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <SyncToast />
      <Suspense fallback={<SkeletonModule />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <UserOnlyRoute>
                <SettingsPage />
              </UserOnlyRoute>
            </ProtectedRoute>
          } />
          <Route path="/admin" element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } />
          <Route path="/admin/analytics" element={
            <AdminRoute>
              <AdvancedAnalyticsPage />
            </AdminRoute>
          } />
          <Route path="/profile/:userId" element={
            <ProtectedRoute>
              <PublicProfilePage />
            </ProtectedRoute>
          } />
          <Route path="/modulo/:moduleId" element={
            <ProtectedRoute>
              <ModulePage />
            </ProtectedRoute>
          } />
          <Route path="/modulo/:moduleId/aula/:lessonId" element={
            <ProtectedRoute>
              <LessonPage />
            </ProtectedRoute>
          } />
          <Route path="/certificacoes" element={
            <ProtectedRoute>
              <UserOnlyRoute>
                <CertificationsPage />
              </UserOnlyRoute>
            </ProtectedRoute>
          } />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App