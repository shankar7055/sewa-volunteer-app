"use client"

import { BarChart, Home, LogOut, QrCode, Settings, Users } from "lucide-react"
import { Link, useLocation, useNavigate } from "react-router-dom"

import { useAuthStore } from "../../lib/store"
import { cn } from "../../lib/utils"
import { Button } from "..//ui/button"

export function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout } = useAuthStore()

  const navigation = [
    { name: "Dashboard", href: "/", icon: Home },
    { name: "Volunteers", href: "/volunteers", icon: Users },
    { name: "QR Scanner", href: "/qr", icon: QrCode },
    { name: "Reports", href: "/reports", icon: BarChart },
    { name: "Settings", href: "/settings", icon: Settings },
  ]

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  return (
    <div className="flex h-full w-64 flex-col border-r border-gray-200 bg-white">
      <div className="flex h-16 shrink-0 items-center border-b px-6">
        <h2 className="text-lg font-semibold text-gray-900">SEWA Volunteer</h2>
      </div>
      <nav className="flex-1 overflow-auto py-4">
        <div className="px-4 space-y-2">
          {navigation.map((item) => {
            const isActive =
              location.pathname === item.href || (item.href !== "/" && location.pathname.startsWith(item.href))
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            )
          })}
        </div>
      </nav>
      <div className="border-t p-4">
        <Button variant="outline" className="w-full justify-start gap-3" onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  )
}
