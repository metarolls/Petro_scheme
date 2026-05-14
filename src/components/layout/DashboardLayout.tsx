import * as React from "react"
import { NavLink, useNavigate, Outlet } from "react-router-dom"
import { 
  LayoutDashboard, 
  Users, 
  Fuel, 
  Wallet, 
  BarChart3, 
  LogOut,
  User,
  Search,
  Bell,
  ChevronRight,
  ChevronLeft,
  Settings,
  HelpCircle,
  UserCheck,
  History
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const sidebarItems = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard, label: "डॅशबोर्ड" },
  { name: "Dealers", path: "/dealers", icon: Users, label: "डीलर" },
  { name: "Petrol Pumps", path: "/petrol-pumps", icon: Fuel, label: "पेट्रोल पंप" },
  { name: "Settlements", path: "/settlements", icon: UserCheck, label: "सेटलमेंट" },
  { name: "Sales Wallet", path: "/sales-wallet", icon: Wallet, label: "वॉलेट" },
  { name: "Analytics", path: "/analytics", icon: BarChart3, label: "अॅनालिटिक्स" },
  { name: "Reports", path: "/reports", icon: History, label: "अहवाल" },
]

export function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)
  const [isProfileOpen, setIsProfileOpen] = React.useState(false)
  const { logout, role, profile } = useAuth()
  const navigate = useNavigate()

  // Filter sidebar items based on role
  const filteredSidebarItems = sidebarItems.filter(item => {
    if (role === 'admin') return true;
    if (role === 'rm') {
      // RM has full visibility but might not need "Settings" or "User Management" if added later
      // For now, give them access to everything except maybe specific admin-only tools
      return true;
    }
    if (role === 'mo') {
      // MO restricted to core data viewing
      return ["Dashboard", "Dealers", "Analytics", "Reports"].includes(item.name);
    }
    return false;
  })

  // Close mobile menu on navigation
  React.useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [navigate])

  const handleLogout = async () => {
    try {
      await logout()
      navigate("/login")
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  const userDisplayName = profile?.fullName || profile?.firmName || "User";
  const userRoleLabel = role?.toUpperCase() === 'ADMIN' ? 'Super Admin' : 
                       role?.toUpperCase() === 'RM' ? 'Regional Manager' :
                       role?.toUpperCase() === 'MO' ? 'Marketing Officer' : 
                       role?.toUpperCase() === 'DEALER' ? 'Metaroll Dealer' :
                       role?.toUpperCase() === 'CONTRACTOR' ? 'Premium Contractor' :
                       role?.toUpperCase() === 'MERCHANT' ? 'Fuel Merchant' : 'System User';

  return (
    <TooltipProvider>
      <div className="flex h-screen bg-[#f8fafc] overflow-hidden">
        {/* Sidebar Overlay for Mobile */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside 
          className={cn(
            "fixed inset-y-0 left-0 lg:relative lg:flex flex-col z-50 glass-3d smooth-transition",
            isSidebarOpen ? "w-64" : "w-20",
            isMobileMenuOpen ? "translate-x-0 w-64" : "-translate-x-full lg:translate-x-0"
          )}
        >
          <div className="h-16 flex items-center px-6 border-b border-slate-100 shrink-0">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl overflow-hidden shadow-lg shadow-brand/10 transition-transform duration-500 hover:scale-110 cursor-pointer" onClick={() => navigate('/dashboard')}>
                <img src="/logo.png" alt="Metaroll Rewards Logo" className="h-full w-full object-cover" />
              </div>
              {(isSidebarOpen || isMobileMenuOpen) && (
                <div className="flex flex-col">
                  <span className="text-sm font-black tracking-tight leading-tight uppercase text-premium">Metaroll Rewards</span>
                  <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-0.5">Premium Ecosystem</span>
                </div>
              )}
            </div>
          </div>

          <nav className="flex-1 px-3 space-y-1.5 mt-6 overflow-y-auto custom-scrollbar">
            {filteredSidebarItems.map((item) => (
              <Tooltip key={item.path} delayDuration={0}>
                <TooltipTrigger asChild>
                  <NavLink to={item.path}>
                    {({ isActive }) => (
                      <div className={cn(
                        "flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 group relative",
                        isActive 
                          ? "bg-brand-soft text-brand shadow-sm shadow-brand/5" 
                          : "text-slate-500 hover:bg-slate-50 hover:text-navy"
                      )}>
                        <item.icon className={cn(
                          "h-5 w-5 shrink-0 transition-transform duration-300 group-hover:scale-110", 
                          (isSidebarOpen || isMobileMenuOpen) ? "mr-3" : "mx-auto"
                        )} />
                        {(isSidebarOpen || isMobileMenuOpen) && (
                          <div className="flex flex-col">
                            <span className="text-sm font-bold tracking-tight">{item.name}</span>
                            <span className="text-[9px] opacity-70 font-black uppercase leading-none mt-0.5 tracking-tighter">{item.label}</span>
                          </div>
                        )}
                        {isActive && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-brand rounded-r-full shadow-[2px_0_10px_rgba(var(--brand),0.5)]" />
                        )}
                      </div>
                    )}
                  </NavLink>
                </TooltipTrigger>
                {!(isSidebarOpen || isMobileMenuOpen) && (
                  <TooltipContent side="right" className="font-bold text-xs bg-navy text-white border-none px-3 py-1.5 rounded-lg shadow-xl">
                    {item.name} <span className="opacity-60 ml-1">({item.label})</span>
                  </TooltipContent>
                )}
              </Tooltip>
            ))}
          </nav>

          <div className="p-4 border-t border-slate-100 shrink-0">
            <Button 
              variant="ghost" 
              className={cn(
                "w-full justify-start text-brand hover:bg-brand-soft hover:text-brand-hover rounded-xl transition-all duration-300 active:scale-95 font-bold", 
                !(isSidebarOpen || isMobileMenuOpen) && "px-0 justify-center"
              )}
              onClick={handleLogout}
              aria-label="Logout from session"
            >
              <LogOut className={cn("h-5 w-5", (isSidebarOpen || isMobileMenuOpen) && "mr-3")} />
              {(isSidebarOpen || isMobileMenuOpen) && <span className="text-sm">Logout</span>}
            </Button>
            {(isSidebarOpen || isMobileMenuOpen) && (
              <div className="mt-4 px-3 py-3 bg-slate-100/30 rounded-xl border border-white/40 backdrop-blur-sm">
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-[0.1em]">
                  <span>BUILD v4.0.0</span>
                  <div className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {/* Header */}
          <header className="h-16 glass-3d flex items-center justify-between px-4 md:px-6 z-30 sticky top-0">
            <div className="flex items-center gap-3 md:gap-4 flex-1">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => {
                  if (window.innerWidth < 1024) {
                    setIsMobileMenuOpen(!isMobileMenuOpen)
                  } else {
                    setIsSidebarOpen(!isSidebarOpen)
                  }
                }}
                className="hover:bg-slate-100 rounded-xl h-10 w-10 text-slate-500 border border-slate-100 lg:border-none shadow-sm lg:shadow-none"
                aria-label="Toggle Sidebar"
              >
                {isSidebarOpen ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
              </Button>

              <div className="max-w-md w-full relative group hidden lg:block">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-brand transition-colors" />
                <Input 
                  placeholder="Intelligence Search... (Ctrl + K)" 
                  className="pl-11 h-11 bg-slate-100/50 border-transparent focus-visible:bg-white focus-visible:ring-brand/10 focus-visible:border-brand/20 rounded-2xl transition-all font-medium text-sm"
                  aria-label="Global Search"
                />
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none">
                  <kbd className="px-2 py-0.5 rounded-md border border-slate-200 bg-white text-[10px] font-black text-slate-400 shadow-sm">CTRL</kbd>
                  <kbd className="px-2 py-0.5 rounded-md border border-slate-200 bg-white text-[10px] font-black text-slate-400 shadow-sm">K</kbd>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-3">
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative hover:bg-slate-100 rounded-full h-10 w-10 text-slate-500 transition-transform active:scale-90"
                aria-label="View Notifications"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-2.5 right-2.5 h-2 w-2 bg-brand rounded-full border-2 border-white ring-2 ring-brand/10 animate-pulse" />
              </Button>
              
              <div className="h-8 w-px bg-slate-200 mx-1 hidden sm:block" />

              <div className="relative">
                <div 
                  className="flex items-center gap-2 md:gap-3 pl-1 group cursor-pointer"
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  role="button"
                  aria-haspopup="true"
                  aria-expanded={isProfileOpen}
                  aria-label="User Profile Menu"
                >
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-black text-navy group-hover:text-brand transition-colors leading-tight">{userDisplayName}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{userRoleLabel}</p>
                  </div>
                  <div className={cn(
                    "h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center border-2 border-white shadow-sm overflow-hidden transition-all duration-300",
                    isProfileOpen ? "border-brand ring-4 ring-brand/10 scale-95" : "group-hover:border-brand/20 group-hover:shadow-md"
                  )}>
                    {profile?.photoURL ? (
                      <img src={profile.photoURL} alt="Profile" className="h-full w-full object-cover" />
                    ) : (
                      <User className="h-6 w-6 text-slate-600" />
                    )}
                  </div>
                </div>

                {/* Profile Dropdown */}
                {isProfileOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setIsProfileOpen(false)}
                    />
                    <div className="absolute right-0 mt-3 w-60 bg-white/90 backdrop-blur-xl rounded-[1.5rem] shadow-2xl shadow-slate-200/80 border border-white/50 p-2 z-50 animate-in fade-in zoom-in-95 duration-300 origin-top-right">
                      <div className="px-4 py-3 border-b border-slate-50 mb-1 flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-navy flex items-center justify-center text-white font-black">
                          {(profile?.fullName || profile?.firmName || "U").substring(0, 2).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <p className="text-sm font-black text-navy leading-none truncate max-w-[140px]">{userDisplayName}</p>
                          <p className="text-[10px] text-slate-400 font-bold mt-1 truncate max-w-[140px]">{profile?.email || profile?.phone || "No Email"}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-0.5">
                        <button 
                          onClick={() => { navigate("/profile"); setIsProfileOpen(false); }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-navy hover:bg-slate-50 rounded-xl transition-all text-left group"
                        >
                          <User className="h-4 w-4 group-hover:scale-110 transition-transform" />
                          My Profile
                        </button>
                        <button 
                          onClick={() => { navigate("/settings"); setIsProfileOpen(false); }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-navy hover:bg-slate-50 rounded-xl transition-all text-left group"
                        >
                          <Settings className="h-4 w-4 group-hover:rotate-45 transition-transform" />
                          Settings
                        </button>
                        <button 
                          onClick={() => { navigate("/support"); setIsProfileOpen(false); }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-navy hover:bg-slate-50 rounded-xl transition-all text-left group"
                        >
                          <HelpCircle className="h-4 w-4 group-hover:scale-110 transition-transform" />
                          Support
                        </button>
                      </div>

                      <div className="h-px bg-slate-50 my-2 mx-2" />
                      <button 
                        onClick={() => { handleLogout(); setIsProfileOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black text-brand uppercase tracking-widest hover:bg-brand-soft rounded-xl transition-all text-left group"
                      >
                        <LogOut className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </header>

          {/* Content Area */}
          <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
            <div className="max-w-7xl mx-auto pb-12">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </TooltipProvider>
  )
}
