"use client"

import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Plus, Search, Filter, MoreHorizontal, QrCode } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"

import { volunteersApi } from "@/lib/api"
import { useVolunteersStore } from "@/lib/store"

export default function VolunteersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()
  const { toast } = useToast()

  const { volunteers, setVolunteers, deleteVolunteer } = useVolunteersStore()

  useEffect(() => {
    const fetchVolunteers = async () => {
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

    fetchVolunteers()
  }, [setVolunteers, toast])

  // Filter volunteers based on search query
  const filteredVolunteers = volunteers.filter((volunteer) => {
    const query = searchQuery.toLowerCase()
    return (
      volunteer.name.toLowerCase().includes(query) ||
      volunteer.email.toLowerCase().includes(query) ||
      volunteer.phone.includes(query)
    )
  })

  // Handle volunteer deletion
  const handleDeleteVolunteer = async (id: string) => {
    try {
      await volunteersApi.delete(id)
      deleteVolunteer(id)
      toast({
        title: "Volunteer deleted",
        description: "The volunteer has been removed successfully",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete volunteer",
      })
    }
  }

  // Generate QR code for volunteer
  const handleGenerateQR = async (id: string) => {
    try {
      const data = await volunteersApi.generateQR(id)
      toast({
        title: "QR Code Generated",
        description: "QR code has been generated successfully",
      })
      navigate(`/volunteers/${id}?tab=qr`)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate QR code",
      })
    }
  }

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "inactive":
        return "bg-gray-100 text-gray-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between space-y-2 md:flex-row md:items-center md:space-y-0">
        <h2 className="text-3xl font-bold tracking-tight">Volunteers</h2>
        <Button onClick={() => navigate("/volunteers/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Add Volunteer
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
          <CardTitle>All Volunteers</CardTitle>
          <div className="flex items-center space-x-2">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search volunteers..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse rounded-md bg-gray-100 p-4">
                  <div className="h-5 w-1/3 rounded bg-gray-200" />
                  <div className="mt-2 h-4 w-1/4 rounded bg-gray-200" />
                </div>
              ))}
            </div>
          ) : filteredVolunteers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="border-b text-left text-sm font-medium text-muted-foreground">
                    <th className="pb-3 pl-4">Name</th>
                    <th className="pb-3">Email</th>
                    <th className="pb-3">Phone</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 pr-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVolunteers.map((volunteer) => (
                    <tr key={volunteer.id} className="border-b">
                      <td className="py-3 pl-4">
                        <Link to={`/volunteers/${volunteer.id}`} className="font-medium hover:underline">
                          {volunteer.name}
                        </Link>
                      </td>
                      <td className="py-3">{volunteer.email}</td>
                      <td className="py-3">{volunteer.phone}</td>
                      <td className="py-3">
                        <Badge variant="outline" className={getStatusColor(volunteer.status)}>
                          {volunteer.status.charAt(0).toUpperCase() + volunteer.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="py-3 pr-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/volunteers/${volunteer.id}`)}>
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate(`/volunteers/${volunteer.id}/edit`)}>
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleGenerateQR(volunteer.id)}>
                              <QrCode className="mr-2 h-4 w-4" />
                              Generate QR
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDeleteVolunteer(volunteer.id)}
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8">
              <p className="text-center text-muted-foreground">
                {searchQuery ? "No volunteers found matching your search" : "No volunteers added yet"}
              </p>
              {!searchQuery && (
                <Button variant="outline" className="mt-4" onClick={() => navigate("/volunteers/new")}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Volunteer
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
