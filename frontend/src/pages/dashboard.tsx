"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Download, LogOut, Users, UserCheck, UserX, TrendingUp, Clock, CheckCircle } from "lucide-react"

import { useToast } from "@/components/ui/use-toast"
import { useAuthStore } from "@/lib/store"
import { volunteersApi, dashboardApi } from "@/lib/api"

// Import tab components
import VolunteersTab from "@/components/dashboard/volunteers-tab"
import UploadTab from "@/components/dashboard/upload-tab"
import QRCodesTab from "@/components/dashboard/qr-codes-tab"
import ScannerTab from "@/components/dashboard/scanner-tab"

// Mock data for demonstration
const SEWA_AREAS = {
  "01": "Function Incharge",
  "02": "Back Office",
  "03": "Line Management",
  "04": "Jal Prashad",
  "05": "Bin Bag",
  "06": "Langar Prashad",
  "07": "Langar Refilling",
}

export default function DashboardPage() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [activeTab, setActiveTab] = useState("volunteers")
  const [stats, setStats] = useState({
    totalVolunteers: 0,
    presentVolunteers: 0,
    absentVolunteers: 0,
    attendanceRate: 0,
  })
  const [volunteers, setVolunteers] = useState([])
  const [recentCheckIns, setRecentCheckIns] = useState([])

  const navigate = useNavigate()
  const { toast } = useToast()
  const { user, logout } = useAuthStore()

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Load dashboard data
  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      // Load volunteers and stats
      const [volunteersData, statsData] = await Promise.all([volunteersApi.getAll(), dashboardApi.getStats()])

      setVolunteers(volunteersData)
      setStats(statsData)

      // Mock recent check-ins for demo
      setRecentCheckIns([
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
      ])
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load dashboard data",
      })
    }
  }

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const handleExport = () => {
    // Export functionality
    const csvContent = [
      ["Sewa Code", "Name", "Phone", "Sewa Area", "Status", "Check-in Time"],
      // Add volunteer data here
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

  const renderSewaAreasGrid = () => {
    return Object.entries(SEWA_AREAS).map(([areaCode, areaName]) => {
      // Mock data for demo
      const presentCount = Math.floor(Math.random() * 10)
      const totalCount = Math.floor(Math.random() * 15) + presentCount
      const percentage = totalCount > 0 ? (presentCount / totalCount) * 100 : 0

      return (
        <div key={areaCode} className="sewa-area-card">
          <div className="area-header">
            <div className="area-name">{areaName}</div>
            <div className="area-code">{areaCode}</div>
          </div>
          <div className="area-stats">
            <span>
              Present: <span className="area-present">{presentCount}</span>
            </span>
            <span>
              Total: <strong>{totalCount}</strong>
            </span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${percentage}%` }}></div>
          </div>
        </div>
      )
    })
  }

  return (
    <div className="dashboard-page">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <h1>Volunteer Management Dashboard</h1>
            <p>Real-time attendance tracking system</p>
          </div>
          <div className="header-right">
            <div className="current-time">
              <p>Current Time</p>
              <span>{currentTime.toLocaleTimeString()}</span>
            </div>
            <button onClick={handleExport} className="export-btn">
              <Download className="w-4 h-4" />
              Export Data
            </button>
            <button onClick={handleLogout} className="logout-btn">
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Statistics Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-header">
              <span>Total Volunteers</span>
              <Users className="w-5 h-5" />
            </div>
            <div className="stat-value">{stats.totalVolunteers}</div>
            <div className="stat-label">Registered sewadars</div>
          </div>

          <div className="stat-card present">
            <div className="stat-header">
              <span>Present Today</span>
              <UserCheck className="w-5 h-5" />
            </div>
            <div className="stat-value">{stats.presentVolunteers}</div>
            <div className="stat-label">Checked in</div>
          </div>

          <div className="stat-card absent">
            <div className="stat-header">
              <span>Absent</span>
              <UserX className="w-5 h-5" />
            </div>
            <div className="stat-value">{stats.absentVolunteers}</div>
            <div className="stat-label">Not checked in</div>
          </div>

          <div className="stat-card rate">
            <div className="stat-header">
              <span>Attendance Rate</span>
              <TrendingUp className="w-5 h-5" />
            </div>
            <div className="stat-value">{stats.attendanceRate}%</div>
            <div className="stat-label">Overall attendance</div>
          </div>
        </div>

        {/* Sewa Areas Overview */}
        <div className="card">
          <div className="card-header">
            <h2>Sewa Areas Overview</h2>
            <p>Volunteer distribution across different service areas</p>
          </div>
          <div className="card-content">
            <div className="sewa-areas-grid">{renderSewaAreasGrid()}</div>
          </div>
        </div>

        {/* Recent Check-ins */}
        <div className="card">
          <div className="card-header">
            <h2>
              <Clock className="w-5 h-5" /> Recent Check-ins
            </h2>
            <p>Latest volunteer arrivals</p>
          </div>
          <div className="card-content">
            <div className="recent-checkins">
              {recentCheckIns.length > 0 ? (
                recentCheckIns.map((checkin) => (
                  <div key={checkin.id} className="checkin-item">
                    <div className="checkin-info">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <div>
                        <div className="volunteer-name">{checkin.name}</div>
                        <div className="volunteer-details">
                          {checkin.sewaCode} • {SEWA_AREAS[checkin.sewaArea]}
                        </div>
                      </div>
                    </div>
                    <div className="checkin-time">{checkin.checkInTime}</div>
                  </div>
                ))
              ) : (
                <p className="text-center" style={{ color: "#64748b", padding: "2rem" }}>
                  No check-ins yet today
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="tabs">
          <div className="tab-list">
            <button
              className={`tab-btn ${activeTab === "volunteers" ? "active" : ""}`}
              onClick={() => setActiveTab("volunteers")}
            >
              Volunteers
            </button>
            <button
              className={`tab-btn ${activeTab === "upload" ? "active" : ""}`}
              onClick={() => setActiveTab("upload")}
            >
              Upload
            </button>
            <button
              className={`tab-btn ${activeTab === "qr-codes" ? "active" : ""}`}
              onClick={() => setActiveTab("qr-codes")}
            >
              QR Codes
            </button>
            <button
              className={`tab-btn ${activeTab === "scanner" ? "active" : ""}`}
              onClick={() => setActiveTab("scanner")}
            >
              Scanner
            </button>
          </div>

          {/* Tab Content */}
          <div className={`tab-content ${activeTab === "volunteers" ? "active" : ""}`}>
            {activeTab === "volunteers" && <VolunteersTab volunteers={volunteers} sewaAreas={SEWA_AREAS} />}
          </div>

          <div className={`tab-content ${activeTab === "upload" ? "active" : ""}`}>
            {activeTab === "upload" && <UploadTab sewaAreas={SEWA_AREAS} />}
          </div>

          <div className={`tab-content ${activeTab === "qr-codes" ? "active" : ""}`}>
            {activeTab === "qr-codes" && <QRCodesTab volunteers={volunteers} sewaAreas={SEWA_AREAS} />}
          </div>

          <div className={`tab-content ${activeTab === "scanner" ? "active" : ""}`}>
            {activeTab === "scanner" && <ScannerTab volunteers={volunteers} sewaAreas={SEWA_AREAS} />}
          </div>
        </div>
      </main>
    </div>
  )
}
