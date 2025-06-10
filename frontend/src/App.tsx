import type React from "react"
import { Link, Navigate, Route, Routes, useLocation } from "react-router-dom"
import { Toaster } from "./components/ui/toaster"
import { useAuthStore } from "./lib/store"

// Simple inline utility function
function cn(...classes: (string | undefined | null | boolean)[]): string {
  return classes.filter(Boolean).join(" ")
}

// Simple inline icons
const HomeIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
    />
  </svg>
)

const UsersIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
    />
  </svg>
)

const QrCodeIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
    />
  </svg>
)

const BellIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 17h5l-5 5v-5zM4.868 19.462A17.173 17.173 0 0012 16.5c2.779 0 5.4.726 7.632 1.962M6.34 6.66A6.001 6.001 0 0118 12v3"
    />
  </svg>
)

const SettingsIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c-.94 1.543.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
    />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

// Simple inline Layout component
function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation()

  const navigation = [
    { name: "Dashboard", href: "/", icon: HomeIcon },
    { name: "Volunteers", href: "/volunteers", icon: UsersIcon },
    { name: "QR Scanner", href: "/qr", icon: QrCodeIcon },
  ]

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900">SEWA Volunteer</h2>
        </div>
        <nav className="px-4 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.href
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  isActive ? "bg-blue-600 text-white" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100",
                )}
              >
                <Icon />
                <span className="ml-3">{item.name}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="border-b border-gray-200 bg-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">SEWA Volunteer Management</h1>
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-2 hover:bg-gray-100 rounded-md text-gray-600">
                <BellIcon />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-md text-gray-600">
                <SettingsIcon />
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  )
}

// Import existing pages
import DashboardPage from "./pages/dashboard"
import LoginPage from "./pages/login"
import QRScanner from "./pages/scan-qr"
import VolunteersPage from "./pages/volunteer"
import VolunteerCreatePage from "./pages/volunteer-create"
import VolunteerDetailPage from "./pages/volunteer-detail"

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore()

  // Enable authentication check
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <Layout>{children}</Layout>
}

function App() {
  console.log("App component is rendering")
  const { isAuthenticated } = useAuthStore()

  return (
    <div className="app">
      <Routes>
        {/* Auth routes - redirect to dashboard if already logged in */}
        <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />} />

        {/* Protected routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/volunteers"
          element={
            <ProtectedRoute>
              <VolunteersPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/volunteers/new"
          element={
            <ProtectedRoute>
              <VolunteerCreatePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/volunteers/:id"
          element={
            <ProtectedRoute>
              <VolunteerDetailPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/qr"
          element={
            <ProtectedRoute>
              <QRScanner />
            </ProtectedRoute>
          }
        />

        {/* Redirect any other routes based on auth status */}
        <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />} />
      </Routes>

      <Toaster />
    </div>
  )
}

export default App
