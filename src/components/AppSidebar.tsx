import { useEffect, useState } from "react";
import { LayoutDashboard, Plus, Settings } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { supabase } from "../supabaseClient";

const items = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Create Catalog", url: "/create", icon: Plus },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar({ mode = "default" }: { mode?: "default" | "overlay" }) {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";

  const [businessName, setBusinessName] = useState("Loading...");

  useEffect(() => {
    const fetchBusinessName = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("business")
        .eq("id", user.id)
        .single();

      setBusinessName(data?.business || "Your Business");
    };
    fetchBusinessName();
  }, []);

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? "bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 border-r-2 border-purple-500"
      : "hover:bg-slate-100";

  return (
    <Sidebar className={`${collapsed ? "w-14" : "w-64"} border-r bg-white`} collapsible="icon">
      <SidebarContent className="p-4">
        <SidebarGroup>
          <SidebarGroupLabel className="mt-12 mb-6 text-xl font-semibold text-purple-700 tracking-wide capitalize">
            {!collapsed && businessName}
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${getNavCls({
                          isActive,
                        })}`
                      }
                    >
                      <item.icon className="h-5 w-5" />
                      {!collapsed && <span className="font-medium">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
