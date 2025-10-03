"use client";

import { logoutAction } from "@/lib/actions/actLogout";
// import { useFormState } from "react-dom";
import { Button } from "./ui/button";
import { useActionState } from "react";
import { LogOut } from "lucide-react";

const initialState = {
	message: ""
};

export function LogoutButton() {
	const [, action] = useActionState(logoutAction, initialState);
	return (
		<form className="grow" action={action}>
			{/* <div className="flex justify-start w-full"> */}
				<Button  className="w-full  justify-start border-0 px-1" size={"sm"} variant={"outline"}>
					<LogOut size={24} className='mx-2'/>
					Sign out
				</Button>
			{/* </div> */}
			
		</form>
	);
}