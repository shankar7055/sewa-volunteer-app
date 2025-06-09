// Shared types for the volunteer system
export type SewaAreaCode = "01" | "02" | "03" | "04" | "05" | "06" | "07"

export interface Volunteer {
  id: string
  name: string
  email: string
  phone: string
  sewaCode: string
  sewaArea: SewaAreaCode
  status: "active" | "inactive" | "pending"
  createdAt: string
  isPresent?: boolean
}

export interface User {
  id: string
  name: string
  email: string
  sewaCode: string
}

export interface DashboardStats {
  totalVolunteers: number
  presentVolunteers: number
  absentVolunteers: number
  attendanceRate: number
}

export const SEWA_AREAS: Record<SewaAreaCode, string> = {
  "01": "Function Incharge",
  "02": "Back Office",
  "03": "Line Management",
  "04": "Jal Prashad",
  "05": "Bin Bag",
  "06": "Langar Prashad",
  "07": "Langar Refilling",
} as const
