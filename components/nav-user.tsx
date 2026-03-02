"use client"
import { useEffect, useState } from 'react'

import {
  BadgeCheck,
  ChevronsUpDown,
} from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"
import { LogoutButton } from './logout-button'

interface UserData {
  id: number;
  username: string;
  nama: string;
  jabatan: string;
  rolePortal: string;
  roleId: number;
  isActive: boolean;
  isUserPpob: boolean;
  isUserTimtagih: boolean;
  noHp: string;
  loket: Array<{
    id: number;
    aktif: number;
    loket: string;
    primary: number;
    kodeloket: string;
  }>;
}

// Helper function to get user initials from name
function getInitials(name: string): string {
  if (!name) return 'U';
  const words = name.trim().split(' ');
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

export function NavUser() {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { isMobile } = useSidebar()

  useEffect(() => {
    // Get user data from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser) as UserData;
        setUser(parsedUser);
      } catch (error) {
        console.error('Failed to parse user data from localStorage:', error);
      }
    }
    setIsLoading(false);
  }, []);

  if (isLoading) return (
    <Skeleton className="w-[100px] h-[20px] rounded-full" />
  )

  if (!user) return (
    <Skeleton className="w-[100px] h-[20px] rounded-full" />
  )
  // console.log(user);
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarFallback className="rounded-lg bg-primary text-primary-foreground">
                  {getInitials(user.nama)}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{user.nama}</span>
                <span className="truncate text-xs">{user.jabatan}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarFallback className="rounded-lg bg-primary text-primary-foreground">
                    {getInitials(user.nama)}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{user.nama}</span>
                  <span className="truncate text-xs">{user.jabatan}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <BadgeCheck className='' size={24} />
                <p className='ml-4'>Profile</p>
              </DropdownMenuItem>


            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="inline-flex w-full p-0">
              {/* <div className="flex justify-start w-full">
								<LogOut size={26} className='my-1'/> */}
              <LogoutButton />
              {/* </div> */}


              {/* Log out */}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
