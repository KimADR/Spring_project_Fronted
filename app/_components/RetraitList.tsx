"use client"

import { useState, useEffect } from "react"
import { Plus, Pencil, Trash2, Loader2, Check, ChevronsUpDown, ChevronLeft, ChevronRight, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useToast } from "@/hooks/use-toast"
import { fetchApi } from "@/lib/api-config"
import { cn } from "@/lib/utils"

interface Withdrawal {
  nRetrait: number
  nCheque: string
  nCompte: string
  montant: number
}

interface WithdrawalFormData {
  nCheque: string
  nCompte: string
  montant: number
}

interface Client {
  nCompte: string
  nomClient: string
}

const PAGE_SIZE = 4

export default function WithdrawalList() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null)
  const [formData, setFormData] = useState<WithdrawalFormData>({
    nCheque: "",
    nCompte: "",
    montant: 0,
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()

  const filteredWithdrawals = withdrawals.filter((withdrawal) =>
    withdrawal.nCompte.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Fetch withdrawals and clients on component mount
  useEffect(() => {
    fetchWithdrawals()
    fetchClients()
  }, [])

  // Function to fetch withdrawals
  const fetchWithdrawals = async () => {
    try {
      const data = await fetchApi<Withdrawal[]>("/retraits")
      // Sort withdrawals by nRetrait (assuming it's a number)
      const sortedWithdrawals = data.sort((a, b) => a.nRetrait - b.nRetrait)
      setWithdrawals(sortedWithdrawals)
      setError(null)
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred"
      setError(errorMessage)
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      })
    } finally {
      setLoading(false)
    }
  }

  // Function to fetch clients
  const fetchClients = async () => {
    try {
      const data = await fetchApi<Client[]>("/clients")
      setClients(data)
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred"
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to fetch clients: ${errorMessage}`,
      })
    }
  }

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "montant" ? (value === "" ? 0 : Number.parseFloat(value)) : value,
    }))
  }

  // Handle account selection
  const handleAccountSelect = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      nCompte: value,
    }))
  }

  // Handle form submission (create or update)
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      if (selectedWithdrawal) {
        // Update existing withdrawal
        await fetchApi(`/retraits/${selectedWithdrawal.nRetrait}`, {
          method: "PUT",
          body: JSON.stringify(formData),
        })
        toast({
          title: "Success",
          description: "Withdrawal updated successfully",
        })
      } else {
        // Create new withdrawal
        await fetchApi("/retraits", {
          method: "POST",
          body: JSON.stringify(formData),
        })
        toast({
          title: "Success",
          description: "Withdrawal created successfully",
        })
      }
      // Refresh the withdrawals list
      await fetchWithdrawals()
      // Reset form and close modal
      handleCloseModal()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Operation failed",
      })
    }
  }

  // Handle edit button click
  const handleEdit = (withdrawal: Withdrawal) => {
    setSelectedWithdrawal(withdrawal)
    setFormData({
      nCheque: withdrawal.nCheque,
      nCompte: withdrawal.nCompte,
      montant: withdrawal.montant,
    })
    setIsModalOpen(true)
  }

  // Handle delete confirmation
  const handleDelete = async (withdrawal: Withdrawal) => {
    try {
      // Close the dialog immediately
      setIsDeleteDialogOpen(false)
      setSelectedWithdrawal(null)

      // Optimistically update the UI
      setWithdrawals((prevWithdrawals) => prevWithdrawals.filter((w) => w.nRetrait !== withdrawal.nRetrait))

      // Perform the deletion
      await fetchApi(`/retraits/${withdrawal.nRetrait}`, {
        method: "DELETE",
      })

      // Show success message
      toast({
        title: "Success",
        description: `Withdrawal #${withdrawal.nRetrait} deleted successfully`,
      })

      // Refresh the withdrawals list in the background
      fetchWithdrawals()
    } catch (error) {
      // Show error message
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete withdrawal",
      })

      // Revert the optimistic update
      fetchWithdrawals()
    }
  }

  // Handle modal close
  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedWithdrawal(null)
    setFormData({
      nCheque: "",
      nCompte: "",
      montant: 0,
    })
  }

  // Pagination helpers
  const indexOfLastItem = currentPage * PAGE_SIZE
  const indexOfFirstItem = indexOfLastItem - PAGE_SIZE
  const paginatedWithdrawals = filteredWithdrawals.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredWithdrawals.length / PAGE_SIZE)

  // Loading state
  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p className="text-lg">Loading withdrawals...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header section */}
      <div className="flex items-center justify-between space-x-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Withdrawals</h2>
          <p className="text-muted-foreground">Manage client withdrawals and transactions</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by account number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setSelectedWithdrawal(null)
                  setFormData({ nCheque: "", nCompte: "", montant: 0 })
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                New Withdrawal
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{selectedWithdrawal ? "Edit Withdrawal" : "New Withdrawal"}</DialogTitle>
                <DialogDescription>
                  {selectedWithdrawal ? "Edit withdrawal details below" : "Enter withdrawal details below"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nCheque">Check Number</Label>
                  <Input
                    id="nCheque"
                    name="nCheque"
                    placeholder="Enter check number"
                    value={formData.nCheque}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nCompte">Account Number</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn("w-full justify-between", !formData.nCompte && "text-muted-foreground")}
                      >
                        {formData.nCompte
                          ? clients.find((client) => client.nCompte === formData.nCompte)?.nCompte
                          : "Select account number"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0">
                      <Command>
                        <CommandInput placeholder="Search account number..." />
                        <CommandList>
                          <CommandEmpty>No account number found.</CommandEmpty>
                          <CommandGroup>
                            {clients.map((client) => (
                              <CommandItem
                                key={client.nCompte}
                                value={client.nCompte}
                                onSelect={() => handleAccountSelect(client.nCompte)}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    formData.nCompte === client.nCompte ? "opacity-100" : "opacity-0",
                                  )}
                                />
                                {client.nCompte} - {client.nomClient}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="montant">Amount</Label>
                  <Input
                    id="montant"
                    name="montant"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.montant === 0 ? "" : formData.montant}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  {selectedWithdrawal ? "Update" : "Create"} Withdrawal
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Withdrawals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredWithdrawals.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${filteredWithdrawals.reduce((sum, withdrawal) => sum + withdrawal.montant, 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              $
              {(
                filteredWithdrawals.reduce((sum, withdrawal) => sum + withdrawal.montant, 0) /
                (filteredWithdrawals.length || 1)
              ).toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Withdrawals Table */}
      <Card>
        <CardHeader>
          <CardTitle>Withdrawal History</CardTitle>
          <CardDescription>A list of all withdrawals and their details</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Withdrawal ID</TableHead>
                <TableHead>Check Number</TableHead>
                <TableHead>Account Number</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedWithdrawals.map((withdrawal) => (
                <TableRow key={withdrawal.nRetrait}>
                  <TableCell className="font-medium">{withdrawal.nRetrait}</TableCell>
                  <TableCell>{withdrawal.nCheque}</TableCell>
                  <TableCell>{withdrawal.nCompte}</TableCell>
                  <TableCell>${withdrawal.montant.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(withdrawal)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelectedWithdrawal(withdrawal)
                        setIsDeleteDialogOpen(true)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          {/* <div>
            Page {currentPage} of {totalPages}
          </div> */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </CardFooter>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete withdrawal #{selectedWithdrawal?.nRetrait} and
              remove its data from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setIsDeleteDialogOpen(false)
                setSelectedWithdrawal(null)
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (selectedWithdrawal) {
                  handleDelete(selectedWithdrawal)
                }
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

