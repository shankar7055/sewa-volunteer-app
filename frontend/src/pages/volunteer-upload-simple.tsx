"use client"

import type React from "react"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import * as XLSX from "xlsx"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { volunteerStorage } from "../lib/volunteer-storage"
import type { SewaAreaCode, Volunteer } from "../types/volunteer"

export default function SimpleVolunteerUpload() {
  const [file, setFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [results, setResults] = useState<string[]>([])
  const navigate = useNavigate()

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      console.log("✅ File selected:", selectedFile.name)
      setFile(selectedFile)
      setResults([])
    }
  }

  const processFile = async () => {
    if (!file) {
      alert("Please select a file first!")
      return
    }

    console.log("🚀 Starting file processing...")
    setIsProcessing(true)
    setResults(["Starting upload process..."])

    try {
      // CLEAR EXISTING VOLUNTEERS FIRST
      console.log("🗑️ Clearing existing volunteers...")
      if (typeof window !== "undefined") {
        localStorage.setItem("sewa_volunteers", JSON.stringify([]))
      }
      setResults((prev) => [...prev, "✅ Cleared all existing volunteers"])

      // Read the Excel file
      console.log("📖 Reading Excel file...")
      const buffer = await file.arrayBuffer()
      const workbook = XLSX.read(buffer, { type: "array" })
      const sheet = workbook.Sheets[workbook.SheetNames[0]]
      const data = XLSX.utils.sheet_to_json(sheet) as any[]

      console.log("📊 Excel data:", data)
      setResults((prev) => [...prev, `Found ${data.length} rows in Excel file`])

      // Process each row
      let successCount = 0
      const newVolunteers: Volunteer[] = []

      for (let i = 0; i < data.length; i++) {
        const row = data[i]

        // Extract data from row
        const name = String(row.Name || row.name || "").trim()
        const email = String(row.Email || row.email || "").trim()
        const phone = String(row.Phone || row.phone || "").trim()
        const sewaArea = String(row.SewaArea || row.sewaArea || "01").trim() as SewaAreaCode

        if (!name || !email) {
          console.log(`❌ Skipping row ${i + 1} - missing name or email`)
          setResults((prev) => [...prev, `Skipped row ${i + 1}: missing name or email`])
          continue
        }

        // Create volunteer object
        const newVolunteer: Volunteer = {
          id: `vol_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          name,
          email,
          phone,
          sewaCode: `${sewaArea}-${String(i + 1).padStart(3, "0")}-${Date.now().toString().slice(-4)}`,
          sewaArea,
          status: "active",
          isPresent: false,
          createdAt: new Date().toISOString(),
        }

        newVolunteers.push(newVolunteer)
        successCount++
        console.log(`✅ Prepared volunteer ${i + 1}:`, newVolunteer.name)
        setResults((prev) => [...prev, `✅ Prepared: ${newVolunteer.name}`])

        // Small delay to show progress
        await new Promise((resolve) => setTimeout(resolve, 50))
      }

      // Save all new volunteers at once
      if (typeof window !== "undefined") {
        localStorage.setItem("sewa_volunteers", JSON.stringify(newVolunteers))
      }

      const finalCount = newVolunteers.length
      console.log("📊 Final volunteer count:", finalCount)
      setResults((prev) => [...prev, `💾 Saved ${finalCount} volunteers to storage`])
      setResults((prev) => [...prev, `🎉 Upload complete! Replaced all volunteers with ${successCount} new ones!`])

      // Show success message
      alert(`Upload complete! Replaced all existing volunteers with ${successCount} new volunteers.`)
    } catch (error) {
      console.error("❌ Error processing file:", error)
      setResults((prev) => [...prev, `Error: ${error instanceof Error ? error.message : "Unknown error"}`])
      alert("Error processing file: " + (error instanceof Error ? error.message : "Unknown error"))
    } finally {
      setIsProcessing(false)
    }
  }

  const checkStorage = () => {
    const count = volunteerStorage.getCount()
    const volunteers = volunteerStorage.getAll()
    console.log("🔍 Storage check:", { count, volunteers: volunteers.map((v) => v.name) })
    alert(`Storage has ${count} volunteers: ${volunteers.map((v) => v.name).join(", ")}`)
  }

  const clearStorage = () => {
    if (
      confirm("Are you sure you want to clear all volunteers? This will remove ALL volunteers including uploaded ones.")
    ) {
      volunteerStorage.clear()
      alert("Storage cleared! Reset to original 5 volunteers.")
      setResults([])
    }
  }

  const showAllVolunteers = () => {
    const volunteers = volunteerStorage.getAll()
    const volunteerList = volunteers.map((v, index) => `${index + 1}. ${v.name} (${v.email})`).join("\n")
    alert(`All ${volunteers.length} volunteers:\n\n${volunteerList}`)
  }

  // Get current stats
  const volunteers = volunteerStorage.getAll()
  const stats = {
    total: volunteers.length,
    present: volunteers.filter((v) => v.isPresent).length,
    absent: volunteers.filter((v) => !v.isPresent).length,
    attendanceRate:
      volunteers.length > 0 ? Math.round((volunteers.filter((v) => v.isPresent).length / volunteers.length) * 100) : 0,
  }

  return (
    <div className="space-y-8 p-6">
      <h1 className="text-2xl font-bold">SEWA Volunteer Management</h1>

      
      

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Excel File</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Input type="file" accept=".xlsx,.xls" onChange={handleFileSelect} disabled={isProcessing} />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button onClick={processFile} disabled={!file || isProcessing}>
              {isProcessing ? "Processing..." : "Upload File"}
            </Button>

            <Button variant="outline" onClick={checkStorage}>
              Check Storage
            </Button>

            <Button variant="outline" onClick={showAllVolunteers}>
              Show All Volunteers
            </Button>

            <Button variant="outline" onClick={clearStorage}>
              Clear All Storage
            </Button>
          </div>

          {results.length > 0 && (
            <div className="bg-gray-100 p-4 rounded max-h-64 overflow-y-auto">
              <h3 className="font-medium mb-2">Process Log:</h3>
              {results.map((result, index) => (
                <div key={index} className="text-sm py-1">
                  {result}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p className="font-medium text-red-600">
              ⚠️ <strong>Upload File:</strong> This will REPLACE all existing volunteers with new ones from the Excel
              file
            </p>
            <p>
              <strong>Excel Format:</strong> Columns should be Name, Email, Phone, SewaArea
            </p>
            <p>
              <strong>SewaArea:</strong> Use values like 01, 02, 03, etc.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
