"use client"

import type React from "react"

import { Download, FileText, Upload } from "lucide-react"
import { useState } from "react"

interface UploadTabProps {
  sewaAreas: Record<string, string>
}

export default function UploadTab({ sewaAreas }: UploadTabProps) {
  const [uploadStatus, setUploadStatus] = useState<"idle" | "processing" | "success" | "error">("idle")

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploadStatus("processing")

    // Simulate file processing
    setTimeout(() => {
      setUploadStatus("success")
    }, 2000)
  }

  const downloadTemplate = () => {
    const csvContent = [
      ["Sewa Code", "Name", "Phone", "Sewa Area"],
      ["01-001", "John Doe", "+91 9876543210", "01"],
      ["02-001", "Jane Smith", "+91 9876543211", "02"],
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "volunteer-template.csv"
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="card">
      <div className="card-content">
        <div className="upload-section">
          <div className="template-section">
            <h3>
              <FileText className="w-4 h-4" />
              Download Template
            </h3>
            <p>Download the CSV template to ensure your data is formatted correctly.</p>
            <button onClick={downloadTemplate} className="template-btn">
              <Download className="w-4 h-4" />
              Download Template
            </button>
          </div>

          <div className="file-upload">
            <label htmlFor="volunteer-file">Upload Volunteer Data</label>
            <input type="file" id="volunteer-file" accept=".csv,.xlsx" onChange={handleFileUpload} />
            <p>Supported formats: CSV, Excel (.xlsx)</p>
          </div>

          {uploadStatus !== "idle" && (
            <div className={`upload-status ${uploadStatus}`}>
              {uploadStatus === "processing" && (
                <>
                  <Upload className="w-4 h-4" />
                  Processing file...
                </>
              )}
              {uploadStatus === "success" && "File uploaded successfully!"}
              {uploadStatus === "error" && "Error uploading file. Please check the format."}
            </div>
          )}

          <div className="sewa-areas-reference">
            <h3>Sewa Area Codes Reference</h3>
            <div className="codes-grid">
              {Object.entries(sewaAreas).map(([code, name]) => (
                <div key={code} className="code-item">
                  <span className="code-number">{code}</span>
                  <span>{name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
