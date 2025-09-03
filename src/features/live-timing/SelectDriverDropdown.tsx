"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type SelectDriverDropdownProps = {
  drivers: string[]
  selectedDriver: string
  setSelectedDriver: (driver: string) => void
}

export function SelectDriverDropdown({
  drivers,
  selectedDriver,
  setSelectedDriver,
}: SelectDriverDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Select driver</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Panel Position</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup
          value={selectedDriver}
          onValueChange={setSelectedDriver}
        >
          {drivers.map((driver) => (
            <DropdownMenuRadioItem key={driver} value={driver}>
              {driver}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
