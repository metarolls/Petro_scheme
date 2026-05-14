import * as React from "react"
import { User, Settings, ShieldQuestion, LogOut, Bell } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/AuthContext"

interface MobileHeaderProps {
  roleName?: string;
  userName?: string;
  title?: string;
  showBell?: boolean;
}

export function MobileHeader({ roleName, userName, title, showBell = true }: MobileHeaderProps) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <header className="bg-white px-6 pt-10 pb-4 border-b border-slate-100 sticky top-0 z-50 backdrop-blur-md bg-white/80">
      <div className="flex justify-between items-center">
        <div>
          {title ? (
            <h1 className="text-xl font-black text-navy tracking-tight">{title}</h1>
          ) : (
            <>
              <p className="text-[10px] font-black text-brand uppercase tracking-[0.2em] mb-0.5">{roleName}</p>
              <h1 className="text-xl font-black text-navy tracking-tight">{userName}</h1>
            </>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          {showBell && (
            <Button variant="ghost" size="icon" className="relative hover:bg-slate-100 rounded-full h-10 w-10 text-slate-500">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 h-2 w-2 bg-brand rounded-full border-2 border-white" />
            </Button>
          )}

          <div className="relative">
            <Button 
              variant="ghost" 
              className={cn(
                "h-10 w-10 rounded-2xl bg-slate-50 flex items-center justify-center p-0 hover:bg-slate-100 transition-all active:scale-95 shadow-sm overflow-hidden",
                isProfileOpen && "ring-2 ring-brand/20 border-brand/20"
              )}
              onClick={() => setIsProfileOpen(!isProfileOpen)}
            >
              <User className="h-5 w-5 text-slate-400" />
            </Button>

            {isProfileOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setIsProfileOpen(false)}
                />
                <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl shadow-slate-200/60 border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                  <div className="px-4 py-3 border-b border-slate-50 mb-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Account Information</p>
                    <p className="text-xs font-bold text-navy mt-1 truncate">{userName}</p>
                  </div>
                  <button 
                    onClick={() => { navigate("/profile"); setIsProfileOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-600 hover:text-navy hover:bg-slate-50 transition-colors text-left"
                  >
                    <User className="h-4 w-4 opacity-50" />
                    Profile
                  </button>
                  <button 
                    onClick={() => { navigate("/settings"); setIsProfileOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-600 hover:text-navy hover:bg-slate-50 transition-colors text-left"
                  >
                    <Settings className="h-4 w-4 opacity-50" />
                    Settings
                  </button>
                  <button 
                    onClick={() => { navigate("/support"); setIsProfileOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-600 hover:text-navy hover:bg-slate-50 transition-colors text-left"
                  >
                    <ShieldQuestion className="h-4 w-4 opacity-50" />
                    Support
                  </button>
                  <div className="h-px bg-slate-50 my-1 mx-2" />
                  <button 
                    onClick={() => { handleLogout(); setIsProfileOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-black text-brand hover:bg-brand-soft transition-colors text-left"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
