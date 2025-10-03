"use client"
import { useRouter } from 'next/navigation'

import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Sparkles,
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
import useSWR, { Fetcher } from 'swr' 
import axios from 'axios'
import { Skeleton } from "@/components/ui/skeleton"
import type { SessionValidationResult } from '@/lib/session'
import { LogoutButton } from './logout-button'
const fetcher  = (url : any) => axios.get<SessionValidationResult>(url).then(res => res.data)

export function NavUser(
	
) {
	const { data, error , isLoading } = useSWR('/api/users/validation-session', fetcher)
  const { isMobile } = useSidebar()
	if (error) return <div>failed to load</div>;
	if (isLoading) return (
		<Skeleton className="w-[100px] h-[20px] rounded-full" />
	)
	const user = data?.user; 
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
                <AvatarImage src={user?.image} alt={''} />
                <AvatarFallback className="rounded-lg">CN</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{user?.nama}</span>
                <span className="truncate text-xs">{user?.email}</span>
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
                  <AvatarImage src={user?.image} alt={user?.nama} />
                  <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{user?.nama}</span>
                  <span className="truncate text-xs">{user?.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <BadgeCheck className='' size={24}/>
                 <p className='ml-4'>Profile</p>
              </DropdownMenuItem>
   

            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="inline-flex w-full p-0"> 
							{/* <div className="flex justify-start w-full">
								<LogOut size={26} className='my-1'/> */}
								<LogoutButton/>
							{/* </div> */}

           
              {/* Log out */}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
