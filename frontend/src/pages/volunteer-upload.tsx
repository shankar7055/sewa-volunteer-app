"use client"

import type React from "react"

import { AlertCircle, ArrowLeft, CheckCircle, FileSpreadsheet, Upload } from "lucide-react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import * as XLSX from "xlsx"

import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Progress } from "../components/ui/progress"
import { useToast } from "../components/ui/use-toast"

import { volunteersApi } from "../lib/api"
import { useVolunteersStore } from "../lib/store"
import { volunteerStorage } from "../lib/volunteer-storage"
import { SEWA_AREAS, type SewaAreaCode } from "../types/volunteer"

interface ParsedVolunteer {
  name: string
  email: string
  phone: string
  sewaArea: SewaAreaCode
  sewaCode?: string
  rowIndex?: number
}

export default function VolunteerUploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [previewData, setPreviewData] = useState<ParsedVolunteer[]>([])
  const [uploadResults, setUploadResults] = useState<{
    successful: number
    failed: number
    errors: string[]
  } | null>(null)

  const navigate = useNavigate()
  const { toast } = useToast()
  const { setVolunteers } = useVolunteersStore()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    setFile(selectedFile)
    setPreviewData([])
    setUploadResults(null)

    // Parse Excel file for preview
    try {
      console.log("📊 Reading Excel file:", selectedFile.name)
      const buffer = await selectedFile.arrayBuffer()
      const workbook = XLSX.read(buffer, { type: "array" })
      const sheetName = workbook.SheetNames[0]
      const sheet = workbook.Sheets[sheetName]
      const data = XLSX.utils.sheet_to_json(sheet) as any[]

      console.log("📊 Raw Excel data:", data)

      const parsed = data
        .map((row, index) => {
          // Handle different possible column names
          const name = row.Name || row.name || row.FullName || row["Full Name"] || ""
          const email = row.Email || row.email || row.EmailAddress || row["Email Address"] || ""
          const phone =
            row.Phone || row.phone || row.PhoneNumber || row["Phone Number"] || row.Mobile || row.mobile || ""
          const sewaArea = row.SewaArea || row["Sewa Area"] || row.sewaArea || row.Area || row.area || "01"

          return {
            name: String(name).trim(),
            email: String(email).trim(),
            phone: String(phone).trim(),
            sewaArea: String(sewaArea).trim() as SewaAreaCode,
            rowIndex: index + 2, // Excel row number (accounting for header)
          }
        })
        .filter((item) => item.name && item.email) // Filter out empty rows

      console.log("📊 Parsed volunteer data:", parsed)
      setPreviewData(parsed)

      toast({
        title: "File Parsed Successfully",
        description: `Found ${parsed.length} valid volunteer records`,
      })
    } catch (error) {
      console.error("❌ Error parsing Excel file:", error)
      toast({
        variant: "destructive",
        title: "Parse Error",
        description: "Failed to parse Excel file. Please check the format.",
      })
    }
  }

  const generateSewaCode = (sewaArea: SewaAreaCode, index: number): string => {
    // Get current timestamp to make codes unique
    const timestamp = Date.now().toString().slice(-4)
    const paddedIndex = String(index + 1).padStart(3, "0")
    return `${sewaArea}-${paddedIndex}-${timestamp}`
  }

  const handleUpload = async () => {
    if (!file || previewData.length === 0) return

    setIsUploading(true)
    setUploadProgress(0)
    setUploadResults({ successful: 0, failed: 0, errors: [] })

    const results = { successful: 0, failed: 0, errors: [] as string[] }

    try {
      console.log("📤 Starting volunteer upload process...")
      console.log("📤 Will upload", previewData.length, "volunteers")

      // Check current storage state before upload
      console.log("📊 Storage state BEFORE upload:", volunteerStorage.getCount())
      volunteerStorage.debugStorage()

      // Process volunteers one by one
      for (let i = 0; i < previewData.length; i++) {
        const volunteerData = previewData[i]

        try {
          // Generate unique sewa code
          const sewaCode = generateSewaCode(volunteerData.sewaArea, i)

          console.log(`📤 Creating volunteer ${i + 1}/${previewData.length}:`, {
            name: volunteerData.name,
            email: volunteerData.email,
            sewaCode,
          })

          const newVolunteer = await volunteersApi.create({
            ...volunteerData,
            sewaCode,
            status: "active",
          })

          console.log(`✅ Successfully created volunteer:`, newVolunteer.name)
          results.successful++
        } catch (error) {
          console.error(`❌ Failed to create volunteer ${volunteerData.name}:`, error)
          results.failed++
          results.errors.push(
            `Row ${volunteerData.rowIndex}: ${volunteerData.name} - ${error instanceof Error ? error.message : "Unknown error"}`,
          )
        }

        // Update progress
        const progress = ((i + 1) / previewData.length) * 100
        setUploadProgress(progress)
        setUploadResults({ ...results })

        // Small delay to show progress
        await new Promise((resolve) => setTimeout(resolve, 50))
      }

      // Check storage state after upload
      console.log("📊 Storage state AFTER upload:", volunteerStorage.getCount())
      volunteerStorage.debugStorage()

      // Refresh volunteers list from storage (not API to avoid confusion)
      console.log("🔄 Refreshing volunteer list from storage...")
      const allVolunteers = volunteerStorage.getAll()
      console.log("📋 Updated volunteer list from storage:", allVolunteers.length, "volunteers")
      setVolunteers(allVolunteers)

      toast({
        title: "Upload Complete",
        description: `Successfully uploaded ${results.successful} volunteers. ${results.failed} failed.`,
        variant: results.failed > 0 ? "destructive" : "default",
      })

      // Navigate back to volunteers page after successful upload
      if (results.successful > 0) {
        setTimeout(() => {
          navigate("/volunteers")
        }, 2000)
      }
    } catch (error) {
      console.error("❌ Upload error:", error)
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="icon" onClick={() => navigate("/volunteers")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Upload Volunteers</h1>
      </div>

      {/* Upload Card */}
      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileSpreadsheet className="h-5 w-5" />
            <span>Excel File Upload</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="file" className="block text-sm font-medium mb-2">
                Select Excel File (.xlsx, .xls)
              </label>
              <Input
                id="file"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                disabled={isUploading}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
              />
            </div>

            <div className="text-sm text-gray-600">
              <p className="font-medium mb-2">Expected Excel columns:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>
                  <strong>Name</strong> or <strong>Full Name</strong> - Volunteer's full name
                </li>
                <li>
                  <strong>Email</strong> or <strong>Email Address</strong> - Email address
                </li>
                <li>
                  <strong>Phone</strong> or <strong>Phone Number</strong> - Phone number
                </li>
                <li>
                  <strong>Sewa Area</strong> or <strong>Area</strong> - Sewa area code (01-07)
                </li>
              </ul>
            </div>
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Uploading volunteers...</span>
                <span>{Math.round(uploadProgress)}%</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          )}

          {/* Upload Results */}
          {uploadResults && !isUploading && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span>Successful: {uploadResults.successful}</span>
                </div>
                <div className="flex items-center space-x-2 text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  <span>Failed: {uploadResults.failed}</span>
                </div>
              </div>

              {uploadResults.errors.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-red-600">Errors:</h4>
                  <div className="max-h-32 overflow-y-auto bg-red-50 p-3 rounded text-sm">
                    {uploadResults.errors.map((error, index) => (
                      <div key={index} className="text-red-700">
                        {error}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            <Button variant="outline" onClick={() => navigate("/volunteers")} disabled={isUploading}>
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={!file || previewData.length === 0 || isUploading}>
              <Upload className="mr-2 h-4 w-4" />
              {isUploading ? "Uploading..." : `Upload ${previewData.length} Volunteers`}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview Card */}
      {previewData.length > 0 && (
        <Card className="max-w-4xl">
          <CardHeader>
            <CardTitle>Preview ({previewData.length} volunteers)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 font-medium">Name</th>
                    <th className="text-left p-2 font-medium">Email</th>
                    <th className="text-left p-2 font-medium">Phone</th>
                    <th className="text-left p-2 font-medium">Sewa Area</th>
                    <th className="text-left p-2 font-medium">Generated Code</th>
                  </tr>
                </thead>
                <tbody>
                  {previewData.slice(0, 10).map((volunteer, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="p-2">{volunteer.name}</td>
                      <td className="p-2">{volunteer.email}</td>
                      <td className="p-2">{volunteer.phone}</td>
                      <td className="p-2">
                        <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {volunteer.sewaArea} - {SEWA_AREAS[volunteer.sewaArea]}
                        </span>
                      </td>
                      <td className="p-2">
                        <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                          {generateSewaCode(volunteer.sewaArea, index)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {previewData.length > 10 && (
                <div className="text-center py-2 text-gray-500">... and {previewData.length - 10} more volunteers</div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
