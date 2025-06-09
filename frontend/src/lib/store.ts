import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { User, Volunteer } from "../types/volunteer"

// Auth Store
interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (user: User, token: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
    }),
    {
      name: "auth-storage",
    },
  ),
)

// Volunteers Store
interface VolunteersState {
  volunteers: Volunteer[]
  setVolunteers: (volunteers: Volunteer[]) => void
  addVolunteer: (volunteer: Volunteer) => void
  updateVolunteer: (id: string, volunteer: Partial<Volunteer>) => void
  deleteVolunteer: (id: string) => void
}

export const useVolunteersStore = create<VolunteersState>((set) => ({
  volunteers: [],
  setVolunteers: (volunteers) => set({ volunteers }),
  addVolunteer: (volunteer) =>
    set((state) => ({
      volunteers: [...state.volunteers, volunteer],
    })),
  updateVolunteer: (id, updatedVolunteer) =>
    set((state) => ({
      volunteers: state.volunteers.map((v) => (v.id === id ? { ...v, ...updatedVolunteer } : v)),
    })),
  deleteVolunteer: (id) =>
    set((state) => ({
      volunteers: state.volunteers.filter((v) => v.id !== id),
    })),
}))
