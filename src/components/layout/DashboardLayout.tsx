import * as React from "react"
import { NavLink, useNavigate } from "react-router-dom"
import { 
  LayoutDashboard, 
  Users, 
  Fuel, 
  Wallet, 
  BarChart3, 
  LogOut,
  Menu,
  User
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const sidebarItems = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard, label: "डॅशबोर्ड" },
  { name: "Dealers", path: "/dealers", icon: Users, label: "डीलर" },
  { name: "Petrol Pumps", path: "/petrol-pumps", icon: Fuel, label: "पेट्रोल पंप" },
  { name: "Settlements", path: "/settlements", icon: Wallet, label: "सेटलमेंट" },
  { name: "Reports", path: "/reports", icon: BarChart3, label: "अहवाल" },
]

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true)
  const navigate = useNavigate()

  const handleLogout = () => {
    // Simple mock logout
    navigate("/login")
  }

  return (
    <div className="flex h-screen bg-muted/30">
      {/* Sidebar */}
      <aside 
        className={cn(
          "bg-card border-r transition-all duration-300 flex flex-col z-40",
          isSidebarOpen ? "w-64" : "w-20"
        )}
      >
        <div className="p-6 flex items-center justify-between">
          {isSidebarOpen ? (
            <h1 className="text-xl font-bold text-primary tracking-tight">TMT FUEL</h1>
          ) : (
            <Fuel className="text-primary" />
          )}
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {sidebarItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => cn(
                "flex items-center px-4 py-3 rounded-lg transition-colors group",
                isActive 
                  ? "bg-primary text-primary-foreground shadow-md" 
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className={cn("h-5 w-5", isSidebarOpen && "mr-3")} />
              {isSidebarOpen && (
                <div className="flex flex-col">
                  <span className="font-medium">{item.name}</span>
                  <span className="text-[10px] opacity-70 leading-none">{item.label}</span>
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t">
          <Button 
            variant="ghost" 
            className={cn("w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive", !isSidebarOpen && "px-2")}
            onClick={handleLogout}
          >
            <LogOut className={cn("h-5 w-5", isSidebarOpen && "mr-3")} />
            {isSidebarOpen && <span>Logout</span>}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b bg-card flex items-center justify-between px-8 z-30">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium">Admin User</p>
              <p className="text-xs text-muted-foreground">Super Admin</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center border">
              <User className="h-5 w-5 text-primary" />
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
