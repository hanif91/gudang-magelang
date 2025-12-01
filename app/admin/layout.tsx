import { getCurrentSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { Fragment } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppHeaderAdmin from "@/components/header-admin";


export default async function RootLayoutAdmin({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	// const { user } = await getCurrentSession();
	// if (user === null) {
	// 	console.log(user, "from page");
	// 	const portalUrl = process.env.NEXT_PUBLIC_PORTAL_URL || "http://localhost:3000"; // Fallback
	// 	return redirect(portalUrl);
	// }


	return (

		<Fragment>
			{/* <MenuUserProvider> */}
			<SidebarProvider >
				<AppSidebar />
				<SidebarInset>
					<AppHeaderAdmin />
					{children}
				</SidebarInset>

			</SidebarProvider>
			{/* </MenuUserProvider>     */}
		</Fragment>

	)
}
