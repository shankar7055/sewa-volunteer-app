"use client"

import { Bell, LogOut, Menu, Moon, Sun } from "lucide-react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import { useAuthStore } from "../../lib/store"
import { Button } from "..//ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"

interface HeaderProps {
  onToggleSidebar?: () => void
}

export function Header({ onToggleSidebar }: HeaderProps) {
  const [theme, setTheme] = useState<"light" | "dark" | "system">("light")
  const navigate = useNavigate()
  const { logout, user, isAuthenticated } = useAuthStore()

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | "system" | null
    if (savedTheme) {
      setTheme(savedTheme)
      applyTheme(savedTheme)
    }
  }, [])

  const applyTheme = (newTheme: "light" | "dark" | "system") => {
    const root = window.document.documentElement
    root.classList.remove("light", "dark")

    if (newTheme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
      root.classList.add(systemTheme)
    } else {
      root.classList.add(newTheme)
    }
  }

  const changeTheme = (newTheme: "light" | "dark" | "system") => {
    setTheme(newTheme)
    localStorage.setItem("theme", newTheme)
    applyTheme(newTheme)
  }

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  // Debug: Log the auth state
  console.log("Auth state:", { user, isAuthenticated })

  return (
    <header className="flex h-16 items-center border-b bg-background px-6">
      <Button variant="ghost" size="icon" className="md:hidden" onClick={onToggleSidebar}>
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle sidebar</span>
      </Button>

      <div className="ml-auto flex items-center gap-2">
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
          <span className="sr-only">Notifications</span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              {theme === "dark" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              <span className="sr-only">Toggle theme</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => changeTheme("light")}>Light</DropdownMenuItem>
            <DropdownMenuItem onClick={() => changeTheme("dark")}>Dark</DropdownMenuItem>
            <DropdownMenuItem onClick={() => changeTheme("system")}>System</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Simple Logout Button - Always Visible for Testing */}
        <Button variant="outline" size="sm" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>

        {/* Alternative: User Dropdown (if you prefer dropdown style) */}
        {/* 
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="text-sm">{user?.name || "User"}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        */}
      </div>
    </header>
  )
}
