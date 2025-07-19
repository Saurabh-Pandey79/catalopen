import { useEffect, useState } from "react";
import { AppSidebar } from "./AppSidebar";
import {
  SidebarTrigger,
  SidebarProvider,
} from "@/components/ui/sidebar";
import {
  Bell,
  HelpCircle,
  FileText,
  Wallet2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Outlet } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/supabaseClient";
import UPIRechargeModal from "@/components/UPIRechargeModal";

const Layout = () => {
  const isMobile = useIsMobile();
  const [balance, setBalance] = useState<number | null>(null);
  const [upiModal, setUpiModal] = useState(false);
  const upiId = "saurabhv.pandey5@oksbi"; // ✅ replace with your real UPI ID

  useEffect(() => {
    const fetchWallet = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("wallets")
        .select("balance")
        .eq("user_id", user.id)
        .maybeSingle();

      setBalance(data?.balance ?? 0);
    };

    fetchWallet();
  }, []);

  return (
    <SidebarProvider>
      <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 to-slate-100 overflow-x-hidden">
        {/* Top Navbar */}
        <header className="h-16 border-b bg-white/80 backdrop-blur-sm flex items-center justify-between px-4 sm:px-6 sticky top-0 z-50">
          <div className="flex items-center gap-4 min-w-0">
            <SidebarTrigger className="lg:hidden" />
            <div className="truncate text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Catal
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {balance !== null && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 text-purple-700 bg-purple-50 border-purple-200 hover:bg-purple-100"
                  >
                    <Wallet2 className="h-4 w-4" />
                    ₹ {balance.toFixed(0)}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuItem onClick={() => setUpiModal(true)}>
                    Recharge via UPI
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            <a
            href="mailto:saurabh@catalopen.com?subject=Support%20Request&body=Hi%20Saurabh%2C%0A%0AI%20need%20help%20with..."
            target="_blank"
            rel="noopener noreferrer"
            >
           <Button variant="ghost" size="sm" className="gap-2 hidden sm:flex">
           <HelpCircle size={16} />
           <span>Help</span>
           </Button>
           </a>


            <Button variant="ghost" size="sm" className="gap-2 hidden sm:flex">
              <FileText size={16} />
              <span>Docs</span>
            </Button>
            <Button variant="ghost" size="sm">
              <Bell size={16} />
            </Button>
          </div>
        </header>

        <div className="flex w-full overflow-x-hidden">
          <AppSidebar mode={isMobile ? "overlay" : "default"} />
          <main className="flex-1 px-4 sm:px-6 py-6 max-w-full overflow-x-hidden">
            <Outlet />
          </main>
        </div>

        <UPIRechargeModal
          open={upiModal}
          onClose={() => setUpiModal(false)}
          upiId={upiId}
          amount={199}
        />
      </div>
    </SidebarProvider>
  );
};

export default Layout;
