"use client"

import { useNavigate } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { volunteerStorage } from "../lib/volunteer-storage"

export default function DashboardPage() {
  const navigate = useNavigate()

  // Get basic stats
  const volunteers = volunteerStorage.getAll()
  const stats = {
    total: volunteers.length,
    present: volunteers.filter((v) => v.isPresent).length,
    absent: volunteers.filter((v) => !v.isPresent).length,
    attendanceRate:
      volunteers.length > 0 ? Math.round((volunteers.filter((v) => v.isPresent).length / volunteers.length) * 100) : 0,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome to SEWA Volunteer Management System</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Volunteers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Registered volunteers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Present Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.present}</div>
            <p className="text-xs text-muted-foreground">Currently present</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Absent Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.absent}</div>
            <p className="text-xs text-muted-foreground">Not present</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.attendanceRate}%</div>
            <p className="text-xs text-muted-foreground">Overall attendance</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button onClick={() => navigate("/management")} className="flex-1">
              Go to Management Panel
            </Button>
            <Button variant="outline" onClick={() => window.location.reload()} className="flex-1">
              Refresh Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">Database Status:</span>
              <span className="text-sm text-green-600">✅ Active</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Last Update:</span>
              <span className="text-sm text-gray-600">{new Date().toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Storage:</span>
              <span className="text-sm text-blue-600">LocalStorage</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
