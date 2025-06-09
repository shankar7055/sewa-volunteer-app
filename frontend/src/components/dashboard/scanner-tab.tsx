"use client"

import { useState } from "react"
import { Camera, QrCode, CheckCircle, AlertCircle, Clock, User, Phone, BadgeIcon as IdCard } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface Volunteer {
  id: number
  sewaCode: string
  name: string
  phone: string
  sewaArea: string
  isPresent?: boolean
  checkInTime?: string
}

interface ScannerTabProps {
  volunteers: Volunteer[]
  sewaAreas: Record<string, string>
}

export default function ScannerTab({ volunteers, sewaAreas }: ScannerTabProps) {
  const [manualInput, setManualInput] = useState("")
  const [scanResult, setScanResult] = useState<{
    type: "success" | "error" | "duplicate" | null
    message: string
  }>({ type: null, message: "" })
  const [volunteerDetails, setVolunteerDetails] = useState<Volunteer | null>(null)

  const { toast } = useToast()

  const simulateQRScan = () => {
    // Simulate scanning a random volunteer's QR code
    const randomVolunteer = volunteers[Math.floor(Math.random() * volunteers.length)]
    const qrData = JSON.stringify({
      sewaCode: randomVolunteer.sewaCode,
      name: randomVolunteer.name,
      phone: randomVolunteer.phone,
      sewaArea: randomVolunteer.sewaArea,
      areaName: sewaAreas[randomVolunteer.sewaArea],
    })

    handleQRScan(qrData)
  }

  const handleQRScan = (qrData: string) => {
    try {
      const data = JSON.parse(qrData)
      const volunteer = volunteers.find((v) => v.sewaCode === data.sewaCode)

      if (!volunteer) {
        showScanResult("error", "Volunteer not found in the system", null)
        return
      }

      processCheckIn(volunteer)
    } catch {
      // If not JSON, treat as plain text (Sewa Code)
      const volunteer = volunteers.find((v) => v.sewaCode === qrData.trim())

      if (!volunteer) {
        showScanResult("error", "Invalid QR code or volunteer not found", null)
        return
      }

      processCheckIn(volunteer)
    }
  }

  const handleManualCheckIn = () => {
    const input = manualInput.trim()
    if (!input) return

    // Try to find by Sewa Code first, then by phone number
    let volunteer = volunteers.find((v) => v.sewaCode.toLowerCase() === input.toLowerCase())

    if (!volunteer) {
      volunteer = volunteers.find(
        (v) => v.phone.includes(input) || input.includes(v.phone.replace(/\D/g, "").slice(-10)),
      )
    }

    if (!volunteer) {
      showScanResult("error", "Volunteer not found. Please check the Sewa Code or phone number.", null)
      return
    }

    processCheckIn(volunteer)
    setManualInput("")
  }

  const processCheckIn = (volunteer: Volunteer) => {
    if (volunteer.isPresent) {
      showScanResult("duplicate", `${volunteer.name} is already checked in at ${volunteer.checkInTime}`, volunteer)
      return
    }

    const currentTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

    // Update volunteer status (in a real app, this would update the backend)
    const updatedVolunteer = { ...volunteer, isPresent: true, checkInTime: currentTime }

    showScanResult("success", `Successfully checked in ${volunteer.name}`, updatedVolunteer)

    toast({
      title: "Check-in Successful",
      description: `${volunteer.name} has been checked in at ${currentTime}`,
    })
  }

  const showScanResult = (type: "success" | "error" | "duplicate", message: string, volunteer: Volunteer | null) => {
    setScanResult({ type, message })
    setVolunteerDetails(volunteer)

    // Auto-hide result after 5 seconds
    setTimeout(() => {
      setScanResult({ type: null, message: "" })
      if (!volunteer || type === "error") {
        setVolunteerDetails(null)
      }
    }, 5000)
  }

  return (
    <>
      <div className="card">
        <div className="card-header">
          <h2>
            <QrCode className="w-5 h-5" /> QR Code Scanner
          </h2>
          <p>Scan volunteer QR code to mark attendance</p>
        </div>
        <div className="card-content">
          <div className="scanner-area">
            <div className="camera-placeholder">
              <Camera className="w-16 h-16 text-gray-400" />
              <p>Camera view will appear here</p>
              <button onClick={simulateQRScan} className="simulate-btn">
                <QrCode className="w-4 h-4" />
                Simulate QR Scan
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>Manual Check-In</h2>
        </div>
        <div className="card-content">
          <div className="manual-checkin">
            <input
              type="text"
              placeholder="Enter sewa code or phone number"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleManualCheckIn()}
            />
            <button onClick={handleManualCheckIn} className="checkin-btn">
              Check In
            </button>
          </div>
        </div>
      </div>

      {scanResult.type && (
        <div className={`scan-result ${scanResult.type}`}>
          {scanResult.type === "success" ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {scanResult.message}
        </div>
      )}

      {volunteerDetails && (
        <div className="volunteer-details">
          <h3>Volunteer Details</h3>
          <div className="details-grid">
            <div>
              <div className="detail-item">
                <User className="w-4 h-4" />
                <span>
                  <strong>{volunteerDetails.name}</strong>
                </span>
              </div>
              <div className="detail-item">
                <Phone className="w-4 h-4" />
                <span>{volunteerDetails.phone}</span>
              </div>
              <div className="detail-item">
                <IdCard className="w-4 h-4" />
                <span className="sewa-code">{volunteerDetails.sewaCode}</span>
              </div>
            </div>
            <div>
              <div className="detail-item">
                <span className="detail-label">Sewa Area:</span>
              </div>
              <div className="detail-value">{sewaAreas[volunteerDetails.sewaArea]}</div>

              <div className="detail-item mt-3">
                <span className="detail-label">Status:</span>
              </div>
              <div className="detail-value">
                <span className={`status-badge ${volunteerDetails.isPresent ? "status-present" : "status-absent"}`}>
                  {volunteerDetails.isPresent ? (
                    <CheckCircle className="w-3 h-3" />
                  ) : (
                    <AlertCircle className="w-3 h-3" />
                  )}
                  {volunteerDetails.isPresent ? "Present" : "Absent"}
                </span>
              </div>

              {volunteerDetails.checkInTime && (
                <div className="detail-item mt-3">
                  <Clock className="w-4 h-4" />
                  <span className="sewa-code">{volunteerDetails.checkInTime}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
