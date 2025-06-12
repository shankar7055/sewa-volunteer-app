"use client"

import { ArrowUpDown, CheckCircle, Plus, RefreshCw, Search, Trash2, Upload, XCircle } from "lucide-react"
import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"

import { Badge } from "../components/ui/badge"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Checkbox } from "../components/ui/checkbox"
import { Input } from "../components/ui/input"
import { useToast } from "../components/ui/use-toast"

import { BulkQRGenerator } from "../components/bulk-qr-code-generator"
import { QRCodeButton } from "../components/qr-code-button"
import { volunteersApi } from "../lib/api"
import { generateAndDownloadBulkQRs } from "../lib/qr-utils"
import { useVolunteersStore } from "../lib/store"
import { SEWA_AREAS, type SewaAreaCode } from "../types/volunteer"

export default function VolunteersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFilter, setSelectedFilter] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(true)
  const [selectedVolunteers, setSelectedVolunteers] = useState<string[]>([])
  const [isGeneratingQRs, setIsGeneratingQRs] = useState(false)

  const navigate = useNavigate()
  const { toast } = useToast()
  const { volunteers, setVolunteers } = useVolunteersStore()

  useEffect(() => {
    const loadVolunteers = async () => {
      try {
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
    // Apply search filter
    const matchesSearch =
      volunteer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      volunteer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      volunteer.sewaCode.toLowerCase().includes(searchQuery.toLowerCase())

    // Apply status filter
    const matchesFilter =
      selectedFilter === "all" ||
      (selectedFilter === "active" && volunteer.status === "active") ||
      (selectedFilter === "inactive" && volunteer.status === "inactive") ||
      (selectedFilter === "present" && volunteer.isPresent)

    return matchesSearch && matchesFilter
  })

  const handleSelectAll = (checked: boolean | "indeterminate" | undefined) => {
    if (checked === true) {
      setSelectedVolunteers(filteredVolunteers.map((v) => v.id))
    } else {
      setSelectedVolunteers([])
    }
  }

  const handleSelectVolunteer = (volunteerId: string, checked: boolean | "indeterminate" | undefined) => {
    if (checked === true) {
      setSelectedVolunteers((prev) => [...prev, volunteerId])
    } else {
      setSelectedVolunteers((prev) => prev.filter((id) => id !== volunteerId))
    }
  }

  const handleBulkDelete = async () => {
    if (selectedVolunteers.length === 0) return

    if (!confirm(`Are you sure you want to delete ${selectedVolunteers.length} volunteers?`)) return

    try {
      // Delete each volunteer
      await Promise.all(selectedVolunteers.map((id) => volunteersApi.delete(id)))

      // Update store
      setVolunteers(volunteers.filter((v) => !selectedVolunteers.includes(v.id)))

      toast({
        title: "Success",
        description: `Deleted ${selectedVolunteers.length} volunteers`,
      })

      // Clear selection
      setSelectedVolunteers([])
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete volunteers",
      })
    }
  }

  const handleGenerateBulkQRs = async () => {
    if (selectedVolunteers.length === 0) {
      toast({
        variant: "destructive",
        title: "No volunteers selected",
        description: "Please select at least one volunteer to generate QR codes",
      })
      return
    }

    try {
      setIsGeneratingQRs(true)

      // Get selected volunteer data
      const selectedVolunteerData = volunteers
        .filter((v) => selectedVolunteers.includes(v.id))
        .map((v) => ({
          id: v.id,
          name: v.name,
          sewaCode: v.sewaCode,
        }))

      // Generate and download QR codes
      await generateAndDownloadBulkQRs(selectedVolunteerData)

      toast({
        title: "Success",
        description: `Generated QR codes for ${selectedVolunteers.length} volunteers`,
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate QR codes",
      })
    } finally {
      setIsGeneratingQRs(false)
    }
  }

  const handleIndividualQR = async (volunteer: any) => {
    try {
      setIsGeneratingQRs(true)
      const dataUrl = await volunteersApi.generateQR(volunteer.id)
      const fileName = `volunteer-${volunteer.sewaCode}-qr.png`

      // Create download link
      const link = document.createElement("a")
      link.href = dataUrl
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: "Success",
        description: "QR code downloaded",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate QR code",
      })
    } finally {
      setIsGeneratingQRs(false)
    }
  }

  const getStatusBadge = (status: string, isPresent: boolean) => {
    if (isPresent) {
      return <Badge className="bg-green-100 text-green-800">Present</Badge>
    }

    switch (status) {
      case "active":
        return <Badge className="bg-blue-100 text-blue-800">Active</Badge>
      case "inactive":
        return <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>
    }
  }

  const selectedVolunteerData = volunteers
    .filter((v) => selectedVolunteers.includes(v.id))
    .map((v) => ({
      id: v.id,
      name: v.name,
      sewaCode: v.sewaCode,
    }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Volunteers</h1>
          <p className="text-muted-foreground">Manage your volunteers and their assignments</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => navigate("/volunteer-upload")}>
            <Upload className="mr-2 h-4 w-4" />
            Upload
          </Button>
          <Button onClick={() => navigate("/volunteers/create")}>
            <Plus className="mr-2 h-4 w-4" />
            Add Volunteer
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Search volunteers..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <Button
            variant={selectedFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedFilter("all")}
          >
            All
          </Button>
          <Button
            variant={selectedFilter === "active" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedFilter("active")}
          >
            Active
          </Button>
          <Button
            variant={selectedFilter === "inactive" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedFilter("inactive")}
          >
            Inactive
          </Button>
          <Button
            variant={selectedFilter === "present" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedFilter("present")}
          >
            Present
          </Button>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedVolunteers.length > 0 && (
        <Card className="bg-gray-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox checked={selectedVolunteers.length > 0} />
                <span className="text-sm font-medium">
                  {selectedVolunteers.length} volunteer{selectedVolunteers.length > 1 ? "s" : ""} selected
                </span>
              </div>
              <div className="flex space-x-2">
                <BulkQRGenerator volunteers={selectedVolunteerData} size="sm" variant="outline" />
                <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Volunteers Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Volunteers List</CardTitle>
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse flex items-center space-x-4 py-3">
                  <div className="h-4 w-4 bg-gray-200 rounded"></div>
                  <div className="h-8 bg-gray-200 rounded w-full"></div>
                </div>
              ))}
            </div>
          ) : filteredVolunteers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No volunteers found</p>
              <Button onClick={() => navigate("/volunteers/create")} className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Add Volunteer
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 w-10">
                      <Checkbox
                        checked={
                          selectedVolunteers.length > 0 && selectedVolunteers.length === filteredVolunteers.length
                        }
                        onCheckedChange={handleSelectAll}
                      />
                    </th>
                    <th className="text-left p-2">
                      <div className="flex items-center space-x-1">
                        <span>Name</span>
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </th>
                    <th className="text-left p-2 hidden md:table-cell">Email</th>
                    <th className="text-left p-2 hidden md:table-cell">Sewa Area</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVolunteers.map((volunteer) => (
                    <tr key={volunteer.id} className="border-b hover:bg-gray-50">
                      <td className="p-2">
                        <Checkbox
                          checked={selectedVolunteers.includes(volunteer.id)}
                          onCheckedChange={(checked) => handleSelectVolunteer(volunteer.id, checked)}
                        />
                      </td>
                      <td className="p-2">
                        <div className="font-medium">{volunteer.name}</div>
                        <div className="text-sm text-gray-500 md:hidden">{volunteer.email}</div>
                      </td>
                      <td className="p-2 hidden md:table-cell">{volunteer.email}</td>
                      <td className="p-2 hidden md:table-cell">
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {volunteer.sewaArea} - {SEWA_AREAS[volunteer.sewaArea as SewaAreaCode]}
                        </span>
                      </td>
                      <td className="p-2">
                        <div className="flex items-center">
                          {volunteer.isPresent ? (
                            <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500 mr-1" />
                          )}
                          {getStatusBadge(volunteer.status, volunteer.isPresent)}
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="flex items-center space-x-2">
                          <Link
                            to={`/volunteers/${volunteer.id}`}
                            className="text-sm bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
                          >
                            View
                          </Link>
                          <QRCodeButton volunteerId={volunteer.id} volunteerCode={volunteer.sewaCode} size="icon" />
                        </div>
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
  )
}
