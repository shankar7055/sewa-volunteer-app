import { create } from "zustand"
import { persist } from "zustand/middleware"

// Types
interface User {
  id: string
  name: string
  email: string
  role: "admin" | "manager" | "user"
  createdAt: string
  updatedAt: string
}

interface Volunteer {
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

// Auth store
interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (user: User, token: string) => void
  logout: () => void
  updateUser: (user: Partial<User>) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
      updateUser: (userData) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        })),
    }),
    {
      name: "auth-storage",
    },
  ),
)

// Volunteers store
interface VolunteersState {
  volunteers: Volunteer[]
  isLoading: boolean
  error: string | null
  setVolunteers: (volunteers: Volunteer[]) => void
  addVolunteer: (volunteer: Volunteer) => void
  updateVolunteer: (id: string, data: Partial<Volunteer>) => void
  deleteVolunteer: (id: string) => void
  setLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
}

export const useVolunteersStore = create<VolunteersState>((set) => ({
  volunteers: [],
  isLoading: false,
  error: null,
  setVolunteers: (volunteers) => set({ volunteers }),
  addVolunteer: (volunteer) =>
    set((state) => ({
      volunteers: [...state.volunteers, volunteer],
    })),
  updateVolunteer: (id, data) =>
    set((state) => ({
      volunteers: state.volunteers.map((v) => (v.id === id ? { ...v, ...data } : v)),
    })),
  deleteVolunteer: (id) =>
    set((state) => ({
      volunteers: state.volunteers.filter((v) => v.id !== id),
    })),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}))
