"use client"

import { Edit, Plus, Search, Trash2, UserCheck, UserX } from "lucide-react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { useToast } from "../components/ui/use-toast"

import { volunteersApi } from "../lib/api"
import { useVolunteersStore } from "../lib/store"
import { SEWA_AREAS } from "../types/volunteer"

export default function VolunteersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterArea, setFilterArea] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  const navigate = useNavigate()
  const { toast } = useToast()
  const { volunteers, setVolunteers } = useVolunteersStore()

  useEffect(() => {
    const loadVolunteers = async () => {
      try {
        setIsLoading(true)
        const data = await volunteersApi.getAll()
        setVolunteers(data)
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load volunteers",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadVolunteers()
  }, [setVolunteers, toast])

  const filteredVolunteers = volunteers.filter((volunteer) => {
    const matchesSearch =
      volunteer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      volunteer.sewaCode.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesArea = !filterArea || volunteer.sewaArea === filterArea
    return matchesSearch && matchesArea
  })

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this volunteer?")) return

    try {
      await volunteersApi.delete(id)
      setVolunteers(volunteers.filter((v) => v.id !== id))
      toast({
        title: "Success",
        description: "Volunteer deleted successfully",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete volunteer",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Volunteers</h1>
          <p className="text-muted-foreground">Manage volunteer information and activities</p>
        </div>
        <Button onClick={() => navigate("/volunteers/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Add Volunteer
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Volunteer List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search volunteers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <select
              value={filterArea}
              onChange={(e) => setFilterArea(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Areas</option>
              {Object.entries(SEWA_AREAS).map(([code, name]) => (
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
                        {volunteer.sewaArea} - {SEWA_AREAS[volunteer.sewaArea]}
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
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => navigate(`/volunteers/${volunteer.id}`)}>
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(volunteer.id)}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredVolunteers.length === 0 && (
            <div className="text-center py-8 text-gray-500">No volunteers found matching your criteria.</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
