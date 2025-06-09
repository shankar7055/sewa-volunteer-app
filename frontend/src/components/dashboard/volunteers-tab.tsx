"use client"

import { Search, UserCheck, UserX } from "lucide-react"
import { useState } from "react"

// Define types locally
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

interface VolunteersTabProps {
  volunteers: Volunteer[]
  sewaAreas: Record<SewaAreaCode, string>
}

export default function VolunteersTab({ volunteers, sewaAreas }: VolunteersTabProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterArea, setFilterArea] = useState("")

  const filteredVolunteers = volunteers.filter((volunteer) => {
    const matchesSearch =
      volunteer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      volunteer.sewaCode.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesArea = !filterArea || volunteer.sewaArea === filterArea
    return matchesSearch && matchesArea
  })

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <div className="flex space-x-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search volunteers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filterArea}
            onChange={(e) => setFilterArea(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Areas</option>
            {Object.entries(sewaAreas).map(([code, name]) => (
              <option key={code} value={code}>
                {code} - {name}
              </option>
            ))}
          </select>
        </div>

        <div className="text-sm text-gray-600 mb-4">
          Showing {filteredVolunteers.length} of {volunteers.length} volunteers
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left p-4 font-medium">Sewa Code</th>
                <th className="text-left p-4 font-medium">Name</th>
                <th className="text-left p-4 font-medium">Phone</th>
                <th className="text-left p-4 font-medium">Sewa Area</th>
                <th className="text-left p-4 font-medium">Status</th>
                <th className="text-left p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredVolunteers.map((volunteer) => (
                <tr key={volunteer.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">
                    <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{volunteer.sewaCode}</span>
                  </td>
                  <td className="p-4 font-medium">{volunteer.name}</td>
                  <td className="p-4">{volunteer.phone}</td>
                  <td className="p-4">
                    <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {volunteer.sewaArea} - {sewaAreas[volunteer.sewaArea]}
                    </span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center space-x-1 text-sm px-2 py-1 rounded ${
                        volunteer.isPresent ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {volunteer.isPresent ? (
                        <>
                          <UserCheck className="w-3 h-3" />
                          <span>Present</span>
                        </>
                      ) : (
                        <>
                          <UserX className="w-3 h-3" />
                          <span>Absent</span>
                        </>
                      )}
                    </span>
                  </td>
                  <td className="p-4">
                    <button className="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 mr-2">
                      <UserCheck className="w-3 h-3 inline mr-1" />
                      Check In
                    </button>
                    <button className="text-sm bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700">
                      Toggle Status
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
