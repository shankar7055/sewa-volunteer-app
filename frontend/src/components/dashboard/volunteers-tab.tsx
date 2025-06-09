"use client"

import { useState, useEffect } from "react"
import { Search, UserCheck, UserX } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface Volunteer {
  id: number
  sewaCode: string
  name: string
  phone: string
  sewaArea: string
  isPresent: boolean
  checkInTime?: string
}

interface VolunteersTabProps {
  volunteers: Volunteer[]
  sewaAreas: Record<string, string>
}

export default function VolunteersTab({ volunteers: initialVolunteers, sewaAreas }: VolunteersTabProps) {
  const [volunteers, setVolunteers] = useState<Volunteer[]>(initialVolunteers)
  const [filteredVolunteers, setFilteredVolunteers] = useState<Volunteer[]>(initialVolunteers)
  const [searchTerm, setSearchTerm] = useState("")
  const [areaFilter, setAreaFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  const { toast } = useToast()

  useEffect(() => {
    filterVolunteers()
  }, [searchTerm, areaFilter, statusFilter, volunteers])

  const filterVolunteers = () => {
    const filtered = volunteers.filter((volunteer) => {
      const matchesSearch =
        volunteer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        volunteer.sewaCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        volunteer.phone.includes(searchTerm)

      const matchesArea = areaFilter === "all" || volunteer.sewaArea === areaFilter
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "present" && volunteer.isPresent) ||
        (statusFilter === "absent" && !volunteer.isPresent)

      return matchesSearch && matchesArea && matchesStatus
    })

    setFilteredVolunteers(filtered)
  }

  const toggleAttendance = (volunteerId: number) => {
    setVolunteers((prev) =>
      prev.map((volunteer) => {
        if (volunteer.id === volunteerId) {
          const isPresent = !volunteer.isPresent
          const checkInTime = isPresent
            ? new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            : undefined

          return { ...volunteer, isPresent, checkInTime }
        }
        return volunteer
      }),
    )

    toast({
      title: "Attendance Updated",
      description: "Volunteer attendance status has been updated",
    })
  }

  const manualCheckIn = (volunteerId: number) => {
    const volunteer = volunteers.find((v) => v.id === volunteerId)
    if (volunteer && !volunteer.isPresent) {
      toggleAttendance(volunteerId)
    }
  }

  return (
    <div className="card">
      <div className="card-header">
        <h2>Volunteer Management</h2>
        <p>View and manage all registered volunteers</p>
      </div>
      <div className="card-content">
        <div className="table-controls">
          <div className="search-box">
            <Search className="w-4 h-4" />
            <input
              type="text"
              placeholder="Search by name, Sewa Code, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select value={areaFilter} onChange={(e) => setAreaFilter(e.target.value)}>
            <option value="all">All Areas</option>
            {Object.entries(sewaAreas).map(([code, name]) => (
              <option key={code} value={code}>
                {name}
              </option>
            ))}
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All Status</option>
            <option value="present">Present</option>
            <option value="absent">Absent</option>
          </select>
        </div>

        <div className="results-count">
          Showing {filteredVolunteers.length} of {volunteers.length} volunteers
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Sewa Code</th>
                <th>Name</th>
                <th>Phone</th>
                <th>Sewa Area</th>
                <th>Status</th>
                <th>Check-in Time</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredVolunteers.length > 0 ? (
                filteredVolunteers.map((volunteer) => (
                  <tr key={volunteer.id}>
                    <td>
                      <span className="sewa-code">{volunteer.sewaCode}</span>
                    </td>
                    <td>
                      <strong>{volunteer.name}</strong>
                    </td>
                    <td>
                      <i className="fas fa-phone" style={{ marginRight: "0.5rem", color: "#64748b" }}></i>
                      {volunteer.phone}
                    </td>
                    <td>
                      <span className="area-badge">{sewaAreas[volunteer.sewaArea]}</span>
                    </td>
                    <td>
                      <span className={`status-badge ${volunteer.isPresent ? "status-present" : "status-absent"}`}>
                        {volunteer.isPresent ? <UserCheck className="w-3 h-3" /> : <UserX className="w-3 h-3" />}
                        {volunteer.isPresent ? "Present" : "Absent"}
                      </span>
                    </td>
                    <td>
                      {volunteer.checkInTime ? (
                        <span className="sewa-code">{volunteer.checkInTime}</span>
                      ) : (
                        <span style={{ color: "#9ca3af" }}>-</span>
                      )}
                    </td>
                    <td>
                      {!volunteer.isPresent && (
                        <button className="action-btn btn-checkin" onClick={() => manualCheckIn(volunteer.id)}>
                          <UserCheck className="w-3 h-3" /> Check In
                        </button>
                      )}
                      <button className="action-btn btn-toggle" onClick={() => toggleAttendance(volunteer.id)}>
                        {volunteer.isPresent ? "Mark Absent" : "Mark Present"}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>
                    No volunteers found matching your criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
