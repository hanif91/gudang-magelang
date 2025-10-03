"use client"

import {
  Folder,
  Forward,
  MoreHorizontal,
  Trash2,
  type LucideIcon,
} from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function NavProjectsMenuLaporan({
  projects,
  // activeItem,
  // setActiveItem,
}: {
  projects: {
    name: string
    url: string
    icon: LucideIcon
  }[]
  // activeItem: string | null;
  // setActiveItem: (url: string) => void;
}) {
  const { isMobile } = useSidebar()
  const pathname = usePathname(); // Dapatkan URL saat ini


  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Menu Laporan</SidebarGroupLabel>
      <SidebarMenu>
        {projects.map((item) => (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton
              className={pathname === item.url ? "text-blue-500" : ""}
              asChild
            // onClick={() => setActiveItem(item.url)}
            // style={{
            //   fontWeight: activeItem === item.url ? "bold" : "normal",
            //   color: activeItem === item.url ? "bold" : "normal",
            // }}
            >
              <Link href={item.url}>
                <item.icon />
                <span>{item.name}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
