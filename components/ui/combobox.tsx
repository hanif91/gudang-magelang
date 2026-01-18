"use client";
import { useState } from "react"
import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

interface ComboboxProps {
    options: { value: string; label: string }[]; // Opsi yang akan ditampilkan
    value: string; // Nilai yang dipilih
    onChange: (value: string) => void; // Fungsi untuk menangani perubahan nilai
    placeholder?: string; // Placeholder untuk tombol Combobox
    searchPlaceholder?: string; // Placeholder untuk input pencarian
    emptyText?: string; // Teks yang ditampilkan jika tidak ada hasil pencarian
    disabled?: boolean; // Menentukan apakah combobox dinonaktifkan
}

export function Combobox({
    options,
    value,
    onChange,
    placeholder = "Select...",
    searchPlaceholder = "Search...",
    emptyText = "No results found.",
    disabled = false,
}: ComboboxProps) {
    const [open, setOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    // console.log(value)
    // console.log(options)
    //   console.log("testt", value)

    // Filter options berdasarkan label (nama)
    const filteredOptions = options.filter((option) =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Temukan opsi yang dipilih
  
    const selectedOption = value
        ? options.find((option) => option.value === value)
        : null;
    // console.log(options)

    // console.log("Value", options)



    return (
        <Popover open={open} onOpenChange={(isOpen) => {
            setOpen(isOpen);
            if (!isOpen) {
                setSearchTerm(""); // Reset search term saat combobox ditutup
            }
        }}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    disabled={disabled}
                    aria-expanded={open}
                    className="w-full justify-between"
                >
                    {selectedOption ? selectedOption.label : placeholder}
                    <ChevronsUpDown className="opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
                <Command>
                    <CommandInput
                        placeholder={searchPlaceholder}
                        value={searchTerm}
                        onValueChange={(term) => setSearchTerm(term)} // Update search term
                    />
                    <CommandList>
                        <CommandEmpty>{emptyText}</CommandEmpty>
                        <CommandGroup>
                            {filteredOptions.map((c) => (
                                <CommandItem
                                    key={c.value}
                                    value={c.label}
                                    onSelect={(currentValue: string) => {
                                        const value = options.find(
                                            (option) => option.label.toLowerCase().trim() === currentValue.toLowerCase()
                                        )?.value;
                                        const test = options.find((option) => option.label.toLowerCase() === "bak meter ")
                                        // console.log(options)
                                        // console.log(test)
                                        // console.log(currentValue)
                                        onChange(value ?? '');
                                        setOpen(false);
                                        setSearchTerm(""); // Reset search term setelah memilih
                                    }}
                                >
                                    {c.label}
                                    <Check
                                        className={cn(
                                            "ml-auto",
                                            value === c.value ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}