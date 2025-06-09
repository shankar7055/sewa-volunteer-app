import type React from "react"
import { Link, Navigate, Route, Routes, useLocation } from "react-router-dom"

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
      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
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

// Simple inline page components
function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Real-time volunteer attendance overview</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="text-gray-600">Total Volunteers</div>
          <div className="text-3xl font-bold mt-2 text-gray-900">25</div>
          <div className="text-sm text-gray-500">Registered sewadars</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="text-gray-600">Present Today</div>
          <div className="text-3xl font-bold mt-2 text-green-600">18</div>
          <div className="text-sm text-gray-500">Checked in</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="text-gray-600">Absent</div>
          <div className="text-3xl font-bold mt-2 text-red-600">7</div>
          <div className="text-sm text-gray-500">Not checked in</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="text-gray-600">Attendance Rate</div>
          <div className="text-3xl font-bold mt-2 text-blue-600">72%</div>
          <div className="text-sm text-gray-500">Overall attendance</div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow border">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Recent Check-ins</h2>
          <p className="text-gray-600">Latest volunteer arrivals</p>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div>
                  <div className="font-medium text-gray-900">Rajesh Kumar</div>
                  <div className="text-sm text-gray-600">01-001 • Function Incharge</div>
                </div>
              </div>
              <div className="text-sm text-gray-500">09:15 AM</div>
            </div>
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div>
                  <div className="font-medium text-gray-900">Priya Sharma</div>
                  <div className="text-sm text-gray-600">02-001 • Back Office</div>
                </div>
              </div>
              <div className="text-sm text-gray-500">09:30 AM</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function VolunteersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Volunteers</h1>
        <p className="text-gray-600">Manage volunteer information and activities</p>
      </div>
      <div className="bg-white rounded-lg shadow border">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Volunteer List</h2>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left p-4 font-medium text-gray-900">Sewa Code</th>
                  <th className="text-left p-4 font-medium text-gray-900">Name</th>
                  <th className="text-left p-4 font-medium text-gray-900">Phone</th>
                  <th className="text-left p-4 font-medium text-gray-900">Sewa Area</th>
                  <th className="text-left p-4 font-medium text-gray-900">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="p-4">
                    <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">01-001</span>
                  </td>
                  <td className="p-4 font-medium text-gray-900">Rajesh Kumar</td>
                  <td className="p-4 text-gray-600">+91 9876543210</td>
                  <td className="p-4">
                    <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">01 - Function Incharge</span>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center space-x-1 text-sm px-2 py-1 rounded bg-green-100 text-green-800">
                      <span>Present</span>
                    </span>
                  </td>
                </tr>
                <tr className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="p-4">
                    <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">02-001</span>
                  </td>
                  <td className="p-4 font-medium text-gray-900">Priya Sharma</td>
                  <td className="p-4 text-gray-600">+91 9876543211</td>
                  <td className="p-4">
                    <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">02 - Back Office</span>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center space-x-1 text-sm px-2 py-1 rounded bg-green-100 text-green-800">
                      <span>Present</span>
                    </span>
                  </td>
                </tr>
                <tr className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="p-4">
                    <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">03-001</span>
                  </td>
                  <td className="p-4 font-medium text-gray-900">Amit Singh</td>
                  <td className="p-4 text-gray-600">+91 9876543212</td>
                  <td className="p-4">
                    <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">03 - Line Management</span>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center space-x-1 text-sm px-2 py-1 rounded bg-red-100 text-red-800">
                      <span>Absent</span>
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

function QRScannerPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">QR Scanner</h1>
        <p className="text-gray-600">Scan QR codes for volunteer check-in/check-out</p>
      </div>

      <div className="bg-white rounded-lg shadow border">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">QR Code Scanner</h2>
        </div>
        <div className="p-8 text-center">
          <div className="w-64 h-64 mx-auto bg-gray-100 rounded-lg flex items-center justify-center mb-4">
            <div className="text-gray-400">
              <QrCodeIcon />
              <div className="mt-2 text-sm">Camera Preview</div>
            </div>
          </div>
          <h3 className="text-lg font-semibold mb-2 text-gray-900">Manual Entry</h3>
          <p className="text-gray-600 mb-4">QR scanning functionality will be implemented here</p>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Enter Sewa Code manually (e.g., 01-001)"
              className="w-full max-w-md mx-auto px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Check In</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">SEWA Volunteer Login</h2>
          <p className="mt-2 text-center text-sm text-gray-600">Sign in to access the volunteer management system</p>
        </div>
        <form className="mt-8 space-y-6">
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input
                type="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
            </div>
            <div>
              <input
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  // For development, let's bypass authentication temporarily
  return <Layout>{children}</Layout>
}

function App() {
  console.log("App component is rendering")

  return (
    <div className="app">
      <Routes>
        {/* Auth routes */}
        <Route path="/login" element={<LoginPage />} />

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
          path="/qr"
          element={
            <ProtectedRoute>
              <QRScannerPage />
            </ProtectedRoute>
          }
        />

        {/* Redirect any other routes to dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default App
