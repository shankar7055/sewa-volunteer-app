"use client"

import { Home, LogOut, QrCode, Users } from "lucide-react"
import type React from "react"
import { Link, Navigate, Route, Routes, useLocation } from "react-router-dom"
import { Toaster } from "./components/ui/toaster"
import { useAuthStore } from "./lib/store"

// Simple inline utility function
function cn(...classes: (string | undefined | null | boolean)[]): string {
  return classes.filter(Boolean).join(" ")
}

// Simple inline Layout component
function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const { logout, user, isAuthenticated } = useAuthStore()

  // Debug logging
  console.log("🔍 Layout Debug - Auth State:", {
    isAuthenticated,
    user: user ? { name: user.name, email: user.email } : null,
  })

  const navigation = [
    { name: "Dashboard", href: "/", icon: Home },
    { name: "Volunteers", href: "/volunteers", icon: Users },
    { name: "Scanner", href: "/scanner", icon: QrCode },
    { name: "QR Codes", href: "/qrcodes", icon: QrCode },
    
  ]

  const handleLogout = () => {
    console.log("🚪 Logout clicked")
    logout()
    window.location.href = "/login" // Force page reload to login
  }

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
            const isActive =
              location.pathname === item.href || (item.href !== "/" && location.pathname.startsWith(item.href))
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  isActive ? "bg-blue-600 text-white" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100",
                )}
              >
                <Icon className="h-4 w-4 mr-3" />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>

        {/* Logout Button in Sidebar */}
        <div className="absolute bottom-4 left-4 right-4">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2 text-sm font-medium text-red-600 hover:text-red-900 hover:bg-red-50 rounded-md transition-colors"
          >
            <LogOut className="h-4 w-4 mr-3" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="border-b border-gray-200 bg-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">SEWA Volunteer Management</h1>
              {/* Debug info in header */}
              <p className="text-xs text-gray-500">
                User: {user?.name || "Not logged in"} | Auth: {isAuthenticated ? "✅" : "❌"}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleLogout}
                className="flex items-center px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-md"
              >
                <LogOut className="h-4 w-4 mr-1" />
                <span>Logout</span>
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
import SimpleVolunteerUpload from "./pages/volunteer-upload-simple"

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore()

  console.log("🛡️ ProtectedRoute - isAuthenticated:", isAuthenticated)

  // Enable authentication check
  if (!isAuthenticated) {
    console.log("🚫 Not authenticated, redirecting to login")
    return <Navigate to="/login" replace />
  }

  return <Layout>{children}</Layout>
}

function App() {
  console.log("App component is rendering")
  const { isAuthenticated } = useAuthStore()

  console.log("🏠 App - isAuthenticated:", isAuthenticated)

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
          path="/overview"
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
          path="/scanner"
          element={
            <ProtectedRoute>
              <QRScanner />
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

        <Route
          path="/upload"
          element={
            <ProtectedRoute>
              <SimpleVolunteerUpload />
            </ProtectedRoute>
          }
        />

        <Route
          path="/qrcodes"
          element={
            <ProtectedRoute>
              <QRScanner />
            </ProtectedRoute>
          }
        />

        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <DashboardPage />
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
