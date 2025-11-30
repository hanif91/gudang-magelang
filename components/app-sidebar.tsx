"use client";

import * as React from "react";
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
  User,
  Box,
  Boxes,
  List,
  User2,
  ShoppingCart,
  ShoppingBag,
  Archive,
  Book,
  BookUp,
  BookDown,
  LucideIcon,
} from "lucide-react";

import { NavProjectsHome } from "@/components/nav-projects-home";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { NavMainMenuTransaksi } from "./nav-main-menu-transaksi";
import axios from "axios";
import AxiosClient from "@/lib/AxiosClient";

// Map string icon names to Lucide components
const iconMap: Record<string, LucideIcon> = {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
  User,
  Box,
  Boxes,
  List,
  User2,
  ShoppingCart,
  ShoppingBag,
  Archive,
  Book,
  BookUp,
  BookDown,
};

const data = {
  teams: [
    {
      name: "GUDANG TAKALAR",
      logo: GalleryVerticalEnd,
      plan: "",
    },
  ],
  NavProjectsHome: [
    {
      name: "Dashboard",
      url: "/admin",
      icon: SquareTerminal,
    },
  ],
};

interface MenuData {
  group_name: string;
  group_link: string;
  menus: {
    id: number;
    icon: string;
    link: string;
    menu_name: string;
    permission: string[];
  }[];
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [activeItem, setActiveItem] = React.useState<string | null>(null);
  const [transaksiMenu, setTransaksiMenu] = React.useState<any[]>([]);

  React.useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await AxiosClient.get("/api/gudang/hak-akses");
        const apiData: MenuData[] = response.data.data;

        const formattedMenu = apiData.map((group) => ({
          title: group.group_name,
          icon: BookUp, // Default icon for group, or logic to choose one
          url: "#",
          items: group.menus.map((menu) => ({
            title: menu.menu_name,
            url: `/${group.group_link}/${menu.link}`,
            icon: iconMap[menu.icon] || Book, // Use mapped icon or default
          })),
        }));

        setTransaksiMenu(formattedMenu);
      } catch (error) {
        console.error("Failed to fetch menu:", error);
      }
    };

    fetchMenu();
  }, []);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
        <NavProjectsHome
          projects={data.NavProjectsHome}
        // activeItem={activeItem}
        // setActiveItem={setActiveItem}
        />
        <NavMainMenuTransaksi
          items={transaksiMenu}
        // activeItem={activeItem}
        // setActiveItem={setActiveItem}
        />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}