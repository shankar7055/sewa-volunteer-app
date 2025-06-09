"use client"

import { AlertCircle, Camera, CheckCircle, Scan } from "lucide-react"
import { useState } from "react"

interface ScannerTabProps {
  volunteers: any[]
  sewaAreas: Record<string, string>
}

export default function ScannerTab({ volunteers, sewaAreas }: ScannerTabProps) {
  const [manualCode, setManualCode] = useState("")
  const [scanResult, setScanResult] = useState<any>(null)

  const handleManualCheckIn = () => {
    if (!manualCode) return

    // Mock check-in
    const volunteer = volunteers.find((v) => v.sewaCode === manualCode)
    if (volunteer) {
      setScanResult({
        success: true,
        volunteer,
        message: `${volunteer.name} checked in successfully`,
      })
    } else {
      setScanResult({
        success: false,
        message: "Volunteer not found",
      })
    }
    setManualCode("")
  }

  const simulateScan = () => {
    // Simulate a successful scan
    const randomVolunteer = volunteers[Math.floor(Math.random() * volunteers.length)]
    setScanResult({
      success: true,
      volunteer: randomVolunteer,
      message: `${randomVolunteer?.name || "Volunteer"} checked in successfully`,
    })
  }

  return (
    <div className="card">
      <div className="card-content">
        <div className="scanner-area">
          <div className="camera-placeholder">
            <Camera className="w-16 h-16 text-gray-400" />
            <p>Camera will appear here when scanning is active</p>
            <button onClick={simulateScan} className="simulate-btn">
              <Scan className="w-4 h-4" />
              Simulate Scan
            </button>
          </div>
        </div>

        <div className="manual-checkin">
          <input
            type="text"
            placeholder="Enter Sewa Code manually (e.g., 01-001)"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
          />
          <button onClick={handleManualCheckIn} className="checkin-btn">
            Check In
          </button>
        </div>

        {scanResult && (
          <div className={`scan-result ${scanResult.success ? "success" : "error"}`}>
            {scanResult.success ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {scanResult.message}
          </div>
        )}

        {scanResult?.volunteer && (
          <div className="volunteer-details">
            <h3>Volunteer Details</h3>
            <div className="details-grid">
              <div className="detail-item">
                <div>
                  <div className="detail-label">Name</div>
                  <div className="detail-value">{scanResult.volunteer.name}</div>
                </div>
              </div>
              <div className="detail-item">
                <div>
                  <div className="detail-label">Sewa Code</div>
                  <div className="detail-value">{scanResult.volunteer.sewaCode}</div>
                </div>
              </div>
              <div className="detail-item">
                <div>
                  <div className="detail-label">Sewa Area</div>
                  <div className="detail-value">
                    {scanResult.volunteer.sewaArea} - {sewaAreas[scanResult.volunteer.sewaArea]}
                  </div>
                </div>
              </div>
              <div className="detail-item">
                <div>
                  <div className="detail-label">Phone</div>
                  <div className="detail-value">{scanResult.volunteer.phone}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
