"use client"

import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"

import React, { Fragment, useContext } from 'react';
import { MenuUserContext } from "@/providers/menuuser-context";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ModeToggle } from "./ui/mode-toggle";

export default function AppHeaderAdmin() {
	const dataMenu = useContext(MenuUserContext);
	const pathname = usePathname();

	return (
		<header className="flex h-16 shrink-0 items-center justify-between px-4 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
			{/* Kiri */}
			<div className="flex items-center gap-2">
				<SidebarTrigger className="-ml-1" />
				<Separator orientation="vertical" className="mr-2 h-4" />
				<Breadcrumb>
					<BreadcrumbList>
						<BreadcrumbItem className="block md:hidden">
							<BreadcrumbPage>{dataMenu[pathname]?.title}</BreadcrumbPage>
						</BreadcrumbItem>
						{dataMenu[pathname]?.items.map((val) => (
							val.ismenu ? (
								<BreadcrumbItem key={`1${val.id}`} className="hidden md:block">
									<BreadcrumbPage>{val.title}</BreadcrumbPage>
								</BreadcrumbItem>
							) : (
								<Fragment key={`fragment${val.url}`}>
									<BreadcrumbItem className="hidden md:block">
										<Link href={val.url}>{val.title}</Link>
									</BreadcrumbItem>
									<BreadcrumbSeparator className="hidden md:block" />
								</Fragment>
							)
						))}
					</BreadcrumbList>
				</Breadcrumb>
			</div>

			{/* Kanan */}
			<div className="ml-auto">
				<ModeToggle />
			</div>
		</header>
	)
}
