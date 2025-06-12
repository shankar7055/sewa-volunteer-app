export type SewaAreaCode = "01" | "02" | "03" | "04" | "05" | "06" | "07"

export const SEWA_AREAS: Record<SewaAreaCode, string> = {
  "01": "Function Incharge",
  "02": "Back Office",
  "03": "Line Management",
  "04": "Jal Prashad",
  "05": "Bin Bag",
  "06": "Langar Prashad",
  "07": "Langar Refilling",
} as const

export interface Volunteer {
  id: string
  name: string
  email: string
  phone: string
  sewaCode: string
  sewaArea: SewaAreaCode
  status: "active" | "inactive" | "pending"
  isPresent: boolean
  createdAt: string
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

export interface AttendanceRecord {
  id: string
  volunteerId: string
  timestamp: string
  type: "checkin" | "checkout"
}
