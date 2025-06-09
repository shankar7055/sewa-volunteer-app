import type { DashboardStats, SewaAreaCode, User, Volunteer } from "../types/volunteer"

// Mock API functions for development
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api"

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// Update mockVolunteers with proper typing
const mockVolunteers: Volunteer[] = [
  {
    id: "1",
    name: "Rajesh Kumar",
    email: "rajesh@example.com",
    phone: "+91 9876543210",
    sewaCode: "01-001",
    sewaArea: "01",
    status: "active",
    createdAt: new Date().toISOString(),
    isPresent: true,
  },
  {
    id: "2",
    name: "Priya Sharma",
    email: "priya@example.com",
    phone: "+91 9876543211",
    sewaCode: "02-001",
    sewaArea: "02",
    status: "active",
    createdAt: new Date().toISOString(),
    isPresent: true,
  },
  {
    id: "3",
    name: "Amit Singh",
    email: "amit@example.com",
    phone: "+91 9876543212",
    sewaCode: "01-002",
    sewaArea: "01",
    status: "active",
    createdAt: new Date().toISOString(),
    isPresent: false,
  },
  {
    id: "4",
    name: "Sunita Patel",
    email: "sunita@example.com",
    phone: "+91 9876543213",
    sewaCode: "03-001",
    sewaArea: "03",
    status: "active",
    createdAt: new Date().toISOString(),
    isPresent: true,
  },
  {
    id: "5",
    name: "Ravi Gupta",
    email: "ravi@example.com",
    phone: "+91 9876543214",
    sewaCode: "04-001",
    sewaArea: "04",
    status: "active",
    createdAt: new Date().toISOString(),
    isPresent: false,
  },
]

// Fixed stats that won't change
const fixedStats: DashboardStats = {
  totalVolunteers: mockVolunteers.length,
  presentVolunteers: mockVolunteers.filter((v) => v.isPresent).length,
  absentVolunteers: mockVolunteers.filter((v) => !v.isPresent).length,
  attendanceRate: Math.round((mockVolunteers.filter((v) => v.isPresent).length / mockVolunteers.length) * 100),
}

// Update sewaAreaStats with proper typing
const sewaAreaStats: Record<SewaAreaCode, { present: number; total: number }> = {
  "01": { present: 1, total: 2 },
  "02": { present: 1, total: 1 },
  "03": { present: 1, total: 1 },
  "04": { present: 0, total: 1 },
  "05": { present: 0, total: 0 },
  "06": { present: 0, total: 0 },
  "07": { present: 0, total: 0 },
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
    await delay(500)
    return mockVolunteers
  },

  async getById(id: string): Promise<Volunteer> {
    await delay(300)
    const volunteer = mockVolunteers.find((v) => v.id === id)
    if (!volunteer) throw new Error("Volunteer not found")
    return volunteer
  },

  async create(data: Partial<Volunteer>): Promise<Volunteer> {
    await delay(500)
    const newVolunteer: Volunteer = {
      id: Date.now().toString(),
      name: data.name || "",
      email: data.email || "",
      phone: data.phone || "",
      sewaCode: data.sewaCode || "",
      sewaArea: data.sewaArea || "01",
      status: "active",
      isPresent: false,
      createdAt: new Date().toISOString(),
    }
    mockVolunteers.push(newVolunteer)

    // Update fixed stats
    fixedStats.totalVolunteers = mockVolunteers.length
    fixedStats.presentVolunteers = mockVolunteers.filter((v) => v.isPresent).length
    fixedStats.absentVolunteers = mockVolunteers.filter((v) => !v.isPresent).length
    fixedStats.attendanceRate = Math.round((fixedStats.presentVolunteers / fixedStats.totalVolunteers) * 100)

    return newVolunteer
  },

  async update(id: string, data: Partial<Volunteer>): Promise<Volunteer> {
    await delay(500)
    const index = mockVolunteers.findIndex((v) => v.id === id)
    if (index === -1) throw new Error("Volunteer not found")
    mockVolunteers[index] = { ...mockVolunteers[index], ...data }
    return mockVolunteers[index]
  },

  async delete(id: string): Promise<{ success: boolean }> {
    await delay(300)
    const index = mockVolunteers.findIndex((v) => v.id === id)
    if (index === -1) throw new Error("Volunteer not found")
    mockVolunteers.splice(index, 1)

    // Update fixed stats
    fixedStats.totalVolunteers = mockVolunteers.length
    fixedStats.presentVolunteers = mockVolunteers.filter((v) => v.isPresent).length
    fixedStats.absentVolunteers = mockVolunteers.filter((v) => !v.isPresent).length
    fixedStats.attendanceRate = Math.round((fixedStats.presentVolunteers / fixedStats.totalVolunteers) * 100)

    return { success: true }
  },

  async generateQR(id: string): Promise<{ qrCode: string }> {
    await delay(500)
    return { qrCode: `QR-${id}-${Date.now()}` }
  },

  async recordAttendance(qrData: string): Promise<{ success: boolean; volunteerName: string; timestamp: string }> {
    await delay(300)
    // Mock attendance recording
    return {
      success: true,
      volunteerName: "Mock Volunteer",
      timestamp: new Date().toISOString(),
    }
  },
}

export const dashboardApi = {
  async getStats(): Promise<DashboardStats> {
    await delay(300)
    return fixedStats
  },

  async getSewaAreaStats(): Promise<Record<SewaAreaCode, { present: number; total: number }>> {
    await delay(300)
    return sewaAreaStats
  },
}
