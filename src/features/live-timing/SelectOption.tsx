import * as React from "react"

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type SelectDriverProps = {
  label: string
  options: string[]
  selectedOption: string
  setSelectedOption: (option: string) => void
}

export function OptionSelector({
  label,
  options,
  selectedOption,
  setSelectedOption,
}: SelectDriverProps) {
  return (
    <>
      <div className="flex flex-col">
        <h1>{label}</h1>
        <Select onValueChange={setSelectedOption} value={selectedOption}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select a driver" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>{label}</SelectLabel>
              {options.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </>
  )
}
