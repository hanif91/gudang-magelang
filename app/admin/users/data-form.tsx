"use client"

import { useRouter } from "next/navigation"
import { useTransition, useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { Check, ChevronsUpDown, CircleAlert, Eye, EyeOff } from "lucide-react"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
// import { getUserRoles } from "@/actions/userRolesAction"
// import { getUserStatuses } from "@/actions/userStatusesAction"
import { createUser, editUser } from "@/lib/actions/usersAction"
import { serialize } from "object-to-formdata"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Combobox } from "@/components/ui/combobox"

type userRoles = {
  id: string
  userRoleName: string
}

type userStatuses = {
  id: string
  userStatusName: string
}

export default function UserForm({ user }: { user?: any }) {
  const router = useRouter()
  const { toast } = useToast()
  const [userRoles, setUserRoles] = useState<userRoles[]>([])
  const [userStatuses, setUserStatuses] = useState<userStatuses[]>([])
  const [openUserRoles, setOpenUserRoles] = useState(false)
  const [openUserStatuses, setOpenUserStatuses] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirmation, setShowPasswordConfirmation] =
    useState(false)

  const formSchema = z
    .object({
      email: z.string().email().min(1, "Email is required"),
      nama: z.string().min(1, "Name is required"),
      password: user ? z.string().min(6).or(z.literal("")) : z.string().min(6),
      passwordConfirmation: user
        ? z.string().min(6).or(z.literal(""))
        : z.string().min(6),

      status: z.string().min(1, "status Reqruied"),

    })
    .refine((data) => data.password === data.passwordConfirmation, {
      message:
        "The password field and passwordConfirmation field must be the same",
      path: ["passwordConfirmation"],
    })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: user
      ? {
        email: user.email ?? "",
        nama: user.nama ?? "",
        password: user.password ?? "",
        passwordConfirmation: user.password ?? "",
        status: user.status ?? "",

      }
      : {
        email: "",
        nama: "",
        password: "",
        passwordConfirmation: "",
        status: "",
      },
  })

  const [isPending, startTransition] = useTransition()
  async function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      const formData = serialize(values)
      const data = user
        ? await editUser(user.id, formData)
        : await createUser(formData)

      if (data.success) {
        toast({
          variant: "default",
          description: (
            <div className="flex gap-2 items-start">
              <div className="flex flex-col justify-start ">
                <Check className="w-10 h-10" />
              </div>
              <div>
                <p className="font-bold text-lg">Success</p>
                <p>{data.message}</p>
              </div>
            </div>
          ),
        })

        router.push("/admin/users")
        router.refresh()
      } else {
        toast({
          variant: "destructive",
          description: (
            <div className="flex gap-2 items-start">
              <div className="flex flex-col justify-start ">
                <CircleAlert className="w-10 h-10" />
              </div>
              <div>
                <p className="font-bold text-lg">{data.message}</p>
                {/* <ul className="list-disc pl-5">
                  {data.data.map((val: any, key: number) => (
                    <li key={key}>{val.message}</li>
                  ))}
                </ul> */}
              </div>
            </div>
          ),
        })
      }
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="Email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="nama"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input type="text" placeholder="Nama" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <div className="relative">
                  {showPassword ? (
                    <Eye
                      className="absolute right-2.5 top-2.5 h-5 w-5"
                      onClick={() => setShowPassword((prev) => !prev)}
                    />
                  ) : (
                    <EyeOff
                      className="absolute right-2.5 top-2.5 h-5 w-5"
                      onClick={() => setShowPassword((prev) => !prev)}
                    />
                  )}
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="password"
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="passwordConfirmation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password Confirmation</FormLabel>
              <FormControl>
                <div className="relative">
                  {showPasswordConfirmation ? (
                    <Eye
                      className="absolute right-2.5 top-2.5 h-5 w-5"
                      onClick={() =>
                        setShowPasswordConfirmation((prev) => !prev)
                      }
                    />
                  ) : (
                    <EyeOff
                      className="absolute right-2.5 top-2.5 h-5 w-5"
                      onClick={() =>
                        setShowPasswordConfirmation((prev) => !prev)
                      }
                    />
                  )}
                  <Input
                    type={showPasswordConfirmation ? "text" : "password"}
                    placeholder="password"
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <FormControl>
                <div className="relative">
                  {/* <Input
                    type={showPasswordConfirmation ? "text" : "password"}
                    placeholder="Password Confirmation"
                    {...field}
                  /> */}

                  {/* <Select onValueChange={field.onChange} defaultValue={field.value} >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select a Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Status</SelectLabel>
                        <SelectItem value="1">Aktif</SelectItem>
                        <SelectItem value="0">Nonaktif</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select> */}
                  <Combobox
                    options={[{ label: "Aktif", value: "1" }, { label: "Tidak Aktif", value: "0" }]}
                    value={field.value?.toString() || ""}
                    onChange={(value) => field.onChange(value)}
                    placeholder="Pilih Status"
                  />



                </div>


              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={isPending}>
            Submit
          </Button>
        </div>
      </form>
    </Form>
  )
}