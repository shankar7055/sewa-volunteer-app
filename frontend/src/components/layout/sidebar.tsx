import { Home, QrCode, Users } from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import { cn } from "../../lib/utils"

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Volunteers", href: "/volunteers", icon: Users },
  { name: "QR Scanner", href: "/qr", icon: QrCode },
]

export function Sidebar() {
  const location = useLocation()

  return (
    <div className="w-64 bg-card border-r">
      <div className="p-6">
        <h2 className="text-lg font-semibold">SEWA Volunteer</h2>
      </div>
      <nav className="px-4 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                location.pathname === item.href
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent",
              )}
            >
              <Icon className="mr-3 h-4 w-4" />
              {item.name}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
