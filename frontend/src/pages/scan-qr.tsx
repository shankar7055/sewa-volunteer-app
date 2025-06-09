"use client"

import { useState } from "react"
import { QrScanner } from "@yudiel/react-qr-scanner"
import { QrCode, CheckCircle, AlertCircle } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

import { volunteersApi } from "@/lib/api"

export default function ScanQRPage() {
  const [scanning, setScanning] = useState(false)
  const [scanResult, setScanResult] = useState<{
    success: boolean
    message: string
    volunteerName?: string
  } | null>(null)
  const { toast } = useToast()

  const handleScan = async (result: string) => {
    try {
      // Record attendance with the scanned QR data
      const response = await volunteersApi.recordAttendance(result)

      setScanResult({
        success: true,
        message: "Attendance recorded successfully",
        volunteerName: response.volunteerName,
      })

      toast({
        title: "Success",
        description: `Attendance recorded for ${response.volunteerName}`,
      })
    } catch (error) {
      setScanResult({
        success: false,
        message: error instanceof Error ? error.message : "Failed to record attendance",
      })

      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to record attendance",
      })
    } finally {
      setScanning(false)
    }
  }

  const handleError = (error: Error) => {
    console.error(error)
    toast({
      variant: "destructive",
      title: "Scanner Error",
      description: "Could not access camera or scanner encountered an error",
    })
    setScanning(false)
  }

  const resetScan = () => {
    setScanResult(null)
    setScanning(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between space-y-2 md:flex-row md:items-center md:space-y-0">
        <h2 className="text-3xl font-bold tracking-tight">QR Scanner</h2>
        <Button variant={scanning ? "destructive" : "default"} onClick={() => setScanning(!scanning)}>
          {scanning ? "Stop Scanning" : "Start Scanning"}
        </Button>
      </div>

      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Scan Volunteer QR Code</CardTitle>
          <CardDescription>Scan a volunteer's QR code to record attendance</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {scanning ? (
            <div className="aspect-square max-h-[500px]">
              <QrScanner
                onDecode={handleScan}
                onError={handleError}
                containerStyle={{ height: "100%" }}
                constraints={{
                  facingMode: "environment", // Use back camera by default
                  aspectRatio: 1,
                }}
                scanDelay={300}
                videoStyle={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </div>
          ) : scanResult ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              {scanResult.success ? (
                <>
                  <CheckCircle className="mb-4 h-16 w-16 text-green-500" />
                  <h3 className="mb-2 text-xl font-bold">Success!</h3>
                  <p className="mb-4 text-muted-foreground">{scanResult.message}</p>
                  {scanResult.volunteerName && <p className="text-lg font-medium">{scanResult.volunteerName}</p>}
                </>
              ) : (
                <>
                  <AlertCircle className="mb-4 h-16 w-16 text-red-500" />
                  <h3 className="mb-2 text-xl font-bold">Error</h3>
                  <p className="mb-4 text-muted-foreground">{scanResult.message}</p>
                </>
              )}
              <Button onClick={resetScan} className="mt-4">
                Scan Another Code
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-16 text-center">
              <QrCode className="mb-4 h-16 w-16 text-muted-foreground" />
              <h3 className="mb-2 text-xl font-bold">No QR Code Scanned</h3>
              <p className="mb-4 text-muted-foreground">Click the "Start Scanning" button to begin scanning QR codes</p>
              <Button onClick={() => setScanning(true)}>Start Scanning</Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal space-y-2 pl-5">
            <li>Click "Start Scanning" to activate the camera</li>
            <li>Point the camera at a volunteer's QR code</li>
            <li>Hold steady until the code is recognized</li>
            <li>The system will automatically record the attendance</li>
            <li>You can scan another code or stop scanning when finished</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}
