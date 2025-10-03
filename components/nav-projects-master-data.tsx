"use client"

import {
  ChevronRight,
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
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar"

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@radix-ui/react-collapsible"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

export function NavProjectsMasterData({
  projects,
}: {
  projects: {
    name: string
    url: string
    icon: LucideIcon
    items?: {
      title: string
      url: string
    }[]
  }[]
}) {
  const { isMobile } = useSidebar()

  const pathname = usePathname(); // Dapatkan URL saat ini
  const [isCollapsibleOpen, setIsCollapsibleOpen] = useState(false);

  useEffect(() => {
    const hasActiveSubItem = projects.some((project) =>
      project.items?.some((item) => pathname === item.url)
    );
    setIsCollapsibleOpen(hasActiveSubItem);
  }, [pathname, projects]);

  // console.log(isCollapsibleOpen)

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Master Data</SidebarGroupLabel>
      <SidebarMenu>
        {projects.map((project) => (
          <SidebarMenuItem key={project.name}>
            <SidebarMenuButton
              asChild
              // onClick={() => setActiveItem(project.url)}
              className={pathname === project.url ? "text-blue-500" : ""}
            >
              <Link href={project.url}>
                {project.icon && <project.icon />}
                <span>{project.name}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}

        {projects.some((project) => project.items && project.items.length > 0) && (
          <Collapsible defaultOpen={isCollapsibleOpen} asChild className="group/collapsible">
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton tooltip="Lainnya">
                  <MoreHorizontal />
                  <span>Lainnya</span>
                  <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {projects
                    .flatMap((project) =>
                      // Urutkan submenu berdasarkan `title` sebelum flatMap
                      project.items
                        ? project.items.sort((a, b) => a.title.localeCompare(b.title))
                        : []
                    )
                    .map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton
                          asChild
                          className={pathname === subItem.url ? "text-blue-500" : ""}
                        >
                          <Link href={subItem.url}>
                            <span>{subItem.title}</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        )}

      </SidebarMenu>
    </SidebarGroup>
  )
}
