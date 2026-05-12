import { redirect } from "next/navigation";
import { isClinicStaff } from "@/lib/clerk";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { LayoutDashboard, Users, Activity } from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isStaff = await isClinicStaff();
  
  if (!isStaff) {
    redirect("/"); // Redirect non-staff to home
  }

  return (
    <div className="flex min-h-screen bg-surface-secondary">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-200 font-bold text-lg text-brand-700">
          <Activity className="w-6 h-6 mr-2" />
          MedAssist Admin
        </div>
        <nav className="flex-1 py-6 px-4 space-y-2">
          <Link href="/admin/dashboard" className="flex items-center gap-3 px-4 py-3 bg-brand-50 text-brand-700 rounded-xl font-medium">
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </Link>
          <Link href="/admin/patients" className="flex items-center gap-3 px-4 py-3 text-content-secondary hover:bg-gray-50 rounded-xl font-medium transition-colors">
            <Users className="w-5 h-5" />
            Patients
          </Link>
        </nav>
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3">
            <UserButton />
            <span className="text-sm font-medium text-content-primary">Clinic Staff</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:hidden">
          <div className="font-bold text-lg text-brand-700 flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            Admin
          </div>
          <UserButton />
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
