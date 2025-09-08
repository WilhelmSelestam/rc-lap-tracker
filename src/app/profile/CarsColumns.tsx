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

// const EditCarDialog = ({ car }: { car: Car }) => {
//   const [open, setOpen] = useState(false)
//   const [name, setName] = useState(car.name)

//   const handleUpdate = async () => {
//     await updateCarName(car.id, name)
//     setOpen(false)
//   }

//   return (
//     <Dialog open={open} onOpenChange={setOpen}>
//       <DialogTrigger asChild>
//         <Button variant="ghost" className="h-8 w-8 p-0">
//           <span className="sr-only">Open menu</span>
//           <MoreHorizontal className="h-4 w-4" />
//         </Button>
//       </DialogTrigger>
//       <DialogContent>
//         <DialogHeader>
//           <DialogTitle>Edit Car Name</DialogTitle>
//         </DialogHeader>
//         <div className="grid gap-4 py-4">
//           <Input value={name} onChange={(e) => setName(e.target.value)} />
//         </div>
//         <Button onClick={handleUpdate}>Save</Button>
//       </DialogContent>
//     </Dialog>
//   )
// }

const EditCarForm = ({ car, onClose }: { car: Car; onClose: () => void }) => {
  const [name, setName] = useState(car.car_name)

  const handleUpdate = async () => {
    await updateCarName(car.id, name)
    onClose() // Call the passed-in function to close the dialog
  }

  console.log("Editing car:", car)
  console.log("Current name state:", name)

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

// export const columns: ColumnDef<Car>[] = [
//   {
//     accessorKey: "name",
//     header: "Name",
//   },
//   {
//     id: "actions",
//     cell: ({ row }) => {
//       const car = row.original

//       return (
//         <DropdownMenu>
//           <DropdownMenuTrigger asChild>
//             <Button variant="ghost" className="h-8 w-8 p-0">
//               <span className="sr-only">Open menu</span>
//               <MoreHorizontal className="h-4 w-4" />
//             </Button>
//           </DropdownMenuTrigger>
//           <DropdownMenuContent align="end">
//             <DropdownMenuLabel>Actions</DropdownMenuLabel>
//             <Dialog>
//               <DialogTrigger asChild>
//                 <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
//                   Edit
//                 </DropdownMenuItem>
//               </DialogTrigger>
//               <DialogContent>
//                 <EditCarDialog car={car} />
//               </DialogContent>
//             </Dialog>
//           </DropdownMenuContent>
//         </DropdownMenu>
//       )
//     },
//   },
// ]

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
        {/* Use the new form component here */}
        <EditCarForm car={car} onClose={() => setIsDialogOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}

// The columns definition is now simpler
export const columns: ColumnDef<Car>[] = [
  {
    accessorKey: "car_name",
    header: "Name",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const car = row.original
      return <ActionsCell car={car} />
    },
  },
]
