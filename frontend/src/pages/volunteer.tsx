"use client"

import { Plus, RefreshCw, Search, Trash2, Upload } from "lucide-react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { volunteersApi } from "../lib/api"
import { useVolunteersStore } from "../lib/store"
import { volunteerStorage } from "../lib/volunteer-storage"

export default function VolunteerPage() {
  const navigate = useNavigate()
  const { volunteers, setVolunteers } = useVolunteersStore()
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  // Load volunteers on component mount
  useEffect(() => {
    loadVolunteers()
  }, [])

  const loadVolunteers = async () => {
    setIsLoading(true)
    try {
      console.log("🔄 Loading volunteers from API...")
      const data = await volunteersApi.getAll()
      console.log(`📋 Loaded ${data.length} volunteers from API`)
      console.log(
        "📋 Volunteer names:",
        data.map((v) => v.name),
      )
      setVolunteers(data)
    } catch (error) {
      console.error("❌ Error loading volunteers:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Debug function to check API state
  const debugAPI = async () => {
    try {
      const debug = await (volunteersApi as any).debug()
      console.log("🔍 API Debug:", debug)

      // Also check global storage directly
      const directCount = volunteerStorage.getCount()
      const directVolunteers = volunteerStorage.getAll()
      console.log("🔍 Direct Storage Check:", {
        count: directCount,
        volunteers: directVolunteers.map((v) => v.name),
      })
    } catch (error) {
      console.error("Debug error:", error)
    }
  }

  // Clear all volunteers (for testing)
  const clearAllVolunteers = () => {
    if (confirm("Are you sure you want to clear all volunteers? This will reset to the original 5.")) {
      volunteerStorage.clear()
      // Re-initialize with original data
      window.location.reload()
    }
  }

  // Filter volunteers based on search query
  const filteredVolunteers = volunteers.filter(
    (volunteer) =>
      volunteer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      volunteer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      volunteer.sewaCode.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <>
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Volunteers</h1>
            <p className="text-muted-foreground">Manage volunteer information and activities</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => navigate("/upload")}>
              <Upload className="mr-2 h-4 w-4" />
              Upload Excel
            </Button>
            <Button onClick={() => navigate("/volunteers/new")}>
              <Plus className="mr-2 h-4 w-4" />
              Add Volunteer
            </Button>
          </div>
        </div>

        {/* Search and Controls */}
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search volunteers..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon" onClick={loadVolunteers} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
          <Button variant="outline" size="sm" onClick={debugAPI}>
            Debug API
          </Button>
          <Button variant="outline" size="sm" onClick={clearAllVolunteers}>
            <Trash2 className="mr-2 h-4 w-4" />
            Clear All
          </Button>
        </div>

        {/* Volunteers List */}
        <Card>
          <CardHeader>
            <CardTitle>
              All Volunteers{" "}
              <span className="text-sm font-normal text-muted-foreground">
                ({filteredVolunteers.length} of {volunteers.length})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {volunteers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-muted-foreground">No volunteers found</p>
                <p className="text-sm text-muted-foreground">Add volunteers manually or upload via Excel</p>
              </div>
            ) : filteredVolunteers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-muted-foreground">No volunteers match your search</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2 font-medium">Name</th>
                      <th className="text-left p-2 font-medium">Email</th>
                      <th className="text-left p-2 font-medium">Phone</th>
                      <th className="text-left p-2 font-medium">Sewa Code</th>
                      <th className="text-left p-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredVolunteers.map((volunteer) => (
                      <tr
                        key={volunteer.id}
                        className="border-b hover:bg-muted/50 cursor-pointer"
                        onClick={() => navigate(`/volunteers/${volunteer.id}`)}
                      >
                        <td className="p-2">{volunteer.name}</td>
                        <td className="p-2">{volunteer.email}</td>
                        <td className="p-2">{volunteer.phone}</td>
                        <td className="p-2">
                          <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{volunteer.sewaCode}</span>
                        </td>
                        <td className="p-2">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              volunteer.status === "active"
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {volunteer.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
