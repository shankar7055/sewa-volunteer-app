"use client"

import { CheckCircle, Clock, Download, TrendingUp, UserCheck, Users, UserX } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"

import { useToast } from "../components/ui/use-toast"
import { dashboardApi, volunteersApi } from "../lib/api"
import { useAuthStore } from "../lib/store"

// Import the tab components
import QRCodesTab from "../components/dashboard/qr-codes-tab"
import ScannerTab from "../components/dashboard/scanner-tab"
import UploadTab from "../components/dashboard/upload-tab"
import VolunteersTab from "../components/dashboard/volunteers-tab"

// Define types locally for now since the types file has issues
type SewaAreaCode = "01" | "02" | "03" | "04" | "05" | "06" | "07"

interface Volunteer {
  id: string
  name: string
  email: string
  phone: string
  sewaCode: string
  sewaArea: SewaAreaCode
  status: "active" | "inactive" | "pending"
  createdAt: string
  isPresent?: boolean
}

interface DashboardStats {
  totalVolunteers: number
  presentVolunteers: number
  absentVolunteers: number
  attendanceRate: number
}

const SEWA_AREAS: Record<SewaAreaCode, string> = {
  "01": "Function Incharge",
  "02": "Back Office",
  "03": "Line Management",
  "04": "Jal Prashad",
  "05": "Bin Bag",
  "06": "Langar Prashad",
  "07": "Langar Refilling",
}

// Update the sewaAreaStats type
const sewaAreaStats: Record<SewaAreaCode, { present: number; total: number }> = {
  "01": { present: 1, total: 2 },
  "02": { present: 1, total: 1 },
  "03": { present: 1, total: 1 },
  "04": { present: 0, total: 1 },
  "05": { present: 0, total: 0 },
  "06": { present: 0, total: 0 },
  "07": { present: 0, total: 0 },
}

// Update the FIXED_RECENT_CHECKINS type
const FIXED_RECENT_CHECKINS: Array<{
  id: number
  name: string
  sewaCode: string
  sewaArea: SewaAreaCode
  checkInTime: string
}> = [
  {
    id: 1,
    name: "Rajesh Kumar",
    sewaCode: "01-001",
    sewaArea: "01",
    checkInTime: "09:15 AM",
  },
  {
    id: 2,
    name: "Priya Sharma",
    sewaCode: "02-001",
    sewaArea: "02",
    checkInTime: "09:30 AM",
  },
  {
    id: 3,
    name: "Sunita Patel",
    sewaCode: "03-001",
    sewaArea: "03",
    checkInTime: "09:45 AM",
  },
]

export default function DashboardPage() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [activeTab, setActiveTab] = useState("overview")
  const [stats, setStats] = useState<DashboardStats>({
    totalVolunteers: 0,
    presentVolunteers: 0,
    absentVolunteers: 0,
    attendanceRate: 0,
  })
  const [volunteers, setVolunteers] = useState<Volunteer[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const navigate = useNavigate()
  const { toast } = useToast()
  const { user, logout } = useAuthStore()

  // Update current time every minute instead of every second to reduce re-renders
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000) // Update every minute

    return () => clearInterval(timer)
  }, [])

  // Load dashboard data only once
  useEffect(() => {
    let isMounted = true

    const loadDashboardData = async () => {
      try {
        setIsLoading(true)

        // Load volunteers and stats
        const [volunteersData, statsData] = await Promise.all([volunteersApi.getAll(), dashboardApi.getStats()])

        if (isMounted) {
          setVolunteers(volunteersData)
          setStats(statsData)
        }
      } catch (error) {
        if (isMounted) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load dashboard data",
          })
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadDashboardData()

    return () => {
      isMounted = false
    }
  }, [toast])

  // Memoize sewa areas grid to prevent recalculation
  const sewaAreasGrid = useMemo(() => {
    return (Object.entries(SEWA_AREAS) as [SewaAreaCode, string][]).map(([areaCode, areaName]) => {
      const areaData = sewaAreaStats[areaCode] || { present: 0, total: 0 }
      const percentage = areaData.total > 0 ? (areaData.present / areaData.total) * 100 : 0

      return (
        <div key={areaCode} className="p-4 border rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <div className="font-medium">{areaName}</div>
            <div className="text-sm text-gray-500">{areaCode}</div>
          </div>
          <div className="text-sm text-gray-600 mb-2">
            <span>
              Present: <span className="font-semibold text-green-600">{areaData.present}</span>
            </span>
            <span className="ml-4">
              Total: <strong>{areaData.total}</strong>
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
          </div>
        </div>
      )
    })
  }, []) // Empty dependency array since SEWA_AREAS never changes

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const handleExport = () => {
    // Export functionality
    const csvContent = [
      ["Sewa Code", "Name", "Phone", "Sewa Area", "Status", "Check-in Time"],
      ...volunteers.map((v: Volunteer) => [
        v.sewaCode,
        v.name,
        v.phone,
        v.sewaArea,
        v.isPresent ? "Present" : "Absent",
        v.isPresent ? "09:15 AM" : "N/A",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `volunteer-attendance-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "scanner", label: "Scanner" },
    { id: "upload", label: "Upload" },
    { id: "qr-codes", label: "QR Codes" },
    { id: "volunteers", label: "Volunteers" },
  ]

  return (
    <div className="space-y-6">
      {/* Top Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Real-time volunteer attendance overview</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm text-gray-500">Current Time</p>
            <span className="font-mono text-lg">
              {currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
          <button
            onClick={handleExport}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            <Download className="w-4 h-4" />
            <span>Export Data</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Total Volunteers</span>
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-3xl font-bold mt-2">{stats.totalVolunteers}</div>
          <div className="text-sm text-gray-500">Registered sewadars</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Present Today</span>
            <UserCheck className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-3xl font-bold mt-2 text-green-600">{stats.presentVolunteers}</div>
          <div className="text-sm text-gray-500">Checked in</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Absent</span>
            <UserX className="w-5 h-5 text-red-600" />
          </div>
          <div className="text-3xl font-bold mt-2 text-red-600">{stats.absentVolunteers}</div>
          <div className="text-sm text-gray-500">Not checked in</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Attendance Rate</span>
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-3xl font-bold mt-2 text-blue-600">{stats.attendanceRate}%</div>
          <div className="text-sm text-gray-500">Overall attendance</div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Sewa Areas Overview */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Sewa Areas Overview</h2>
                <p className="text-gray-600 mb-6">Volunteer distribution across different service areas</p>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">{sewaAreasGrid}</div>
              </div>

              {/* Recent Check-ins */}
              <div>
                <h2 className="text-xl font-semibold flex items-center mb-4">
                  <Clock className="w-5 h-5 mr-2" /> Recent Check-ins
                </h2>
                <p className="text-gray-600 mb-6">Latest volunteer arrivals</p>
                <div className="space-y-4">
                  {FIXED_RECENT_CHECKINS.map((checkin) => (
                    <div key={checkin.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <div>
                          <div className="font-medium">{checkin.name}</div>
                          <div className="text-sm text-gray-600">
                            {checkin.sewaCode} • {SEWA_AREAS[checkin.sewaArea]}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">{checkin.checkInTime}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "scanner" && <ScannerTab volunteers={volunteers} sewaAreas={SEWA_AREAS} />}

          {activeTab === "upload" && <UploadTab sewaAreas={SEWA_AREAS} />}

          {activeTab === "qr-codes" && <QRCodesTab volunteers={volunteers} sewaAreas={SEWA_AREAS} />}

          {activeTab === "volunteers" && <VolunteersTab volunteers={volunteers} sewaAreas={SEWA_AREAS} />}
        </div>
      </div>
    </div>
  )
}
