"use client"

import { Download, QrCode, RefreshCw } from "lucide-react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { useToast } from "../components/ui/use-toast"

import { volunteersApi } from "../lib/api"
import { generateAndDownloadBulkQRs } from "../lib/qr-utils"
import { useVolunteersStore } from "../lib/store"

// Define the sewa area type
type SewaAreaCode = "01" | "02" | "03" | "04" | "05" | "06" | "07"

const SEWA_AREAS: Record<SewaAreaCode, string> = {
  "01": "Function Incharge",
  "02": "Back Office",
  "03": "Line Management",
  "04": "Jal Prashad",
  "05": "Bin Bag",
  "06": "Langar Prashad",
  "07": "Langar Refilling",
}

export default function QRManagementPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedArea, setSelectedArea] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(true)
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

    // Apply area filter
    const matchesArea = selectedArea === "all" || volunteer.sewaArea === selectedArea

    return matchesSearch && matchesArea
  })

  const handleGenerateAllQRs = async () => {
    if (filteredVolunteers.length === 0) {
      toast({
        variant: "destructive",
        title: "No volunteers found",
        description: "Please adjust your filters to find volunteers",
      })
      return
    }

    try {
      setIsGeneratingQRs(true)

      // Get volunteer data
      const volunteerData = filteredVolunteers.map((v) => ({
        id: v.id,
        name: v.name,
        sewaCode: v.sewaCode,
      }))

      // Generate and download QR codes
      await generateAndDownloadBulkQRs(volunteerData)

      toast({
        title: "Success",
        description: `Generated QR codes for ${filteredVolunteers.length} volunteers`,
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

  const handleGenerateQRByArea = async (area: SewaAreaCode) => {
    const areaVolunteers = volunteers.filter((v) => v.sewaArea === area)

    if (areaVolunteers.length === 0) {
      toast({
        variant: "destructive",
        title: "No volunteers found",
        description: `No volunteers found in area ${area}`,
      })
      return
    }

    try {
      setIsGeneratingQRs(true)

      // Get volunteer data
      const volunteerData = areaVolunteers.map((v) => ({
        id: v.id,
        name: v.name,
        sewaCode: v.sewaCode,
      }))

      // Generate and download QR codes
      await generateAndDownloadBulkQRs(volunteerData)

      toast({
        title: "Success",
        description: `Generated QR codes for ${areaVolunteers.length} volunteers in area ${area}`,
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">QR Code Management</h1>
          <p className="text-muted-foreground">Generate and manage QR codes for volunteers</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button onClick={handleGenerateAllQRs} disabled={isGeneratingQRs || volunteers.length === 0}>
              <QrCode className="mr-2 h-4 w-4" />
              Generate All QR Codes ({volunteers.length})
            </Button>

            <Button variant="outline" onClick={() => navigate("/scan-qr")}>
              <QrCode className="mr-2 h-4 w-4" />
              Scan QR Code
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Generate by Area */}
      <Card>
        <CardHeader>
          <CardTitle>Generate by Sewa Area</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Object.entries(SEWA_AREAS).map(([code, name]) => {
              const areaCode = code as SewaAreaCode
              const count = volunteers.filter((v) => v.sewaArea === areaCode).length

              return (
                <Card key={code} className="bg-gray-50">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">{code}</span>
                        <h3 className="font-medium mt-1">{name}</h3>
                      </div>
                      <p className="text-sm text-gray-500">{count} volunteers</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        disabled={count === 0 || isGeneratingQRs}
                        onClick={() => handleGenerateQRByArea(areaCode)}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Generate QR Codes
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Custom Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Custom Filter</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Input
                type="search"
                placeholder="Search volunteers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Areas</option>
              {Object.entries(SEWA_AREAS).map(([code, name]) => (
                <option key={code} value={code}>
                  {code} - {name}
                </option>
              ))}
            </select>

            <Button onClick={handleGenerateAllQRs} disabled={filteredVolunteers.length === 0 || isGeneratingQRs}>
              <QrCode className="mr-2 h-4 w-4" />
              Generate ({filteredVolunteers.length})
            </Button>
          </div>

          {/* Results */}
          <div className="bg-gray-50 p-4 rounded">
            <h3 className="font-medium mb-2">Found {filteredVolunteers.length} volunteers</h3>
            {filteredVolunteers.length > 0 && (
              <div className="max-h-40 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-1">Name</th>
                      <th className="text-left p-1">Sewa Code</th>
                      <th className="text-left p-1">Area</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredVolunteers.map((volunteer) => (
                      <tr key={volunteer.id} className="border-b hover:bg-gray-100">
                        <td className="p-1">{volunteer.name}</td>
                        <td className="p-1 font-mono">{volunteer.sewaCode}</td>
                        <td className="p-1">{volunteer.sewaArea}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
