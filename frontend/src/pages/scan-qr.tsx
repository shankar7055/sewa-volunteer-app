"use client"

import { ArrowLeft, Camera, CheckCircle, QrCode, XCircle } from "lucide-react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"

import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { useToast } from "../components/ui/use-toast"

import { volunteersApi } from "../lib/api"
import { useVolunteersStore } from "../lib/store"

// QR Scanner component with fallback
function QRScanner({ onScan, onError }: { onScan: (data: string) => void; onError: (error: string) => void }) {
  const [isScanning, setIsScanning] = useState(false)

  const startScanning = async () => {
    try {
      setIsScanning(true)

      // Try to use the camera API
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true })

        // For demo purposes, we'll simulate a scan after 3 seconds
        setTimeout(() => {
          // Simulate scanning a QR code
          const mockQRData = JSON.stringify({
            id: "1",
            code: "01-001",
            timestamp: Date.now(),
          })
          onScan(mockQRData)
          setIsScanning(false)

          // Stop the camera stream
          stream.getTracks().forEach((track) => track.stop())
        }, 3000)
      } else {
        throw new Error("Camera not available")
      }
    } catch (error) {
      setIsScanning(false)
      onError("Failed to access camera. Please check permissions.")
    }
  }

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        {isScanning ? (
          <div className="space-y-4">
            <div className="animate-pulse">
              <Camera className="h-16 w-16 mx-auto text-blue-500" />
            </div>
            <p className="text-lg font-medium">Scanning for QR code...</p>
            <p className="text-sm text-gray-500">Point your camera at a QR code</p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: "60%" }}></div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <QrCode className="h-16 w-16 mx-auto text-gray-400" />
            <div>
              <p className="text-lg font-medium">Ready to scan</p>
              <p className="text-sm text-gray-500">Click the button below to start scanning</p>
            </div>
            <Button onClick={startScanning} size="lg">
              <Camera className="mr-2 h-5 w-5" />
              Start Scanning
            </Button>
          </div>
        )}
      </div>

      <div className="text-xs text-gray-500 text-center">
        <p>Note: This is a demo scanner. In production, you would integrate with a real QR scanner library.</p>
      </div>
    </div>
  )
}

export default function ScanQRPage() {
  const [scanResult, setScanResult] = useState<any>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [attendanceResult, setAttendanceResult] = useState<any>(null)

  const navigate = useNavigate()
  const { toast } = useToast()
  const { volunteers } = useVolunteersStore()

  const handleScan = async (data: string) => {
    try {
      setIsProcessing(true)

      // Parse the QR code data
      const qrData = JSON.parse(data)
      setScanResult(qrData)

      // Find the volunteer
      const volunteer = volunteers.find((v) => v.id === qrData.id)

      if (volunteer) {
        // Record attendance
        const result = await volunteersApi.recordAttendance(data)
        setAttendanceResult(result)

        if (result.success) {
          toast({
            title: "Attendance Recorded",
            description: `${result.volunteerName} marked as present`,
          })
        } else {
          toast({
            variant: "destructive",
            title: "Failed to Record",
            description: "Could not record attendance",
          })
        }
      } else {
        toast({
          variant: "destructive",
          title: "Volunteer Not Found",
          description: "This QR code is not valid",
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Invalid QR Code",
        description: "Could not parse QR code data",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleError = (error: string) => {
    toast({
      variant: "destructive",
      title: "Scanner Error",
      description: error,
    })
  }

  const resetScanner = () => {
    setScanResult(null)
    setAttendanceResult(null)
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="icon" onClick={() => navigate("/volunteers")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Scan QR Code</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scanner Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <QrCode className="h-5 w-5" />
              <span>QR Code Scanner</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <QRScanner onScan={handleScan} onError={handleError} />
          </CardContent>
        </Card>

        {/* Results Section */}
        <Card>
          <CardHeader>
            <CardTitle>Scan Results</CardTitle>
          </CardHeader>
          <CardContent>
            {isProcessing ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-500">Processing...</p>
              </div>
            ) : scanResult ? (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium mb-2">QR Code Data</h3>
                  <div className="text-sm space-y-1">
                    <p>
                      <strong>ID:</strong> {scanResult.id}
                    </p>
                    <p>
                      <strong>Code:</strong> {scanResult.code}
                    </p>
                    <p>
                      <strong>Timestamp:</strong> {new Date(scanResult.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>

                {attendanceResult && (
                  <div className={`p-4 rounded-lg ${attendanceResult.success ? "bg-green-50" : "bg-red-50"}`}>
                    <div className="flex items-center space-x-2">
                      {attendanceResult.success ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                      <h3 className={`font-medium ${attendanceResult.success ? "text-green-800" : "text-red-800"}`}>
                        {attendanceResult.success ? "Attendance Recorded" : "Recording Failed"}
                      </h3>
                    </div>
                    <div className="mt-2 text-sm">
                      <p>
                        <strong>Volunteer:</strong> {attendanceResult.volunteerName}
                      </p>
                      <p>
                        <strong>Time:</strong> {new Date(attendanceResult.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}

                <Button onClick={resetScanner} variant="outline" className="w-full">
                  Scan Another Code
                </Button>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <QrCode className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No QR code scanned yet</p>
                <p className="text-sm">Scan a volunteer QR code to see results here</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">How to scan:</h4>
              <ol className="list-decimal list-inside space-y-1 text-gray-600">
                <li>Click "Start Scanning" button</li>
                <li>Allow camera permissions when prompted</li>
                <li>Point camera at volunteer QR code</li>
                <li>Wait for automatic detection</li>
              </ol>
            </div>
            <div>
              <h4 className="font-medium mb-2">What happens:</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>QR code data is validated</li>
                <li>Volunteer is identified</li>
                <li>Attendance is automatically recorded</li>
                <li>Confirmation is displayed</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Scans */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Attendance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {volunteers
              .filter((v) => v.isPresent)
              .slice(0, 5)
              .map((volunteer) => (
                <div key={volunteer.id} className="flex items-center justify-between py-2 border-b">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <div>
                      <p className="font-medium">{volunteer.name}</p>
                      <p className="text-sm text-gray-500">{volunteer.sewaCode}</p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">Present</span>
                </div>
              ))}
            {volunteers.filter((v) => v.isPresent).length === 0 && (
              <p className="text-center text-gray-500 py-4">No recent attendance records</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
