// User types
export interface User {
  id: string
  name: string
  email: string
  role: "admin" | "manager" | "user"
  createdAt: string
  updatedAt: string
}

// Volunteer types
export interface Volunteer {
  id: string
  name: string
  email: string
  phone: string
  address: string
  skills: string[]
  availability: string[]
  status: "active" | "inactive" | "pending"
  qrCode?: string
  createdAt: string
  updatedAt: string
}

// Attendance types
export interface Attendance {
  id: string
  volunteerId: string
  volunteerName: string
  eventId?: string
  eventName?: string
  checkInTime: string
  checkOutTime?: string
  duration?: number
  status: "checked-in" | "checked-out"
}

// Dashboard types
export interface DashboardStats {
  totalVolunteers: number
  activeVolunteers: number
  totalHoursThisMonth: number
  attendanceRate: number
}

export interface ActivityItem {
  id: string
  type: "check-in" | "check-out" | "new-volunteer" | "volunteer-update"
  volunteerId?: string
  volunteerName?: string
  timestamp: string
  details?: string
}
