"use client"

import { Download, QrCode } from "lucide-react"
import { useState } from "react"

interface QRCodesTabProps {
  volunteers: any[]
  sewaAreas: Record<string, string>
}

export default function QRCodesTab({ volunteers, sewaAreas }: QRCodesTabProps) {
  const [filterArea, setFilterArea] = useState("")

  const filteredVolunteers = volunteers.filter((volunteer) => !filterArea || volunteer.sewaArea === filterArea)

  const downloadQR = (volunteer: any) => {
    // Mock QR download
    console.log(`Downloading QR for ${volunteer.name}`)
  }

  const downloadAllQRs = () => {
    // Mock bulk download
    console.log("Downloading all QR codes")
  }

  return (
    <div className="card">
      <div className="card-content">
        <div className="qr-controls">
          <select value={filterArea} onChange={(e) => setFilterArea(e.target.value)}>
            <option value="">All Areas</option>
            {Object.entries(sewaAreas).map(([code, name]) => (
              <option key={code} value={code}>
                {code} - {name}
              </option>
            ))}
          </select>
          <button onClick={downloadAllQRs} className="download-all-btn">
            <Download className="w-4 h-4" />
            Download All QR Codes
          </button>
        </div>

        <div className="qr-codes-grid">
          {filteredVolunteers.map((volunteer) => (
            <div key={volunteer.id} className="qr-card">
              <div className="qr-image">
                <QrCode className="w-16 h-16 text-gray-400" />
              </div>
              <div className="qr-info">
                <div className="volunteer-name-qr">{volunteer.name}</div>
                <div className="volunteer-details-qr">
                  {volunteer.sewaCode} • {sewaAreas[volunteer.sewaArea]}
                </div>
                <div className="volunteer-details-qr">{volunteer.phone}</div>
              </div>
              <button onClick={() => downloadQR(volunteer)} className="download-qr-btn">
                <Download className="w-4 h-4" />
                Download QR
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
