"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Car } from "@/types"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { updateCarName } from "./actions"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"

const EditCarForm = ({ car, onClose }: { car: Car; onClose: () => void }) => {
  const [name, setName] = useState(car.car_name)

  const handleUpdate = async () => {
    await updateCarName(car.id, name)
    onClose()
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Edit Car Name</DialogTitle>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <Input value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <Button onClick={handleUpdate}>Save Changes</Button>
    </>
  )
}

const ActionsCell = ({ car }: { car: Car }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DialogTrigger asChild>
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              Edit
            </DropdownMenuItem>
          </DialogTrigger>
        </DropdownMenuContent>
      </DropdownMenu>
      <DialogContent>
        <EditCarForm car={car} onClose={() => setIsDialogOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}

export const columns: ColumnDef<Car>[] = [
  {
    accessorKey: "car_name",
    header: "Name",
  },
  {
    accessorKey: "car_model",
    header: "Model",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const car = row.original
      return <ActionsCell car={car} />
    },
  },
]
