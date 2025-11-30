"use client";

import { Button } from "./ui/button";
import { LogOut, ArrowLeft } from "lucide-react";
import { logout } from "@/lib/actions/actAuth";

export function LogoutButton() {
	const handleBackToPortal = () => {
		const portalUrl = process.env.NEXT_PUBLIC_PORTAL_URL;
		if (portalUrl) {
			window.location.href = portalUrl;
		} else {
			window.location.href = "/";
		}
	};

	const handleLogout = async () => {
		await logout();
		window.location.reload();
	};

	return (
		<div className="flex flex-col gap-2 w-full">
			<Button
				onClick={handleBackToPortal}
				className="w-full justify-start px-2"
				size={"sm"}
				variant={"ghost"}
			>
				<ArrowLeft size={16} className='mr-2' />
				Back to Portal
			</Button>
			<Button
				onClick={handleLogout}
				className="w-full justify-start px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
				size={"sm"}
				variant={"ghost"}
			>
				<LogOut size={16} className='mr-2' />
				Logout
			</Button>
		</div>
	);
}