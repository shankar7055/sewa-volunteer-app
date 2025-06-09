"use client"

import { useState, useEffect } from "react"
import { QrCode, Download, CloudDownload } from "lucide-react"

interface Volunteer {
  id: number
  sewaCode: string
  name: string
  phone: string
  sewaArea: string
}

interface QRCodesTabProps {
  volunteers: Volunteer[]
  sewaAreas: Record<string, string>
}

export default function QRCodesTab({ volunteers, sewaAreas }: QRCodesTabProps) {
  const [selectedArea, setSelectedArea] = useState("all")
  const [filteredVolunteers, setFilteredVolunteers] = useState(volunteers)

  useEffect(() => {
    const filtered = selectedArea === "all" ? volunteers : volunteers.filter((v) => v.sewaArea === selectedArea)
    setFilteredVolunteers(filtered)
  }, [selectedArea, volunteers])

  const downloadQRCode = async (volunteer: Volunteer) => {
    const qrData = JSON.stringify({
      sewaCode: volunteer.sewaCode,
      name: volunteer.name,
      phone: volunteer.phone,
      sewaArea: volunteer.sewaArea,
      areaName: sewaAreas[volunteer.sewaArea],
    })

    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`

    try {
      const response = await fetch(qrUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `QR_${volunteer.sewaCode}_${volunteer.name.replace(/\s+/g, "_")}.png`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Failed to download QR code:", error)
      alert("Failed to download QR code. Please try again.")
    }
  }

  const downloadAllQRCodes = () => {
    if (filteredVolunteers.length === 0) {
      alert("No volunteers found for the selected area.")
      return
    }

    // Download QR codes one by one with a delay
    let index = 0
    const downloadNext = () => {
      if (index >= filteredVolunteers.length) return

      const volunteer = filteredVolunteers[index]
      downloadQRCode(volunteer)

      index++
      setTimeout(downloadNext, 500) // 500ms delay between downloads
    }

    downloadNext()
  }

  return (
    <div className="card">
      <div className="card-header">
        <h2>
          <QrCode className="w-5 h-5" /> QR Code Generator
        </h2>
        <p>Generate unique QR codes for volunteers</p>
      </div>
      <div className="card-content">
        <div className="qr-controls">
          <select value={selectedArea} onChange={(e) => setSelectedArea(e.target.value)}>
            <option value="all">All Areas</option>
            {Object.entries(sewaAreas).map(([code, name]) => (
              <option key={code} value={code}>
                {name}
              </option>
            ))}
          </select>
          <button onClick={downloadAllQRCodes} className="download-all-btn">
            <CloudDownload className="w-4 h-4" />
            Download All
          </button>
        </div>

        <div className="qr-codes-grid">
          {filteredVolunteers.length > 0 ? (
            filteredVolunteers.map((volunteer) => {
              const qrData = JSON.stringify({
                sewaCode: volunteer.sewaCode,
                name: volunteer.name,
                phone: volunteer.phone,
                sewaArea: volunteer.sewaArea,
                areaName: sewaAreas[volunteer.sewaArea],
              })

              const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`

              return (
                <div key={volunteer.id} className="qr-card">
                  <div className="qr-image">
                    <img
                      src={qrUrl || "/placeholder.svg"}
                      alt={`QR Code for ${volunteer.name}`}
                      width="200"
                      height="200"
                      style={{ borderRadius: "8px" }}
                    />
                  </div>
                  <div className="qr-info">
                    <div className="volunteer-name-qr">
                      <i className="fas fa-user"></i>
                      {volunteer.name}
                    </div>
                    <div className="volunteer-details-qr">
                      <div className="sewa-code">{volunteer.sewaCode}</div>
                      <div>{volunteer.phone}</div>
                    </div>
                    <div className="area-badge">{sewaAreas[volunteer.sewaArea]}</div>
                  </div>
                  <button className="download-qr-btn" onClick={() => downloadQRCode(volunteer)}>
                    <Download className="w-4 h-4" />
                    Download QR
                  </button>
                </div>
              )
            })
          ) : (
            <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "3rem", color: "#64748b" }}>
              <QrCode style={{ fontSize: "3rem", marginBottom: "1rem", color: "#d1d5db" }} />
              <p>No volunteers found for the selected area</p>
              <p style={{ fontSize: "0.875rem" }}>Upload volunteers first to generate QR codes</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
