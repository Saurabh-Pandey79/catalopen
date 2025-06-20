
import { AppSidebar } from "./AppSidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Bell, HelpCircle, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Top Navbar */}
      <header className="h-16 border-b bg-white/80 backdrop-blur-sm flex items-center justify-between px-6 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="lg:hidden" />
          <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Catal
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" className="gap-2">
            <HelpCircle size={16} />
            <span className="hidden sm:inline">Help</span>
          </Button>
          <Button variant="ghost" size="sm" className="gap-2">
            <FileText size={16} />
            <span className="hidden sm:inline">Docs</span>
          </Button>
          <Button variant="ghost" size="sm">
            <Bell size={16} />
          </Button>
          <Avatar className="h-8 w-8">
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
        </div>
      </header>

      <div className="flex w-full">
        <AppSidebar />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
