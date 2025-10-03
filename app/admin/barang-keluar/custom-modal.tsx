"use client"

import { useEffect } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface CustomModalProps {
  isOpen: boolean
  onClose: () => void
  children?: React.ReactNode
  title?: string
  description?: string
  footer?: React.ReactNode // Tambahkan prop footer
}

export default function CustomModal({ isOpen, onClose, title, description, children, footer }: CustomModalProps) {
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose()
      }
    }

    if (isOpen) {
      window.addEventListener("keydown", handleEscape)
    }

    return () => {
      window.removeEventListener("keydown", handleEscape)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md">
      <Card className="shadow-xl rounded-lg">
        {/* Header */}
        <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-gray-300">
          <div>
            <CardTitle className="text-left text-lg font-semibold">{title}</CardTitle>
            {description && <CardDescription className="text-gray-500">{description}</CardDescription>}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 text-gray-500 hover:text-gray-800"
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </Button>
        </CardHeader>

        {/* Dynamic Content */}
        <CardContent className="p-6 space-y-4">{children}</CardContent>

        {/* Footer */}
        <CardFooter className="flex justify-end gap-2 ">
          {footer} {/* Gunakan prop footer */}
        </CardFooter>
      </Card>
    </div>
  )
}