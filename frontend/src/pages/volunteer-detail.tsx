"use client"

import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  Download,
  Edit,
  Mail,
  MapPin,
  Phone,
  Trash2,
  Upload,
  User,
  XCircle,
} from "lucide-react"
import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"

import { Badge } from "../components/ui/badge"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog"
import { useToast } from "../components/ui/use-toast"

import { QRCodeButton } from "../components/qr-code-button"
import { volunteersApi } from "../lib/api"
import { downloadQR } from "../lib/qr-utils"
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
} as const

export default function VolunteerDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { volunteers, deleteVolunteer } = useVolunteersStore()

  const [volunteer, setVolunteer] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isGeneratingQR, setIsGeneratingQR] = useState(false)
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null)
  const [showQRDialog, setShowQRDialog] = useState(false)

  useEffect(() => {
    const loadVolunteer = async () => {
      if (!id) return

      try {
        // First try to find in store
        const existingVolunteer = volunteers.find((v) => v.id === id)
        if (existingVolunteer) {
          setVolunteer(existingVolunteer)
          setIsLoading(false)
          return
        }

        // If not in store, fetch from API
        const data = await volunteersApi.getById(id)
        setVolunteer(data)
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load volunteer details",
        })
        navigate("/volunteers")
      } finally {
        setIsLoading(false)
      }
    }

    loadVolunteer()
  }, [id, volunteers, toast, navigate])

  const handleDelete = async () => {
    if (!volunteer || !confirm("Are you sure you want to delete this volunteer?")) return

    try {
      await volunteersApi.delete(volunteer.id)
      deleteVolunteer(volunteer.id)

      toast({
        title: "Success",
        description: "Volunteer deleted successfully",
      })

      navigate("/volunteers")
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete volunteer",
      })
    }
  }

  const handleGenerateQR = async () => {
    if (!volunteer) return

    try {
      setIsGeneratingQR(true)

      // Generate QR code
      const dataUrl = await volunteersApi.generateQR(volunteer.id)
      setQrCodeDataUrl(dataUrl)
      setShowQRDialog(true)

      toast({
        title: "Success",
        description: "QR code generated successfully",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate QR code",
      })
    } finally {
      setIsGeneratingQR(false)
    }
  }

  const handleDownloadQR = () => {
    if (!qrCodeDataUrl || !volunteer) return

    // Download the QR code
    const fileName = `volunteer-${volunteer.sewaCode}-qr.png`
    downloadQR(qrCodeDataUrl, fileName)

    toast({
      title: "Success",
      description: "QR code downloaded successfully",
    })
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

  if (!volunteer) {
    return (
      <div className="space-y-6 p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Volunteer Not Found</h1>
          <Button onClick={() => navigate("/volunteers")} className="mt-4">
            Back to Volunteers
          </Button>
        </div>
      </div>
    )
  }

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
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon" onClick={() => navigate("/volunteers")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Volunteer Details</h1>
        </div>

        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => navigate("/volunteer-upload")}>
            <Upload className="mr-2 h-4 w-4" />
            Upload
          </Button>
          <Button variant="outline" onClick={() => navigate(`/volunteers/${volunteer.id}/edit`)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <QRCodeButton
            volunteerId={volunteer.id}
            volunteerCode={volunteer.sewaCode}
            size="default"
            variant="outline"
          />
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Personal Information</span>
              </div>
              <Badge className={getStatusColor(volunteer.status)}>
                {volunteer.status.charAt(0).toUpperCase() + volunteer.status.slice(1)}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Full Name</label>
                  <p className="text-lg font-medium">{volunteer.name}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Email Address</label>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <p>{volunteer.email}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Phone Number</label>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <p>{volunteer.phone}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Sewa Code</label>
                  <p className="text-lg font-mono font-bold bg-gray-100 px-3 py-1 rounded inline-block">
                    {volunteer.sewaCode}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Sewa Area</label>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <p>
                      {volunteer.sewaArea} - {SEWA_AREAS[volunteer.sewaArea as SewaAreaCode]}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Joined Date</label>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <p>{new Date(volunteer.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Card */}
        <Card>
          <CardHeader>
            <CardTitle>Attendance Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Present Days</span>
              </div>
              <span className="font-bold text-green-600">15</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <XCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm">Absent Days</span>
              </div>
              <span className="font-bold text-red-600">3</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">Attendance Rate</span>
              <span className="font-bold text-blue-600">83%</span>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: "83%" }}></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Checked in</span>
              </div>
              <span className="text-sm text-gray-500">Today, 9:15 AM</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Checked in</span>
              </div>
              <span className="text-sm text-gray-500">Yesterday, 9:30 AM</span>
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="flex items-center space-x-3">
                <XCircle className="h-4 w-4 text-red-500" />
                <span>Absent</span>
              </div>
              <span className="text-sm text-gray-500">2 days ago</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* QR Code Dialog */}
      <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Volunteer QR Code</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center space-y-4 p-4">
            {qrCodeDataUrl && (
              <div className="border p-4 rounded-lg bg-white">
                <img
                  src={qrCodeDataUrl || "/placeholder.svg"}
                  alt="Volunteer QR Code"
                  className="w-64 h-64 object-contain"
                />
              </div>
            )}
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-500">
                QR Code for: <span className="font-medium">{volunteer.name}</span>
              </p>
              <p className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">{volunteer.sewaCode}</p>
            </div>
            <Button onClick={handleDownloadQR} className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Download QR Code
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
