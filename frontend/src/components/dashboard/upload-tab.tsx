"use client"

import type React from "react"

import { useState } from "react"
import { Upload, Download, FileSpreadsheet } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface UploadTabProps {
  sewaAreas: Record<string, string>
}

export default function UploadTab({ sewaAreas }: UploadTabProps) {
  const [uploadStatus, setUploadStatus] = useState<{
    type: "success" | "error" | "processing" | null
    message: string
  }>({ type: null, message: "" })

  const { toast } = useToast()

  const downloadTemplate = () => {
    const csvContent = [
      ["Full Name", "Phone Number", "Sewa Area Code", "Password"],
      ["John Doe", "+91-9876543210", "01", "password123"],
      ["Jane Smith", "+91-9876543211", "02", "password456"],
      ["", "", "", ""],
      ["", "Sewa Area Codes:", "", ""],
      ...Object.entries(sewaAreas).map(([code, name]) => ["", `${code} - ${name}`, "", ""]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "volunteer-upload-template.csv"
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploadStatus({ type: "processing", message: "Processing file..." })

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        const lines = text.split("\n").filter((line) => line.trim())
        const headers = lines[0].split(",").map((h) => h.trim())

        // Validate headers
        const requiredHeaders = ["Full Name", "Phone Number", "Sewa Area Code", "Password"]
        const hasAllHeaders = requiredHeaders.every((header) =>
          headers.some((h) => h.toLowerCase().includes(header.toLowerCase())),
        )

        if (!hasAllHeaders) {
          throw new Error("Invalid file format. Please use the provided template.")
        }

        const newVolunteers = []
        const areaCounters: Record<string, number> = {}

        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(",").map((v) => v.trim())
          if (values.length < 4 || !values[0] || !values[1] || !values[2]) continue

          const [name, phone, areaCode] = values

          if (!sewaAreas[areaCode]) {
            console.warn(`Invalid area code: ${areaCode} for volunteer: ${name}`)
            continue
          }

          if (!areaCounters[areaCode]) {
            areaCounters[areaCode] = 0
          }

          const sewaCode = `${areaCode}-${String(areaCounters[areaCode] + 1).padStart(3, "0")}`
          areaCounters[areaCode]++

          newVolunteers.push({
            id: Date.now() + i,
            sewaCode,
            name,
            phone,
            sewaArea: areaCode,
            isPresent: false,
            checkInTime: null,
          })
        }

        if (newVolunteers.length === 0) {
          throw new Error("No valid volunteer data found in the file.")
        }

        setUploadStatus({
          type: "success",
          message: `Successfully uploaded ${newVolunteers.length} volunteers with auto-generated Sewa Codes.`,
        })

        toast({
          title: "Upload Successful",
          description: `${newVolunteers.length} volunteers uploaded successfully`,
        })

        // Reset file input
        event.target.value = ""
      } catch (error) {
        setUploadStatus({
          type: "error",
          message: error instanceof Error ? error.message : "Upload failed",
        })
      }
    }

    reader.readAsText(file)
  }

  return (
    <div className="card">
      <div className="card-header">
        <h2>
          <Upload className="w-5 h-5" /> Upload Volunteers
        </h2>
        <p>Upload volunteer data via Excel or CSV file</p>
      </div>
      <div className="card-content">
        <div className="upload-section">
          <div className="template-section">
            <h3>
              <FileSpreadsheet className="w-5 h-5" /> Download Template
            </h3>
            <p>Use our template to ensure proper formatting</p>
            <button onClick={downloadTemplate} className="template-btn">
              <Download className="w-4 h-4" />
              Download CSV Template
            </button>
          </div>

          <div className="file-upload">
            <label htmlFor="fileInput">Upload Volunteer File</label>
            <input type="file" id="fileInput" accept=".csv,.xlsx,.xls" onChange={handleFileUpload} />
            <p>Supported formats: CSV, Excel (.xlsx, .xls)</p>
          </div>

          {uploadStatus.type && <div className={`upload-status ${uploadStatus.type}`}>{uploadStatus.message}</div>}

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
