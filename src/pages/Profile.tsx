import { User } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export function Profile() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-extrabold text-navy tracking-tight">Profile</h1>
        <p className="text-sm text-slate-500 font-medium">View and manage your admin profile information.</p>
      </div>

      <Card className="shadow-xl shadow-slate-200/40 border-none rounded-3xl overflow-hidden bg-white/50 backdrop-blur-sm border border-slate-100">
        <CardHeader className="border-b border-slate-50 px-8 py-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-brand/10 flex items-center justify-center">
              <User className="h-6 w-6 text-brand" />
            </div>
            <div>
              <CardTitle className="text-xl font-extrabold text-navy">Admin Profile</CardTitle>
              <CardDescription className="text-sm font-medium text-slate-500">Your personal information and access level.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex flex-col items-center justify-center p-8 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="h-24 w-24 rounded-2xl bg-white flex items-center justify-center border-2 border-brand/20 shadow-sm mb-4">
                <User className="h-12 w-12 text-brand" />
              </div>
              <h3 className="text-lg font-bold text-navy">Admin User</h3>
              <p className="text-sm text-brand font-bold uppercase tracking-wider">Super Admin</p>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Full Name</p>
                  <p className="text-sm font-bold text-navy">Admin User</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Role</p>
                  <p className="text-sm font-bold text-navy">Super Admin</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email Address</p>
                  <p className="text-sm font-bold text-navy">admin@tmtfuel.com</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Account Status</p>
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <p className="text-sm font-bold text-emerald-600">Active</p>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100">
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                  <p className="text-xs font-medium text-amber-800 leading-relaxed">
                    <span className="font-bold">Note:</span> Profile editing can be connected later when backend support is available.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
