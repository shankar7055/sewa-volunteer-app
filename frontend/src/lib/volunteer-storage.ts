import type { Volunteer } from "../types/volunteer"

const STORAGE_KEY = "sewa_volunteers"

// Default volunteers data
const defaultVolunteers: Volunteer[] = [
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

// Initialize localStorage if it doesn't exist
function initializeStorage(): void {
  if (typeof window === "undefined") return

  const existing = localStorage.getItem(STORAGE_KEY)
  if (!existing) {
    console.log("🔧 Initializing localStorage with default volunteers")
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultVolunteers))
  } else {
    console.log("✅ localStorage already exists with data")
  }
}

// Helper functions to manage volunteer storage using localStorage
export const volunteerStorage = {
  getAll(): Volunteer[] {
    if (typeof window === "undefined") return defaultVolunteers

    try {
      initializeStorage()
      const stored = localStorage.getItem(STORAGE_KEY)
      const volunteers = stored ? JSON.parse(stored) : defaultVolunteers

      console.log("📋 Getting volunteers from localStorage:", volunteers.length)
      console.log(
        "📋 Volunteer names:",
        volunteers.map((v: Volunteer) => v.name),
      )

      return volunteers
    } catch (error) {
      console.error("❌ Error reading from localStorage:", error)
      return defaultVolunteers
    }
  },

  add(volunteer: Volunteer): boolean {
    if (typeof window === "undefined") {
      console.log("❌ Window is undefined, cannot save to localStorage")
      return false
    }

    try {
      console.log("🔄 STARTING ADD PROCESS for:", volunteer.name)

      // Get current volunteers
      const volunteers = this.getAll()
      console.log("📊 Current volunteers before add:", volunteers.length)

      // Add new volunteer
      volunteers.push(volunteer)
      console.log("📊 Volunteers array after push:", volunteers.length)
      console.log("📋 Last volunteer in array:", volunteers[volunteers.length - 1].name)

      // Save to localStorage
      const jsonString = JSON.stringify(volunteers)
      console.log("💾 Saving to localStorage, JSON length:", jsonString.length)

      localStorage.setItem(STORAGE_KEY, jsonString)
      console.log("✅ Successfully saved to localStorage")

      // Immediate verification
      const verification = localStorage.getItem(STORAGE_KEY)
      if (verification) {
        const parsed = JSON.parse(verification)
        console.log("🔍 IMMEDIATE VERIFICATION - localStorage now has:", parsed.length, "volunteers")
        console.log("🔍 VERIFICATION - Last volunteer:", parsed[parsed.length - 1].name)

        if (parsed.length === volunteers.length) {
          console.log("✅ VERIFICATION PASSED - Data saved correctly")
          return true
        } else {
          console.log("❌ VERIFICATION FAILED - Data not saved correctly")
          return false
        }
      } else {
        console.log("❌ VERIFICATION FAILED - No data in localStorage")
        return false
      }
    } catch (error) {
      console.error("❌ Error saving to localStorage:", error)
      return false
    }
  },

  update(id: string, updates: Partial<Volunteer>): Volunteer | null {
    if (typeof window === "undefined") return null

    try {
      const volunteers = this.getAll()
      const index = volunteers.findIndex((v) => v.id === id)
      if (index === -1) return null

      volunteers[index] = { ...volunteers[index], ...updates }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(volunteers))

      return volunteers[index]
    } catch (error) {
      console.error("❌ Error updating localStorage:", error)
      return null
    }
  },

  remove(id: string): boolean {
    if (typeof window === "undefined") return false

    try {
      const volunteers = this.getAll()
      const index = volunteers.findIndex((v) => v.id === id)
      if (index === -1) return false

      volunteers.splice(index, 1)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(volunteers))

      return true
    } catch (error) {
      console.error("❌ Error removing from localStorage:", error)
      return false
    }
  },

  findById(id: string): Volunteer | null {
    const volunteers = this.getAll()
    return volunteers.find((v) => v.id === id) || null
  },

  clear(): void {
    if (typeof window === "undefined") return

    try {
      console.log("🗑️ Clearing localStorage and resetting to defaults")
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultVolunteers))
    } catch (error) {
      console.error("❌ Error clearing localStorage:", error)
    }
  },

  getCount(): number {
    return this.getAll().length
  },

  // Debug function to check localStorage directly
  debugStorage(): void {
    if (typeof window === "undefined") {
      console.log("❌ Window is undefined, cannot debug localStorage")
      return
    }

    try {
      console.log("🔍 === STORAGE DEBUG START ===")

      const stored = localStorage.getItem(STORAGE_KEY)
      console.log("🔍 Raw localStorage data exists:", !!stored)
      console.log("🔍 Raw localStorage data length:", stored?.length || 0)

      if (stored) {
        const parsed = JSON.parse(stored)
        console.log("🔍 Parsed localStorage data:", {
          count: parsed.length,
          names: parsed.map((v: Volunteer) => v.name),
        })

        // Show first few characters of each volunteer's data
        parsed.forEach((v: Volunteer, index: number) => {
          if (index < 3) {
            // Only show first 3 for brevity
            console.log(`🔍 Volunteer ${index + 1}:`, {
              id: v.id,
              name: v.name,
              email: v.email,
            })
          }
        })
      } else {
        console.log("🔍 No data found in localStorage")
      }

      console.log("🔍 === STORAGE DEBUG END ===")
    } catch (error) {
      console.error("❌ Error debugging localStorage:", error)
    }
  },

  // Force refresh from localStorage
  forceRefresh(): Volunteer[] {
    if (typeof window === "undefined") return defaultVolunteers

    console.log("🔄 Force refreshing from localStorage...")
    const stored = localStorage.getItem(STORAGE_KEY)
    const volunteers = stored ? JSON.parse(stored) : defaultVolunteers
    console.log("🔄 Force refresh result:", volunteers.length, "volunteers")
    return volunteers
  },
}

// Initialize on module load
if (typeof window !== "undefined") {
  initializeStorage()
}
