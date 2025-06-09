// src/lib/api.ts

// Mock API base URL for development
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api"

// ----------------------
// Interfaces
// ----------------------

interface User {
  id: string
  name: string
  email: string
  role: string
}

interface LoginResponse {
  user: User
  token: string
  message: string
}

interface Volunteer {
  id: string
  name: string
  email?: string
  phone?: string
}

interface DashboardStats {
  totalVolunteers: number
  activeVolunteers: number
  eventsCompleted: number
}

// ----------------------
// Auth API
// ----------------------

export const authApi = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    await new Promise(resolve => setTimeout(resolve, 1000))

    if (password === "password" || password === "admin123") {
      return {
        user: {
          id: "1",
          name: "Admin User",
          email: email,
          role: "admin"
        },
        token: "mock-jwt-token-123",
        message: "Login successful"
      }
    }

    throw new Error("Invalid credentials")
  },

  register: async (userData: any) => {
    await new Promise(resolve => setTimeout(resolve, 1000))
    throw new Error("Registration not implemented yet")
  },

  getProfile: async () => {
    await new Promise(resolve => setTimeout(resolve, 500))
    throw new Error("Profile API not implemented yet")
  },

  updateProfile: async (userData: any) => {
    await new Promise(resolve => setTimeout(resolve, 1000))
    throw new Error("Update profile not implemented yet")
  },
}

// ----------------------
// Volunteers API
// ----------------------

export const volunteersApi = {
  getAll: async (): Promise<Volunteer[]> => {
    await new Promise(resolve => setTimeout(resolve, 1000))
    return [
      { id: "1", name: "Volunteer A", email: "a@example.com", phone: "1234567890" },
      { id: "2", name: "Volunteer B", email: "b@example.com", phone: "9876543210" },
    ]
  },

  create: async (volunteerData: Volunteer): Promise<Volunteer> => {
    await new Promise(resolve => setTimeout(resolve, 1000))
    return { ...volunteerData, id: String(Date.now()) }
  },

  delete: async (id: string): Promise<{ message: string }> => {
    await new Promise(resolve => setTimeout(resolve, 1000))
    return { message: `Volunteer with id ${id} deleted.` }
  },
}

// ----------------------
// Dashboard API
// ----------------------

export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    await new Promise(resolve => setTimeout(resolve, 1000))
    return {
      totalVolunteers: 42,
      activeVolunteers: 38,
      eventsCompleted: 12,
    }
  },
}
