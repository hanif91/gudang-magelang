"use client"

import * as React from "react"
import { addDays, format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerWithRangeProps extends React.HTMLAttributes<HTMLDivElement> {
  initialDateRange?: DateRange
  onDateChange?: (dateRange: DateRange | undefined) => void
  placeholder?: string
  buttonClassName?: string
  calendarClassName?: string
  numberOfMonths?: number
  disabled?: boolean
}

export function DatePickerWithRange({
  className,
  initialDateRange,
  onDateChange,
  placeholder = "Pick a date",
  buttonClassName,
  calendarClassName,
  numberOfMonths = 1,
  disabled = false,
}: DatePickerWithRangeProps) {
  // Gunakan tanggal default jika tidak ada initialDateRange
  const defaultDateRange: DateRange = {
    from: new Date(),
    to: addDays(new Date(), 7),
  }

  const [date, setDate] = React.useState<DateRange | undefined>(
    initialDateRange ?? defaultDateRange
  )

  const handleDateChange = (dateRange: DateRange | undefined) => {
    setDate(dateRange)
    if (onDateChange) {
      onDateChange(dateRange)
    }
  }

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !date && "text-muted-foreground",
              buttonClassName
            )}
            disabled={disabled}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>{placeholder}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className={cn("w-auto p-0", calendarClassName)} align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleDateChange}
            numberOfMonths={numberOfMonths}
            disabled={disabled}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
