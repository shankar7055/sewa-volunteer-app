import type { DashboardStats, SewaAreaCode, User, Volunteer } from "../types/volunteer"
import { generateQRDataUrl } from "./qr-utils"
import { volunteerStorage } from "./volunteer-storage"

// Mock API functions for development
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api"

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

function updateStats() {
  const volunteers = volunteerStorage.getAll()

  const stats = {
    totalVolunteers: volunteers.length,
    presentVolunteers: volunteers.filter((v) => v.isPresent).length,
    absentVolunteers: volunteers.filter((v) => !v.isPresent).length,
    attendanceRate:
      volunteers.length > 0 ? Math.round((volunteers.filter((v) => v.isPresent).length / volunteers.length) * 100) : 0,
  }

  console.log("📊 Stats updated:", stats)
  return stats
}

export const authApi = {
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    await delay(1000)

    // Mock authentication - in production, this would be a real API call
    if (password === "password") {
      return {
        user: {
          id: "1",
          name: "Admin User",
          email,
          sewaCode: email.split("@")[0],
        },
        token: "mock-jwt-token",
      }
    }

    throw new Error("Invalid credentials")
  },
}

export const volunteersApi = {
  async getAll(): Promise<Volunteer[]> {
    await delay(300)

    const volunteers = volunteerStorage.getAll()
    console.log("📋 API getAll() returning:", volunteers.length, "volunteers")

    return volunteers
  },

  async getById(id: string): Promise<Volunteer> {
    await delay(300)

    const volunteer = volunteerStorage.findById(id)
    if (!volunteer) throw new Error("Volunteer not found")

    return volunteer
  },

  async create(data: Partial<Volunteer>): Promise<Volunteer> {
    console.log("🚀 === API CREATE START ===")
    console.log("🚀 API CREATE called with:", data)

    await delay(100)

    // Generate a unique ID with timestamp
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(2, 9)
    const newId = `vol_${timestamp}_${randomId}`

    const newVolunteer: Volunteer = {
      id: newId,
      name: data.name || "",
      email: data.email || "",
      phone: data.phone || "",
      sewaCode: data.sewaCode || "",
      sewaArea: data.sewaArea || "01",
      status: "active",
      isPresent: false,
      createdAt: new Date().toISOString(),
    }

    console.log("📝 New volunteer object created:", newVolunteer)

    // Add to storage with detailed logging
    console.log("💾 About to call volunteerStorage.add()...")
    const saveResult = volunteerStorage.add(newVolunteer)
    console.log("💾 volunteerStorage.add() returned:", saveResult)

    if (saveResult) {
      console.log("✅ Volunteer saved successfully to storage")

      // Double-check by getting fresh data
      const freshCount = volunteerStorage.getCount()
      console.log("🔍 Fresh count from storage:", freshCount)

      // Force a debug check
      volunteerStorage.debugStorage()
    } else {
      console.log("❌ Failed to save volunteer to storage")
      throw new Error("Failed to save volunteer")
    }

    console.log("🚀 === API CREATE END ===")
    return newVolunteer
  },

  async update(id: string, data: Partial<Volunteer>): Promise<Volunteer> {
    await delay(300)

    const updatedVolunteer = volunteerStorage.update(id, data)
    if (!updatedVolunteer) throw new Error("Volunteer not found")

    updateStats()
    return updatedVolunteer
  },

  async delete(id: string): Promise<{ success: boolean }> {
    await delay(300)

    const success = volunteerStorage.remove(id)
    if (!success) throw new Error("Volunteer not found")

    updateStats()
    return { success: true }
  },

  // Enhanced QR generation - returns data URL instead of simple string
  async generateQR(id: string): Promise<string> {
    await delay(500)

    try {
      // Get volunteer data
      const volunteer = volunteerStorage.findById(id)
      if (!volunteer) {
        throw new Error("Volunteer not found")
      }

      // Generate QR code with volunteer data
      const qrData = JSON.stringify({
        id: volunteer.id,
        code: volunteer.sewaCode,
        name: volunteer.name,
        timestamp: Date.now(),
      })

      // Generate actual QR code as data URL
      const qrDataUrl = await generateQRDataUrl(qrData)

      console.log("✅ QR code generated successfully for:", volunteer.name)
      return qrDataUrl
    } catch (error) {
      console.error("❌ Error generating QR code:", error)
      throw new Error("Failed to generate QR code")
    }
  },

  // Generate QR codes for multiple volunteers
  async generateBulkQRs(volunteerIds: string[]): Promise<string[]> {
    await delay(500)

    try {
      const qrDataUrls: string[] = []

      for (const id of volunteerIds) {
        const qrDataUrl = await this.generateQR(id)
        qrDataUrls.push(qrDataUrl)
      }

      console.log("✅ Bulk QR codes generated successfully for", volunteerIds.length, "volunteers")
      return qrDataUrls
    } catch (error) {
      console.error("❌ Error generating bulk QR codes:", error)
      throw new Error("Failed to generate bulk QR codes")
    }
  },

  async recordAttendance(qrData: string): Promise<{ success: boolean; volunteerName: string; timestamp: string }> {
    await delay(300)

    try {
      // Parse QR data
      const parsedData = JSON.parse(qrData)
      const volunteer = volunteerStorage.findById(parsedData.id)

      if (!volunteer) {
        throw new Error("Volunteer not found")
      }

      // Update attendance
      const updatedVolunteer = volunteerStorage.update(parsedData.id, { isPresent: true })

      if (!updatedVolunteer) {
        throw new Error("Failed to update attendance")
      }

      updateStats()

      return {
        success: true,
        volunteerName: volunteer.name,
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      console.error("❌ Error recording attendance:", error)
      return {
        success: false,
        volunteerName: "Unknown",
        timestamp: new Date().toISOString(),
      }
    }
  },

  // Debug method
  async debug(): Promise<{ count: number; volunteers: string[] }> {
    console.log("🔍 === API DEBUG START ===")

    // Get fresh data
    const volunteers = volunteerStorage.forceRefresh()

    console.log("🔍 API Debug - Fresh volunteers:", volunteers.length)
    console.log(
      "🔍 API Debug - Volunteer names:",
      volunteers.map((v) => v.name),
    )

    // Also run storage debug
    volunteerStorage.debugStorage()

    console.log("🔍 === API DEBUG END ===")

    return {
      count: volunteers.length,
      volunteers: volunteers.map((v) => v.name),
    }
  },
}

export const dashboardApi = {
  async getStats(): Promise<DashboardStats> {
    await delay(300)
    return updateStats()
  },

  async getSewaAreaStats(): Promise<Record<SewaAreaCode, { present: number; total: number }>> {
    await delay(300)

    const volunteers = volunteerStorage.getAll()
    const sewaAreaStats: Record<SewaAreaCode, { present: number; total: number }> = {
      "01": { present: 0, total: 0 },
      "02": { present: 0, total: 0 },
      "03": { present: 0, total: 0 },
      "04": { present: 0, total: 0 },
      "05": { present: 0, total: 0 },
      "06": { present: 0, total: 0 },
      "07": { present: 0, total: 0 },
    }

    volunteers.forEach((v) => {
      if (sewaAreaStats[v.sewaArea]) {
        sewaAreaStats[v.sewaArea].total += 1
        if (v.isPresent) {
          sewaAreaStats[v.sewaArea].present += 1
        }
      }
    })

    return sewaAreaStats
  },
}
